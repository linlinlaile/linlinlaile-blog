'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { AlertCircle, CalendarDays, Coins, ExternalLink, Eye, Flame, Play, Search, Star, ThumbsUp, Video } from 'lucide-react'
import { thousandsSeparator } from '@/lib/utils'
import { BILIBILI_PROFILE } from './config'

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

type SortMode = 'latest' | 'popular'

export function VideoGrid({ videos, errors }: VideoGridProps) {
	const [query, setQuery] = useState('')
	const [sortMode, setSortMode] = useState<SortMode>('latest')
	const owner = videos[0]?.owner

	const filteredVideos = useMemo(() => {
		const keyword = query.trim().toLocaleLowerCase('zh-CN')
		const result = keyword ? videos.filter(video => `${video.title} ${video.desc}`.toLocaleLowerCase('zh-CN').includes(keyword)) : [...videos]

		return result.sort((a, b) => (sortMode === 'latest' ? b.pubdate - a.pubdate : b.stat.view - a.stat.view))
	}, [query, sortMode, videos])

	return (
		<main className='mx-auto w-full max-w-[1280px] px-5 pt-28 pb-16 sm:px-8'>
			<section className='flex items-center justify-between gap-6 border-b pb-7 max-sm:items-start'>
				<div className='flex min-w-0 items-center gap-4'>
					{owner?.face ? (
						<img
							src={toHttps(owner.face)}
							alt={owner.name}
							className='h-16 w-16 shrink-0 rounded-full border object-cover sm:h-20 sm:w-20'
							referrerPolicy='no-referrer'
						/>
					) : (
						<div className='bg-card text-brand flex h-16 w-16 shrink-0 items-center justify-center rounded-full border sm:h-20 sm:w-20'>
							<Video className='h-7 w-7' />
						</div>
					)}
					<div className='min-w-0'>
						<p className='text-secondary mb-1 text-xs font-medium'>BILIBILI CREATOR</p>
						<h1 className='text-primary truncate text-xl font-bold sm:text-2xl'>{owner?.name || BILIBILI_PROFILE.name}</h1>
						<p className='text-secondary mt-2 line-clamp-2 max-w-2xl text-sm leading-6'>{BILIBILI_PROFILE.bio}</p>
					</div>
				</div>
				<Link
					href={BILIBILI_PROFILE.spaceUrl}
					target='_blank'
					rel='noopener noreferrer'
					className='bg-brand btn-rounded flex shrink-0 items-center gap-2 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 max-sm:px-3'>
					<span className='max-sm:hidden'>全部投稿</span>
					<ExternalLink className='h-4 w-4' />
				</Link>
			</section>

			<section className='mt-8 flex items-end justify-between gap-5 max-md:flex-col max-md:items-stretch'>
				<div>
					<h2 className='text-primary text-lg font-semibold'>视频作品</h2>
					<p className='text-secondary mt-1 text-sm'>已收录 {videos.length} 个视频</p>
				</div>

				<div className='flex gap-3 max-sm:flex-col'>
					<label className='bg-card flex h-10 min-w-64 items-center gap-2 rounded-lg border px-3'>
						<Search className='text-secondary h-4 w-4 shrink-0' />
						<span className='sr-only'>搜索视频</span>
						<input
							value={query}
							onChange={event => setQuery(event.target.value)}
							placeholder='搜索标题或简介'
							className='text-primary min-w-0 flex-1 bg-transparent text-sm'
						/>
					</label>
					<div className='bg-card grid h-10 grid-cols-2 rounded-lg border p-1' aria-label='视频排序'>
						<SortButton active={sortMode === 'latest'} onClick={() => setSortMode('latest')}>
							<CalendarDays className='h-3.5 w-3.5' /> 最新
						</SortButton>
						<SortButton active={sortMode === 'popular'} onClick={() => setSortMode('popular')}>
							<Flame className='h-3.5 w-3.5' /> 热门
						</SortButton>
					</div>
				</div>
			</section>

			{filteredVideos.length ? (
				<section className='mt-5 grid grid-cols-3 gap-x-5 gap-y-8 max-lg:grid-cols-2 max-sm:grid-cols-1'>
					{filteredVideos.map((video, index) => (
						<VideoCard key={video.bvid} video={video} index={index} />
					))}
				</section>
			) : (
				<section className='text-secondary mt-5 flex min-h-60 flex-col items-center justify-center border-y text-sm'>
					<Search className='mb-3 h-6 w-6 opacity-50' />
					没有找到匹配的视频
				</section>
			)}

			{errors.length > 0 && (
				<details className='text-secondary mt-10 border-t pt-5 text-xs'>
					<summary className='flex cursor-pointer list-none items-center gap-2'>
						<AlertCircle className='h-4 w-4' />
						{errors.length} 个视频暂时无法加载
					</summary>
					<ul className='mt-3 space-y-1 pl-6'>
						{errors.map(error => (
							<li key={error.bvid}>
								{error.bvid}: {error.message}
							</li>
						))}
					</ul>
				</details>
			)}
		</main>
	)
}

function SortButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
	return (
		<button
			type='button'
			onClick={onClick}
			className={`flex items-center justify-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors ${
				active ? 'bg-brand text-white' : 'text-secondary hover:text-primary'
			}`}>
			{children}
		</button>
	)
}

function VideoCard({ video, index }: { video: BilibiliVideoData; index: number }) {
	const url = `https://www.bilibili.com/video/${video.bvid}`

	return (
		<motion.article
			initial={{ opacity: 0, y: 12 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: Math.min(index, 6) * 0.04 }}
			viewport={{ once: true, margin: '80px' }}
			className='card !static relative flex min-w-0 flex-col gap-1 overflow-hidden !rounded-2xl p-3 transition-shadow hover:shadow-lg sm:p-4'>
			<Link href={url} target='_blank' rel='noopener noreferrer' className='bg-card relative block aspect-video overflow-hidden rounded-xl'>
				<img
					src={toHttps(video.pic)}
					alt={video.title}
					className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025]'
					loading='lazy'
					referrerPolicy='no-referrer'
				/>
				<span className='absolute right-2 bottom-2 rounded bg-black/75 px-1.5 py-1 text-[11px] leading-none text-white'>{formatDuration(video.duration)}</span>
				<span className='absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/15'>
					<span className='flex h-10 w-10 scale-90 items-center justify-center rounded-full bg-white/90 text-black opacity-0 shadow transition-all group-hover:scale-100 group-hover:opacity-100'>
						<Play className='ml-0.5 h-4 w-4 fill-current' />
					</span>
				</span>
			</Link>

			<div className='px-1 pt-3'>
				<Link
					href={url}
					target='_blank'
					rel='noopener noreferrer'
					className='text-primary hover:text-brand line-clamp-2 min-h-11 text-[15px] leading-[22px] font-semibold transition-colors'>
					{video.title}
				</Link>
				<div className='text-secondary mt-2 flex items-center gap-3 text-xs max-sm:gap-2'>
					<span className='flex items-center gap-1'>
						<Eye className='h-3.5 w-3.5' /> {formatCount(video.stat.view)}
					</span>
					<span className='flex items-center gap-1'>
						<ThumbsUp className='h-3.5 w-3.5' /> {formatCount(video.stat.like)}
					</span>
					<span className='flex items-center gap-1' title='投币数'>
						<Coins className='h-3.5 w-3.5' /> {formatCount(video.stat.coin)}
					</span>
					<span className='flex items-center gap-1' title='收藏数'>
						<Star className='h-3.5 w-3.5' /> {formatCount(video.stat.favorite)}
					</span>
					<time className='ml-auto' dateTime={new Date(video.pubdate * 1000).toISOString()}>
						{formatDate(video.pubdate)}
					</time>
				</div>
			</div>
		</motion.article>
	)
}

function toHttps(url: string) {
	return url.replace(/^http:/, 'https:')
}

function formatDuration(seconds: number) {
	const hours = Math.floor(seconds / 3600)
	const minutes = Math.floor((seconds % 3600) / 60)
	const remainingSeconds = Math.floor(seconds % 60)
	const parts = hours ? [hours, minutes, remainingSeconds] : [minutes, remainingSeconds]
	return parts.map((part, index) => (index === 0 ? String(part) : String(part).padStart(2, '0'))).join(':')
}

function formatDate(timestamp: number) {
	return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(timestamp * 1000)).replaceAll('/', '-')
}

function formatCount(value: number) {
	if (value >= 10000) return `${(value / 10000).toFixed(value >= 100000 ? 0 : 1)}万`
	return thousandsSeparator(value)
}
