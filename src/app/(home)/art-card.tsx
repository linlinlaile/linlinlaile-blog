'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { useConfigStore } from './stores/config-store'
import { CARD_SPACING } from '@/consts'
import { useRouter } from 'next/navigation'
import { HomeDraggableLayer } from './home-draggable-layer'

// 从 list.json 加载图片列表
const DEFAULT_IMAGES = ['/images/art/1c7b726fe720679b.jpg']
let cachedImages: string[] | null = null

async function loadPictureUrls(): Promise<string[]> {
  if (cachedImages) return cachedImages
  try {
    const res = await fetch('/pictures')
    cachedImages = DEFAULT_IMAGES
    return cachedImages
  } catch {
    cachedImages = DEFAULT_IMAGES
    return cachedImages
  }
}

export default function ArtCard() {
  const center = useCenterStore()
  const { cardStyles, siteContent } = useConfigStore()
  const router = useRouter()
  const styles = cardStyles.artCard
  const hiCardStyles = cardStyles.hiCard

  const [images, setImages] = useState<string[]>(DEFAULT_IMAGES)
  const [currentIndex, setCurrentIndex] = useState(0)

  // 从 pictures list.json 加载图片列表
  useEffect(() => {
    fetch('/images/pictures/list.json')
      .then(r => r.json())
      .then((data: { images: string[] }[]) => {
        const urls = data.flatMap(p => p.images || [])
        if (urls.length > 0) {
          setImages(urls)
        }
      })
      .catch(() => {})
  }, [])

  // 每 5 秒切换一张
  useEffect(() => {
    if (images.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [images.length])

  const artUrl = images[currentIndex] || DEFAULT_IMAGES[0]

  const x = styles.offsetX !== null ? center.x + styles.offsetX : center.x - styles.width / 2
  const y = styles.offsetY !== null ? center.y + styles.offsetY : center.y - hiCardStyles.height / 2 - styles.height - CARD_SPACING

  return (
    <HomeDraggableLayer cardKey='artCard' x={x} y={y} width={styles.width} height={styles.height}>
      <Card className='overflow-hidden p-2 max-sm:static max-sm:translate-0' order={styles.order} width={styles.width} height={styles.height} x={x} y={y}>
        {siteContent.enableChristmas && (
          <>
            <img
              src='/images/christmas/snow-3.webp'
              alt='Christmas decoration'
              className='pointer-events-none absolute'
              style={{ width: 160, right: -8, top: -16, opacity: 0.9 }}
            />
          </>
        )}

        <div className='relative h-full w-full overflow-hidden rounded-[32px]'>
          <AnimatePresence mode='wait'>
            <motion.img
              key={currentIndex}
              src={artUrl}
              alt='wall art'
              className='absolute inset-0 h-full w-full object-cover'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              onClick={() => router.push('/pictures')}
            />
          </AnimatePresence>
        </div>
      </Card>
    </HomeDraggableLayer>
  )
}
