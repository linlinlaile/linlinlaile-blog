'use client'

import { create } from 'zustand'
import type { MusicCatalog, MusicTrack } from '@/lib/music'
import { getPlayableTracks, MUSIC_CATALOG_URL } from '@/lib/music'

export type RepeatMode = 'all' | 'one' | 'shuffle'

const repeatModeOrder: RepeatMode[] = ['all', 'one', 'shuffle']

export function getNextRepeatMode(mode: RepeatMode) {
	return repeatModeOrder[(repeatModeOrder.indexOf(mode) + 1) % repeatModeOrder.length]
}

interface MusicState {
	catalog: MusicCatalog | null
	loading: boolean
	error: string | null
	currentTrackId: number | null
	isPlaying: boolean
	progress: number
	duration: number
	repeatMode: RepeatMode
	loadCatalog: () => Promise<void>
	selectTrack: (trackId: number, autoplay?: boolean) => Promise<void>
	togglePlay: () => Promise<void>
	next: () => Promise<void>
	previous: () => Promise<void>
	seek: (value: number) => void
	setRepeatMode: (mode: RepeatMode) => void
}

let audio: HTMLAudioElement | null = null
let loadPromise: Promise<void> | null = null

function getAudio() {
	if (typeof window === 'undefined') return null
	if (audio) return audio
	audio = new Audio()
	audio.preload = 'metadata'
	audio.addEventListener('timeupdate', () => {
		useMusicStore.setState({ progress: audio?.currentTime ?? 0 })
	})
	audio.addEventListener('loadedmetadata', () => {
		useMusicStore.setState({ duration: Number.isFinite(audio?.duration) ? audio!.duration : 0 })
	})
	audio.addEventListener('play', () => useMusicStore.setState({ isPlaying: true, error: null }))
	audio.addEventListener('pause', () => useMusicStore.setState({ isPlaying: false }))
	audio.addEventListener('error', () => useMusicStore.setState({ isPlaying: false, error: '当前音频无法播放，请检查本地文件格式。' }))
	audio.addEventListener('ended', () => {
		const state = useMusicStore.getState()
		if (state.repeatMode === 'one') {
			void state.selectTrack(state.currentTrackId ?? 0, true)
			return
		}
		void state.next()
	})
	return audio
}

function findTrack(catalog: MusicCatalog | null, trackId: number | null) {
	return catalog?.tracks.find(track => track.id === trackId) ?? null
}

async function playTrack(track: MusicTrack, autoplay: boolean) {
	const player = getAudio()
	if (!player || !track.source) return
	if (player.src !== new URL(track.source, window.location.origin).href) {
		player.src = track.source
		player.load()
	}
	if (autoplay) await player.play()
}

export const useMusicStore = create<MusicState>((set, get) => ({
	catalog: null,
	loading: false,
	error: null,
	currentTrackId: null,
	isPlaying: false,
	progress: 0,
	duration: 0,
	repeatMode: 'all',
	loadCatalog: async () => {
		if (get().catalog) return
		if (loadPromise) {
			await loadPromise
			return
		}
		set({ loading: true, error: null })
		loadPromise = fetch(MUSIC_CATALOG_URL, { cache: 'no-store' })
			.then(async response => {
				if (!response.ok) throw new Error(`音乐目录加载失败 (${response.status})`)
				const catalog = (await response.json()) as MusicCatalog
				const first = getPlayableTracks(catalog)[0]
				set({ catalog, currentTrackId: first?.id ?? null, loading: false })
			})
			.catch(error => {
				set({ loading: false, error: error instanceof Error ? error.message : '音乐目录加载失败' })
				throw error
			})
			.finally(() => {
				loadPromise = null
			})
		await loadPromise
	},
	selectTrack: async (trackId, autoplay = false) => {
		const track = findTrack(get().catalog, trackId)
		if (!track?.available || !track.source) return
		set({ currentTrackId: track.id, progress: 0, duration: 0, error: null })
		try {
			await playTrack(track, autoplay)
		} catch {
			set({ isPlaying: false, error: '浏览器阻止了自动播放，请点击播放按钮。' })
		}
	},
	togglePlay: async () => {
		const state = get()
		const player = getAudio()
		if (!player) return
		if (state.isPlaying) {
			player.pause()
			return
		}
		const track = findTrack(state.catalog, state.currentTrackId) || getPlayableTracks(state.catalog)[0]
		if (!track) return
		if (state.currentTrackId !== track.id) set({ currentTrackId: track.id })
		try {
			await playTrack(track, true)
		} catch {
			set({ error: '浏览器阻止了自动播放，请再次点击播放按钮。' })
		}
	},
	next: async () => {
		const playable = getPlayableTracks(get().catalog)
		if (!playable.length) return
		const current = playable.findIndex(track => track.id === get().currentTrackId)
		if (get().repeatMode === 'shuffle') {
			const candidates = playable.filter(track => track.id !== get().currentTrackId)
			const target = candidates[Math.floor(Math.random() * candidates.length)] || playable[0]
			await get().selectTrack(target.id, true)
			return
		}
		const nextIndex = current + 1
		const target = playable[nextIndex % playable.length]
		await get().selectTrack(target.id, true)
	},
	previous: async () => {
		const playable = getPlayableTracks(get().catalog)
		if (!playable.length) return
		const current = playable.findIndex(track => track.id === get().currentTrackId)
		if ((get().progress > 3 || current < 0) && getAudio()) {
			getAudio()!.currentTime = 0
			set({ progress: 0 })
			return
		}
		const target = playable[(current - 1 + playable.length) % playable.length]
		await get().selectTrack(target.id, true)
	},
	seek: value => {
		const player = getAudio()
		if (!player || !Number.isFinite(value)) return
		player.currentTime = value
		set({ progress: value })
	},
	setRepeatMode: repeatMode => set({ repeatMode })
}))

export function useCurrentMusicTrack() {
	return useMusicStore(state => findTrack(state.catalog, state.currentTrackId))
}
