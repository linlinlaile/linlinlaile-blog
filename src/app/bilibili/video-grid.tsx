'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { ExternalLink, Play, ThumbsUp, Coins, Star } from 'lucide-react'
import { thousandsSeparator } from '@/lib/utils'

export interface BilibiliVideoData {
  bvid: string
  title: string
  pic: string
  desc: string
  owner: { name: string; face: string; mid: number }
  stat: {
    view: number
    danmaku: number
    reply: number
    favorite: number
    coin: number
    like: number
    share: number
  }
  cid: number
  duration: number
  pubdate: number
}

interface VideoGridProps {
  videos: BilibiliVideoData[]
  errors: { bvid: string; message: string }[]
}

export function VideoGrid({ videos, errors }: VideoGridProps) {
  if (videos.length === 0 && errors.length === 0) {
    return (
      <div className='text-secondary py-6 text-center text-sm'>暂无视频数据，请在 config.ts 中配置 BV 号</div>
    )
  }

  return (
    <div className='flex flex-col items-center justify-center px-6 pt-32 pb-12'>
      <div className='mb-8 text-center'>
        <h1 className='text-primary text-2xl font-bold'>Bilibili</h1>
        <p className='text-secondary mt-2 text-sm'>视频创作与分享</p>
      </div>

      <div className='grid w-full max-w-[1200px] grid-cols-2 gap-6 max-md:grid-cols-1'>
        {videos.map((video, index) => (
          <VideoCard key={video.bvid} video={video} index={index} />
        ))}

        {/* 失败的 BV 号 */}
        {errors.map(err => (
          <div key={err.bvid} className='card flex items-center gap-3 border-red-200 bg-red-50/50'>
            <div className='text-sm text-red-500'>
              <span className='font-medium'>{err.bvid}</span>：{err.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function VideoCard({ video, index }: { video: BilibiliVideoData; index: number }) {
  const bvid = video.bvid
  const url = `https://www.bilibili.com/video/${bvid}`

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      viewport={{ once: true }}
      className='card relative flex flex-col gap-4 overflow-hidden'
    >
      {/* 封面 */}
      <Link href={url} target='_blank' rel='noopener noreferrer' className='group relative block overflow-hidden rounded-2xl'>
        <img
          src={video.pic.replace(/^http:/, 'https:')}
          alt={video.title}
          className='aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-105'
          loading='lazy'
          referrerPolicy='no-referrer'
        />
        {/* 时长角标 */}
        <span className='absolute right-2 bottom-2 rounded bg-black/70 px-1.5 py-0.5 text-[11px] text-white'>
          {formatDuration(video.duration)}
        </span>
      </Link>

      {/* 标题 */}
      <Link
        href={url}
        target='_blank'
        rel='noopener noreferrer'
        className='text-primary hover:text-brand inline-flex items-center gap-1.5 text-base font-semibold transition-colors'
      >
        <span className='line-clamp-2'>{video.title}</span>
        <ExternalLink className='h-3.5 w-3.5 shrink-0 opacity-50' />
      </Link>

      {/* 描述 */}
      {video.desc && (
        <p className='text-secondary line-clamp-2 text-xs leading-relaxed'>{video.desc}</p>
      )}

      {/* UP 主 */}
      <Link
        href={`https://space.bilibili.com/${video.owner.mid}`}
        target='_blank'
        rel='noopener noreferrer'
        className='flex items-center gap-2'
      >
        <img
          src={video.owner.face.replace(/^http:/, 'https:')}
          alt={video.owner.name}
          className='h-6 w-6 rounded-full'
          loading='lazy'
          referrerPolicy='no-referrer'
        />
        <span className='text-secondary text-xs hover:text-brand transition-colors'>
          {video.owner.name}
        </span>
      </Link>

      {/* 统计数据 */}
      <div className='text-secondary mt-auto flex flex-wrap items-center gap-4 text-xs'>
        <span className='flex items-center gap-1'>
          <Play className='h-3.5 w-3.5' />
          {thousandsSeparator(video.stat.view)}
        </span>
        <span className='flex items-center gap-1'>
          <ThumbsUp className='h-3.5 w-3.5' />
          {thousandsSeparator(video.stat.like)}
        </span>
        <span className='flex items-center gap-1'>
          <Coins className='h-3.5 w-3.5' />
          {thousandsSeparator(video.stat.coin)}
        </span>
        <span className='flex items-center gap-1'>
          <Star className='h-3.5 w-3.5' />
          {thousandsSeparator(video.stat.favorite)}
        </span>

        <Link
          href={url}
          target='_blank'
          rel='noopener noreferrer'
          className='bg-card hover:bg-bg ml-auto rounded-lg border px-3 py-1.5 font-medium transition-colors'
        >
          观看
        </Link>
      </div>
    </motion.div>
  )
}
