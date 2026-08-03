'use client'

import { Music } from 'lucide-react'

export default function MusicPage() {
  return (
    <div className='flex flex-col items-center justify-center px-6 pt-48 pb-12'>
      <div className='card flex max-w-sm flex-col items-center gap-4 p-8 text-center'>
        <Music className='text-brand h-12 w-12' />
        <h1 className='text-primary text-xl font-bold'>音乐</h1>
        <p className='text-secondary text-sm leading-relaxed'>
          音乐播放器正在开发中。播放器将支持本地音乐和 Bilibili 音频源。
        </p>
        <div className='text-secondary mt-2 rounded-lg border bg-white/60 px-4 py-2 text-xs'>
          当前可通过右下角浮动播放器播放音乐
        </div>
      </div>
    </div>
  )
}
