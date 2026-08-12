'use client'

import { Music, Pause, Play, Repeat, Shuffle, SkipBack, SkipForward } from 'lucide-react'
import clsx from 'clsx'
import { getNextRepeatMode, useCurrentMusicTrack, useMusicStore } from '@/hooks/use-music'

function formatTime(value: number) {
	if (!Number.isFinite(value) || value < 0) return '0:00'
	return `${Math.floor(value / 60)}:${Math.floor(value % 60)
		.toString()
		.padStart(2, '0')}`
}

export default function MusicPage() {
	const { catalog, loading, error, currentTrackId, isPlaying, progress, duration, repeatMode, selectTrack, togglePlay, previous, next, seek, setRepeatMode } =
		useMusicStore()
	const currentTrack = useCurrentMusicTrack()

	if (loading && !catalog) return <div className='text-secondary px-6 pt-48 text-center text-sm'>正在加载歌单…</div>
	if (error && !catalog) return <div className='text-secondary px-6 pt-48 text-center text-sm'>{error}</div>
	if (!catalog) return null

	const nextRepeat = getNextRepeatMode(repeatMode)
	return (
		<div className='mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 pt-32 pb-28 sm:pt-40'>
			<header className='flex items-center gap-4'>
				<img src={catalog.playlist.cover} alt='' className='size-24 rounded-2xl object-cover shadow-md' />
				<div className='min-w-0'>
					<div className='text-brand flex items-center gap-2 text-xs font-medium tracking-[0.18em] uppercase'>
						<Music className='size-4' /> 本地音乐
					</div>
					<h1 className='text-primary mt-2 truncate text-2xl font-semibold'>{catalog.playlist.name}</h1>
					<p className='text-secondary mt-1 text-sm'>{catalog.tracks.length} 首歌曲 · 网易云歌单元数据</p>
				</div>
			</header>

			{currentTrack && (
				<section className='bg-card rounded-2xl border p-4 shadow-sm'>
					<div className='flex items-center gap-3'>
						<img src={currentTrack.cover} alt='' className='size-14 rounded-xl object-cover' />
						<div className='min-w-0 flex-1'>
							<div className='text-primary truncate text-sm font-medium'>{currentTrack.title}</div>
							<div className='text-secondary truncate text-xs'>{currentTrack.artists.join(' / ')}</div>
						</div>
						<button
							type='button'
							title={isPlaying ? '暂停' : '播放'}
							onClick={() => void togglePlay()}
							className='bg-brand flex size-10 shrink-0 items-center justify-center rounded-full text-white'>
							{isPlaying ? <Pause className='size-4' /> : <Play className='ml-0.5 size-4' />}
						</button>
					</div>
					<div className='mt-3 flex items-center gap-2'>
						<button type='button' title='上一首' onClick={() => void previous()} className='text-secondary hover:text-brand p-1'>
							<SkipBack className='size-4' />
						</button>
						<input
							aria-label='播放进度'
							type='range'
							min={0}
							max={duration || 0}
							value={Math.min(progress, duration || 0)}
							disabled={!duration}
							onChange={event => seek(Number(event.target.value))}
							className='range-track'
						/>
						<button type='button' title='下一首' onClick={() => void next()} className='text-secondary hover:text-brand p-1'>
							<SkipForward className='size-4' />
						</button>
						<button type='button' title={`播放模式：${repeatMode}`} onClick={() => setRepeatMode(nextRepeat)} className='text-brand p-1'>
							{repeatMode === 'shuffle' ? <Shuffle className='size-4' /> : <Repeat className='size-4' />}
						</button>
						<span className='text-secondary w-20 text-right text-[10px] tabular-nums'>
							{formatTime(progress)} / {formatTime(duration)}
						</span>
					</div>
				</section>
			)}

			<section className='flex flex-col gap-2'>
				{catalog.tracks.map((track, index) => {
					const active = currentTrackId === track.id
					return (
						<button
							key={track.id}
							type='button'
							disabled={!track.available}
							onClick={() => void selectTrack(track.id, true)}
							className={clsx(
								'flex items-center gap-3 rounded-2xl border px-3 py-2 text-left transition',
								active ? 'border-brand/50 bg-brand/10' : 'bg-card hover:bg-white/50',
								!track.available && 'cursor-not-allowed opacity-45'
							)}>
							<span className='text-secondary w-5 text-center text-xs tabular-nums'>{index + 1}</span>
							<img src={track.cover} alt='' className='size-11 rounded-xl object-cover' />
							<span className='min-w-0 flex-1'>
								<span className='text-primary block truncate text-sm font-medium'>{track.title}</span>
								<span className='text-secondary block truncate text-xs'>{track.artists.join(' / ') || track.album}</span>
							</span>
							<span className='text-secondary shrink-0 text-[10px]'>{track.available ? '本地可播放' : '缺少本地文件'}</span>
						</button>
					)
				})}
			</section>
		</div>
	)
}
