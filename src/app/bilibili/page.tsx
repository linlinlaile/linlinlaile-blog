'use client'

import { useEffect, useState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { BILIBILI_BVIDS } from './config'
import { VideoGrid, type BilibiliVideoData } from './video-grid'

interface BilibiliApiResponse {
	code: number
	message: string
	data?: BilibiliVideoData
}

const VIDEO_CACHE_KEY = 'bilibili-video-cache-v1'
const VIDEO_CACHE_TTL = 5 * 60 * 1000

interface VideoCache {
	savedAt: number
	videos: BilibiliVideoData[]
	errors: { bvid: string; message: string }[]
}

export default function BilibiliPage() {
	const [videos, setVideos] = useState<BilibiliVideoData[]>([])
	const [errors, setErrors] = useState<{ bvid: string; message: string }[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let cancelled = false

		try {
			const cached = JSON.parse(sessionStorage.getItem(VIDEO_CACHE_KEY) || 'null') as VideoCache | null
			if (cached && Date.now() - cached.savedAt < VIDEO_CACHE_TTL && Array.isArray(cached.videos)) {
				setVideos(cached.videos)
				setErrors(Array.isArray(cached.errors) ? cached.errors : [])
				setLoading(false)
			}
		} catch {
			// Ignore unavailable or malformed browser storage and load from the API.
		}

		async function fetchAll() {
			const results = await Promise.allSettled(
				BILIBILI_BVIDS.map(async (bvid): Promise<BilibiliVideoData> => {
					const response = await fetch(`/api/bilibili/view?bvid=${bvid}`)
					const json: BilibiliApiResponse = await response.json()

					if (!response.ok || json.code !== 0 || !json.data) {
						throw new Error(json.message || '获取视频信息失败')
					}

					return json.data
				})
			)

			if (cancelled) return

			const nextVideos: BilibiliVideoData[] = []
			const nextErrors: { bvid: string; message: string }[] = []

			results.forEach((result, index) => {
				if (result.status === 'fulfilled') {
					nextVideos.push(result.value)
				} else {
					nextErrors.push({
						bvid: BILIBILI_BVIDS[index],
						message: result.reason?.message || '未知错误'
					})
				}
			})

			setVideos(nextVideos)
			setErrors(nextErrors)
			setLoading(false)
			try {
				sessionStorage.setItem(VIDEO_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), videos: nextVideos, errors: nextErrors } satisfies VideoCache))
			} catch {
				// Storage is an optional performance enhancement.
			}
		}

		if (BILIBILI_BVIDS.length) fetchAll()
		else setLoading(false)

		return () => {
			cancelled = true
		}
	}, [])

	if (loading) {
		return (
			<main className='flex min-h-[70vh] items-center justify-center px-6 pt-24'>
				<div className='text-secondary flex items-center gap-2 text-sm' role='status'>
					<LoaderCircle className='h-4 w-4 animate-spin' />
					正在加载视频
				</div>
			</main>
		)
	}

	return <VideoGrid videos={videos} errors={errors} />
}
