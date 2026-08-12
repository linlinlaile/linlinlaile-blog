'use client'

import { useEffect, useMemo } from 'react'
import { motion } from 'motion/react'
import { Pause, Play, Repeat, Shuffle, SkipBack, SkipForward } from 'lucide-react'
import clsx from 'clsx'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from '@/app/(home)/stores/config-store'
import { getNextRepeatMode, useCurrentMusicTrack, useMusicStore } from '@/hooks/use-music'
import { HomeDraggableLayer } from '../app/(home)/home-draggable-layer'
import { CARD_SPACING } from '@/consts'
import { usePathname } from 'next/navigation'

function formatTime(value: number) {
	if (!Number.isFinite(value) || value < 0) return '0:00'
	const minutes = Math.floor(value / 60)
	const seconds = Math.floor(value % 60)
	return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

interface ControlsProps {
	compact?: boolean
}

function Controls({ compact = false }: ControlsProps) {
	const track = useCurrentMusicTrack()
	const { isPlaying, progress, duration, repeatMode, togglePlay, previous, next, seek, setRepeatMode } = useMusicStore()
	if (!track) return null
	const nextRepeat = getNextRepeatMode(repeatMode)
	const playButton = (
		<button
			type='button'
			title={isPlaying ? '暂停' : '播放'}
			onClick={() => void togglePlay()}
			className='bg-brand flex size-9 shrink-0 items-center justify-center rounded-full text-white hover:opacity-80'>
			{isPlaying ? <Pause className='size-4' /> : <Play className='ml-0.5 size-4' />}
		</button>
	)

	if (compact) return <div className='flex items-center'>{playButton}</div>

	return (
		<div className='flex min-w-0 items-center gap-2'>
			<button type='button' title='上一首' onClick={() => void previous()} className='text-secondary hover:text-brand shrink-0 p-1'>
				<SkipBack className='size-4' />
			</button>
			{playButton}
			<button type='button' title='下一首' onClick={() => void next()} className='text-secondary hover:text-brand shrink-0 p-1'>
				<SkipForward className='size-4' />
			</button>
			<button type='button' title={`播放模式：${repeatMode}`} onClick={() => setRepeatMode(nextRepeat)} className='text-brand shrink-0 p-1'>
				{repeatMode === 'shuffle' ? <Shuffle className='size-4' /> : <Repeat className='size-4' />}
			</button>
			<div className='text-secondary ml-1 shrink-0 text-[10px] tabular-nums'>
				{formatTime(progress)} / {formatTime(duration)}
			</div>
			<input
				aria-label='播放进度'
				type='range'
				min={0}
				max={duration || 0}
				value={Math.min(progress, duration || 0)}
				disabled={!duration}
				onChange={event => seek(Number(event.target.value))}
				className='range-track min-w-0 flex-1'
			/>
		</div>
	)
}

function FloatingPlayer() {
	return (
		<div className='bg-card fixed bottom-4 left-1/2 z-50 hidden w-[min(52rem,calc(100vw-2rem))] -translate-x-1/2 items-center gap-4 rounded-2xl border p-3 shadow-lg backdrop-blur sm:flex'>
			<div className='min-w-0 flex-1'>
				<TrackInfo />
			</div>
			<div className='min-w-0 flex-[3]'>
				<Controls />
			</div>
		</div>
	)
}

function TrackInfo({ compact = false }: { compact?: boolean }) {
	const track = useCurrentMusicTrack()
	if (!track) return null
	return (
		<div className={clsx('flex min-w-0 items-center', compact ? 'gap-2' : 'gap-3')}>
			<img src={track.cover} alt='' className={clsx('shrink-0 rounded-xl object-cover', compact ? 'size-10' : 'size-11')} />
			<div className='min-w-0'>
				<div className='text-primary truncate text-sm font-medium'>{track.title}</div>
				<div className='text-secondary truncate text-xs'>{track.artists.join(' / ') || track.album}</div>
			</div>
		</div>
	)
}

export default function MusicCard() {
	const pathname = usePathname()
	const center = useCenterStore()
	const { cardStyles } = useConfigStore()
	const styles = cardStyles.musicCard
	const hiCardStyles = cardStyles.hiCard
	const clockCardStyles = cardStyles.clockCard
	const calendarCardStyles = cardStyles.calendarCard
	const { catalog } = useMusicStore()
	const loadCatalog = useMusicStore(state => state.loadCatalog)
	const currentTrack = useCurrentMusicTrack()
	const isHomePage = pathname === '/'
	const isMusicPage = pathname === '/music'

	useEffect(() => {
		if (isHomePage || isMusicPage) {
			void loadCatalog()
		}
	}, [isHomePage, isMusicPage, loadCatalog])

	const position = useMemo(() => {
		return {
			x: styles.offsetX !== null ? center.x + styles.offsetX : center.x + CARD_SPACING + hiCardStyles.width / 2 - styles.offset,
			y: styles.offsetY !== null ? center.y + styles.offsetY : center.y - clockCardStyles.offset + CARD_SPACING + calendarCardStyles.height + CARD_SPACING
		}
	}, [center, styles, hiCardStyles, clockCardStyles, calendarCardStyles])

	if (!catalog || !currentTrack) return null

	return (
		<>
			{isHomePage ? (
				<motion.div layout='position' key='home-player'>
				<HomeDraggableLayer cardKey='musicCard' x={position.x} y={position.y} width={styles.width} height={styles.height}>
					<Card
						order={styles.order}
						width={styles.width}
						height={styles.height}
						x={position.x}
						y={position.y}
						className='hidden flex-col justify-center p-2! sm:flex'>
						<div className='flex items-center justify-between gap-2'>
							<TrackInfo compact />
							<Controls compact />
						</div>
					</Card>
				</HomeDraggableLayer>
				</motion.div>
			) : currentTrack ? (
				<motion.div layout='position' key='floating-player'><FloatingPlayer /></motion.div>
			) : null}
			<motion.div layout='position' className='bg-card fixed right-3 bottom-3 left-3 z-50 flex items-center gap-2 rounded-2xl border p-2 shadow-lg backdrop-blur sm:hidden'>
				<TrackInfo compact />
				<div className='ml-auto'>
					<Controls compact />
				</div>
			</motion.div>
		</>
	)
}
