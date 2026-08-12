export interface MusicTrack {
	id: number
	title: string
	artists: string[]
	album: string
	cover: string
	source: string | null
	available: boolean
	duration: number | null
}

export interface MusicCatalog {
	playlist: {
		id: number
		name: string
		cover: string
		trackCount: number
		updatedAt: string
		sourceUrl: string
	}
	tracks: MusicTrack[]
}

export const MUSIC_CATALOG_URL = '/music/playlist.json'

export function getPlayableTracks(catalog: MusicCatalog | null) {
	return catalog?.tracks.filter(track => track.available && track.source) ?? []
}
