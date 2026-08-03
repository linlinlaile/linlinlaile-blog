'use client'

import { useEffect, useState } from 'react'
import { BILIBILI_BVIDS } from './config'
import { VideoGrid, type BilibiliVideoData } from './video-grid'

interface BilibiliApiResponse {
  code: number
  message: string
  data?: BilibiliVideoData
}

export default function BilibiliPage() {
  const [videos, setVideos] = useState<BilibiliVideoData[]>([])
  const [errors, setErrors] = useState<{ bvid: string; message: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchAll() {
      setLoading(true)

      const results = await Promise.allSettled(
        BILIBILI_BVIDS.map(async (bvid): Promise<BilibiliVideoData> => {
          const res = await fetch(`/api/bilibili/view?bvid=${bvid}`)
          const json: BilibiliApiResponse = await res.json()

          if (json.code !== 0 || !json.data) {
            throw new Error(json.message || '获取视频信息失败')
          }

          return json.data
        }),
      )

      if (cancelled) return

      const videos: BilibiliVideoData[] = []
      const errors: { bvid: string; message: string }[] = []

      results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          videos.push(result.value)
        } else {
          errors.push({
            bvid: BILIBILI_BVIDS[i],
            message: result.reason?.message || 'Unknown error',
          })
        }
      })

      setVideos(videos)
      setErrors(errors)
      setLoading(false)
    }

    if (BILIBILI_BVIDS.length > 0) {
      fetchAll()
    } else {
      setLoading(false)
    }

    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center px-6 pt-48'>
        <p className='text-secondary text-sm'>加载中...</p>
      </div>
    )
  }

  return <VideoGrid videos={videos} errors={errors} />
}
