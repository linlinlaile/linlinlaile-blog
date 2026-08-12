import { promises as fs } from 'node:fs'
import path from 'node:path'

const DEFAULT_PLAYLIST_ID = '17655082808'
const playlistId = process.argv[2] || process.env.NETEASE_PLAYLIST_ID || DEFAULT_PLAYLIST_ID
const root = process.cwd()
const musicDir = path.join(root, 'public', 'music')
const coversDir = path.join(musicDir, 'covers')
const catalogPath = path.join(musicDir, 'playlist.json')
const apiBase = process.env.NETEASE_PLAYLIST_API || 'https://music.163.com/api/playlist/detail'
const neteaseCookie = process.env.NETEASE_COOKIE?.trim()
const supportedExtensions = ['.mp3', '.m4a', '.ogg', '.wav']
const userAgent = 'Mozilla/5.0 (compatible; 2025-blog-music-sync/1.0)'

const log = message => console.log(`[music:sync] ${message}`)
const warn = message => console.warn(`[music:sync] warning: ${message}`)
const requestHeaders = () => ({
	'User-Agent': userAgent,
	Accept: 'application/json',
	...(neteaseCookie ? { Cookie: neteaseCookie } : {})
})

async function readLocalSources() {
	const entries = await fs.readdir(musicDir, { withFileTypes: true })
	const sources = new Map()

	for (const entry of entries) {
		if (!entry.isFile()) continue
		const extension = path.extname(entry.name).toLowerCase()
		if (!supportedExtensions.includes(extension)) continue
		const id = path.basename(entry.name, extension)
		if (!/^\d+$/.test(id)) {
			warn(`ignored non-ID audio file: ${entry.name}`)
			continue
		}
		if (sources.has(id)) warn(`duplicate local audio ID: ${id}; keeping ${sources.get(id).name}`)
		else sources.set(id, { name: entry.name, source: `/music/${entry.name}` })
	}

	return sources
}

function normalizePlaylist(payload) {
	const playlist = payload?.playlist || payload?.result
	if (!playlist || !Array.isArray(playlist.tracks)) throw new Error('playlist response has no tracks array')

	const seen = new Set()
	const tracks = playlist.tracks.map(track => {
		if (!track?.id || !track.name) throw new Error('playlist contains a track without id or name')
		const id = Number(track.id)
		if (!Number.isSafeInteger(id)) throw new Error(`invalid track ID: ${track.id}`)
		if (seen.has(id)) throw new Error(`duplicate track ID in playlist: ${id}`)
		seen.add(id)
		const coverUrl = track.album?.picUrl || track.al?.picUrl || track.album?.blurPicUrl || null
		return {
			id,
			title: String(track.name),
			artists: (track.artists || track.ar || []).map(artist => String(artist.name)).filter(Boolean),
			album: String(track.album?.name || track.al?.name || ''),
			coverUrl,
			duration: Number.isFinite(track.duration) ? track.duration : null
		}
	})

	return {
		id: Number(playlist.id || playlistId),
		name: String(playlist.name || `NetEase playlist ${playlistId}`),
		coverUrl: playlist.coverImgUrl || playlist.coverUrl || null,
		trackCount: Number(playlist.trackCount || tracks.length),
		tracks
	}
}

async function fetchJson(url) {
	const response = await fetch(url, { headers: requestHeaders() })
	if (!response.ok) throw new Error(`request failed with HTTP ${response.status}`)
	return response.json()
}

async function cacheCover(id, coverUrl) {
	if (!coverUrl) return '/images/avatar.jpg'
	const target = path.join(coversDir, `${id}.jpg`)
	try {
		const imageUrl = new URL(coverUrl)
		if (imageUrl.protocol === 'http:' && !['localhost', '127.0.0.1', '::1'].includes(imageUrl.hostname)) imageUrl.protocol = 'https:'
		if (!imageUrl.searchParams.has('param')) imageUrl.searchParams.set('param', '500y500')
		const response = await fetch(imageUrl, { headers: requestHeaders() })
		if (!response.ok) throw new Error(`HTTP ${response.status}`)
		const buffer = Buffer.from(await response.arrayBuffer())
		await fs.writeFile(target, buffer)
		return `/music/covers/${id}.jpg`
	} catch (error) {
		warn(`cover ${id} could not be cached (${error.message}); using fallback`)
		return '/images/avatar.jpg'
	}
}

async function main() {
	await fs.mkdir(coversDir, { recursive: true })
	const endpoint = new URL(apiBase)
	endpoint.searchParams.set('id', playlistId)
	endpoint.searchParams.set('n', '1000')
	endpoint.searchParams.set('s', '8')
	log(`fetching playlist ${playlistId}${neteaseCookie ? ' with local login session' : ''}`)
	const payload = await fetchJson(endpoint)
	const normalized = normalizePlaylist(payload)
	if (normalized.trackCount !== normalized.tracks.length) {
		warn(`playlist reports ${normalized.trackCount} tracks but endpoint returned ${normalized.tracks.length}; sync is incomplete`)
	}
	const localSources = await readLocalSources()
	const tracks = []

	for (const track of normalized.tracks) {
		const local = localSources.get(String(track.id))
		const cover = await cacheCover(track.id, track.coverUrl)
		tracks.push({
			id: track.id,
			title: track.title,
			artists: track.artists,
			album: track.album,
			cover,
			source: local?.source || null,
			available: Boolean(local),
			duration: track.duration
		})
		if (!local) warn(`missing local audio for ${track.id} - ${track.title}`)
	}

	const catalog = {
		playlist: {
			id: normalized.id,
			name: normalized.name,
			cover: await cacheCover(`playlist-${normalized.id}`, normalized.coverUrl),
			trackCount: normalized.trackCount,
			updatedAt: new Date().toISOString(),
			sourceUrl: `https://music.163.com/playlist?id=${playlistId}`
		},
		tracks
	}

	const temporaryPath = `${catalogPath}.tmp`
	await fs.writeFile(temporaryPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8')
	await fs.rename(temporaryPath, catalogPath)
	log(`wrote ${tracks.length} tracks to ${path.relative(root, catalogPath)}`)
}

main().catch(error => {
	console.error(`[music:sync] error: ${error.message}`)
	process.exitCode = 1
})
