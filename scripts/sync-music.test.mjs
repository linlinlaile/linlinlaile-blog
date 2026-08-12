import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { promises as fs } from 'node:fs'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const scriptPath = fileURLToPath(new URL('./sync-music.mjs', import.meta.url))
const playlistId = '17655082808'
const cookieSentinel = 'MUSIC_SYNC_TEST_COOKIE_SENTINEL'
const image = Buffer.from([0xff, 0xd8, 0xff, 0xd9])

function playlistPayload(tracks, overrides = {}) {
	return {
		playlist: {
			id: Number(playlistId),
			name: 'Test playlist',
			trackCount: tracks.length,
			coverImgUrl: overrides.coverImgUrl,
			tracks,
			...overrides
		}
	}
}

function track(id, coverUrl) {
	return {
		id,
		name: `Track ${id}`,
		ar: [{ name: 'Test artist' }],
		al: { name: 'Test album', picUrl: coverUrl },
		duration: 123000
	}
}

async function createWorkspace() {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), 'music-sync-test-'))
	await fs.mkdir(path.join(root, 'public', 'music'), { recursive: true })
	return root
}

async function startServer(handler) {
	const server = http.createServer(handler)
	await new Promise((resolve, reject) => {
		server.once('error', reject)
		server.listen(0, '127.0.0.1', resolve)
	})
	const address = server.address()
	return {
		baseUrl: `http://127.0.0.1:${address.port}`,
		close: () =>
			new Promise((resolve, reject) => {
				server.closeAllConnections()
				server.close(error => (error ? reject(error) : resolve()))
			})
	}
}

function runSync(root, apiUrl) {
	return new Promise(resolve => {
		const child = spawn(process.execPath, [scriptPath], {
			cwd: root,
			env: {
				...process.env,
				NETEASE_PLAYLIST_API: apiUrl,
				NETEASE_COOKIE: cookieSentinel
			},
			stdio: ['ignore', 'pipe', 'pipe']
		})
		let stdout = ''
		let stderr = ''
		child.stdout.setEncoding('utf8').on('data', chunk => (stdout += chunk))
		child.stderr.setEncoding('utf8').on('data', chunk => (stderr += chunk))
		child.on('close', code => resolve({ code, stdout, stderr }))
	})
}

async function readCatalog(root) {
	return JSON.parse(await fs.readFile(path.join(root, 'public', 'music', 'playlist.json'), 'utf8'))
}

test('writes a deterministic catalog and matches an ID-named local file', async t => {
	const root = await createWorkspace()
	t.after(() => fs.rm(root, { recursive: true, force: true }))
	await fs.writeFile(path.join(root, 'public', 'music', '123.mp3'), 'audio')
	const server = await startServer((request, response) => {
		if (request.url.startsWith('/cover')) {
			response.writeHead(200, { 'Content-Type': 'image/jpeg' }).end(image)
			return
		}
		const coverUrl = `${server.baseUrl}/cover.jpg`
		response.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(playlistPayload([track(123, coverUrl)], { coverImgUrl: coverUrl })))
	})
	t.after(() => server.close())

	const result = await runSync(root, `${server.baseUrl}/playlist`)
	assert.equal(result.code, 0, result.stderr)
	const catalog = await readCatalog(root)
	assert.equal(catalog.tracks[0].source, '/music/123.mp3')
	assert.equal(catalog.tracks[0].available, true)
	assert.equal(catalog.tracks[0].cover, '/music/covers/123.jpg')
	assert.equal(JSON.stringify(catalog).includes(cookieSentinel), false)
	assert.equal(`${result.stdout}${result.stderr}`.includes(cookieSentinel), false)
})

test('uses the fallback cover and marks a missing local file unavailable', async t => {
	const root = await createWorkspace()
	t.after(() => fs.rm(root, { recursive: true, force: true }))
	const server = await startServer((request, response) => {
		if (request.url.startsWith('/missing-cover')) {
			response.writeHead(404).end()
			return
		}
		const coverUrl = `${server.baseUrl}/missing-cover.jpg`
		response.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(playlistPayload([track(456, coverUrl)])))
	})
	t.after(() => server.close())

	const result = await runSync(root, `${server.baseUrl}/playlist`)
	assert.equal(result.code, 0, result.stderr)
	assert.match(result.stderr, /cover 456 could not be cached/)
	assert.match(result.stderr, /missing local audio for 456/)
	const catalog = await readCatalog(root)
	assert.deepEqual(
		{ cover: catalog.tracks[0].cover, source: catalog.tracks[0].source, available: catalog.tracks[0].available },
		{
			cover: '/images/avatar.jpg',
			source: null,
			available: false
		}
	)
})

test('rejects invalid and duplicate playlist tracks without replacing the catalog', async t => {
	for (const [name, payload, diagnostic] of [
		['invalid response', { playlist: {} }, 'playlist response has no tracks array'],
		['duplicate track ID', playlistPayload([track(789), track(789)]), 'duplicate track ID in playlist: 789']
	]) {
		await t.test(name, async t => {
			const root = await createWorkspace()
			t.after(() => fs.rm(root, { recursive: true, force: true }))
			const catalogPath = path.join(root, 'public', 'music', 'playlist.json')
			const previous = '{"previous":true}\n'
			await fs.writeFile(catalogPath, previous)
			const server = await startServer((_request, response) => {
				response.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(payload))
			})
			t.after(() => server.close())

			const result = await runSync(root, `${server.baseUrl}/playlist`)
			assert.equal(result.code, 1)
			assert.match(result.stderr, new RegExp(diagnostic))
			assert.equal(await fs.readFile(catalogPath, 'utf8'), previous)
		})
	}
})

test('reports duplicate local audio IDs and keeps the first supported file', async t => {
	const root = await createWorkspace()
	t.after(() => fs.rm(root, { recursive: true, force: true }))
	await fs.writeFile(path.join(root, 'public', 'music', '321.m4a'), 'audio')
	await fs.writeFile(path.join(root, 'public', 'music', '321.mp3'), 'audio')
	const server = await startServer((_request, response) => {
		response.writeHead(200, { 'Content-Type': 'application/json' }).end(JSON.stringify(playlistPayload([track(321)])))
	})
	t.after(() => server.close())

	const result = await runSync(root, `${server.baseUrl}/playlist`)
	assert.equal(result.code, 0, result.stderr)
	assert.match(result.stderr, /duplicate local audio ID: 321/)
	const catalog = await readCatalog(root)
	assert.match(catalog.tracks[0].source, /^\/music\/321\.(m4a|mp3)$/)
})
