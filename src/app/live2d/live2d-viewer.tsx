'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Play, Smile } from 'lucide-react'

/** PIXI Application 实例（CDN 加载，无类型包） */
interface PixiAppInstance {
  stage: { addChild: (child: unknown) => void }
  view: HTMLCanvasElement
  destroy: (opts?: { removeView?: boolean }) => void
}

/** Live2D 模型实例 */
interface Live2DModelInstance {
  anchor: { set: (x: number, y: number) => void }
  x: number
  y: number
  scale: { set: (x: number, y: number) => void }
  motion: (group: string, index?: number, priority?: number) => void
  expression: (indexOrName?: number | string) => void
  /** PIXI display object */
  internalModel?: {
    motionManager?: {
      stopAllMotions: () => void
      [key: string]: unknown
    }
    [key: string]: unknown
  }
}

const CDN_SCRIPTS = [
  'https://cdnjs.cloudflare.com/ajax/libs/pixi.js/6.2.0/browser/pixi.min.js',
  'https://cdn.jsdelivr.net/gh/dylanNew/live2d/webgl/Live2D/lib/live2d.min.js',
  'https://cdn.jsdelivr.net/npm/pixi-live2d-display/dist/cubism2.min.js',
]

const MODEL_URL = '/live2d/model.json'

const ALL_MOTIONS = [
  { label: '待机', group: 'idle01' },
  { label: '生气 1', group: 'angry01' },
  { label: '生气 2', group: 'angry02' },
  { label: '生气 3', group: 'angry03' },
  { label: '生气 4', group: 'angry04' },
  { label: '再见', group: 'bye01' },
  { label: '哭泣 1', group: 'cry01' },
  { label: '哭泣 2', group: 'cry02' },
  { label: '感动 1', group: 'kandou01' },
  { label: '感动 2', group: 'kandou02' },
  { label: '决意 1', group: 'kime01' },
  { label: '决意 2', group: 'kime02' },
  { label: '自然 1', group: 'nf01' },
  { label: '自然 2', group: 'nf02' },
  { label: '自然 3', group: 'nf03' },
  { label: '自然 4', group: 'nf04' },
  { label: '自然 5', group: 'nf05' },
  { label: '自然左', group: 'nf_left01' },
  { label: '自然右', group: 'nf_right01' },
  { label: '抿嘴自然 1', group: 'nnf01' },
  { label: '抿嘴自然 2', group: 'nnf02' },
  { label: '抿嘴自然 3', group: 'nnf03' },
  { label: '抿嘴自然 4', group: 'nnf04' },
  { label: '抿嘴自然 5', group: 'nnf05' },
  { label: '抿嘴左', group: 'nnf_left01' },
  { label: '抿嘴右', group: 'nnf_right01' },
  { label: '悲伤 1', group: 'sad01' },
  { label: '悲伤 2', group: 'sad02' },
  { label: '认真 1', group: 'serious01' },
  { label: '认真 2', group: 'serious02' },
  { label: '害羞 1', group: 'shame01' },
  { label: '害羞 2', group: 'shame02' },
  { label: '微笑 1', group: 'smile01' },
  { label: '微笑 2', group: 'smile02' },
  { label: '微笑 3', group: 'smile03' },
  { label: '微笑 4', group: 'smile04' },
  { label: '惊讶', group: 'surprised01' },
  { label: '思考 1', group: 'thinking01' },
  { label: '思考 2', group: 'thinking02' },
  { label: '思考 3', group: 'thinking03' },
  { label: '眨眼', group: 'wink01' },
]

const ALL_EXPRESSIONS = [
  { label: '待机', name: 'idle01' },
  { label: '微笑 1', name: 'smile01' },
  { label: '微笑 2', name: 'smile02' },
  { label: '微笑 3', name: 'smile03' },
  { label: '微笑 4', name: 'smile04' },
  { label: '生气 1', name: 'angry01' },
  { label: '生气 2', name: 'angry02' },
  { label: '生气 3', name: 'angry03' },
  { label: '生气 4', name: 'angry04' },
  { label: '悲伤 1', name: 'sad01' },
  { label: '悲伤 2', name: 'sad02' },
  { label: '哭泣 1', name: 'cry01' },
  { label: '哭泣 2', name: 'cry02' },
  { label: '惊讶', name: 'surprised01' },
  { label: '思考 1', name: 'thinking01' },
  { label: '思考 2', name: 'thinking02' },
  { label: '思考 3', name: 'thinking03' },
  { label: '再见', name: 'bye01' },
  { label: '认真 1', name: 'serious01' },
  { label: '认真 2', name: 'serious02' },
  { label: '害羞 1', name: 'shame01' },
  { label: '害羞 2', name: 'shame02' },
  { label: '感动 1', name: 'kandou01' },
  { label: '感动 2', name: 'kandou02' },
  { label: '决意 1', name: 'kime01' },
  { label: '决意 2', name: 'kime02' },
  { label: '眨眼', name: 'wink01' },
]

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = src
    script.crossOrigin = 'anonymous'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.head.appendChild(script)
  })
}

export default function Live2DViewer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const modelRef = useRef<Live2DModelInstance | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [openMenu, setOpenMenu] = useState<'motion' | 'expression' | null>(null)

  const toggleMenu = (menu: 'motion' | 'expression') => {
    setOpenMenu(prev => (prev === menu ? null : menu))
  }

  const playMotion = (group: string) => {
    try { modelRef.current?.internalModel?.motionManager?.stopAllMotions() } catch {}
    modelRef.current?.motion(group)
    setOpenMenu(null)
  }

  const setExpression = (name: string) => {
    try { modelRef.current?.internalModel?.motionManager?.stopAllMotions() } catch {}
    modelRef.current?.expression(name)
    setOpenMenu(null)
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let app: PixiAppInstance | null = null

    const init = async () => {
      try {
        for (const src of CDN_SCRIPTS) {
          await loadScript(src)
        }

        const PIXI = (window as unknown as { PIXI: unknown }).PIXI
        if (!PIXI) {
          throw new Error('PIXI not found on window')
        }
        ;(window as unknown as { PIXI: unknown }).PIXI = PIXI

        const PIXIApp = (
          PIXI as { Application: new (opts: { view: HTMLCanvasElement; width?: number; height?: number; backgroundAlpha?: number }) => PixiAppInstance }
        ).Application

        const Live2DModel = (PIXI as { live2d?: { Live2DModel: { from: (url: string) => Promise<Live2DModelInstance> } } }).live2d?.Live2DModel

        if (!Live2DModel) {
          throw new Error('PIXI.live2d.Live2DModel not found')
        }

        const width = container.clientWidth || 500
        const height = container.clientHeight || 500
        const canvas = document.createElement('canvas')
        canvas.style.width = '100%'
        canvas.style.height = '100%'
        canvas.style.display = 'block'
        container.appendChild(canvas)

        app = new PIXIApp({
          view: canvas,
          width,
          height,
          backgroundAlpha: 0,
        })

        const model = await Live2DModel.from(MODEL_URL)
        app.stage.addChild(model)

        model.anchor.set(0.5, 0.5)
        model.x = width / 2
        model.y = height / 2
        model.scale.set(0.18, 0.18)

        modelRef.current = model
        setStatus('ready')
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : String(err))
        setStatus('error')
      }
    }

    init()

    return () => {
      if (app !== null && typeof app === 'object' && 'destroy' in app && typeof app.destroy === 'function') {
        app.destroy({ removeView: true })
      }
      container.innerHTML = ''
    }
  }, [])

  return (
    <div className='flex w-full flex-col items-center gap-4'>
      {/* 模型画布 */}
      <div className='relative aspect-square w-full max-w-[500px] overflow-hidden rounded-full'>
        <div ref={containerRef} className='absolute inset-0 h-full w-full' />
        {status === 'loading' && (
          <div className='text-secondary absolute inset-0 flex items-center justify-center'>加载 Live2D 模型中…</div>
        )}
        {status === 'error' && (
          <div className='absolute inset-0 flex items-center justify-center p-4 text-center text-red-500'>{errorMsg}</div>
        )}
      </div>

      {/* 动作 + 表情按钮 */}
      {status === 'ready' && (
        <div className='flex gap-4 pt-4'>
          {/* 动作下拉 */}
          <div className='relative'>
            <button
              onClick={() => toggleMenu('motion')}
              className='flex items-center gap-1.5 rounded-xl border bg-white/60 px-4 py-2 text-sm backdrop-blur-sm hover:bg-white/80 transition-colors'
            >
              <Play className='h-4 w-4' />
              动作
            </button>
            <AnimatePresence>
              {openMenu === 'motion' && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className='absolute bottom-full left-0 mb-1 z-50 max-h-64 w-44 overflow-y-auto rounded-xl border bg-white/95 p-1 shadow-lg backdrop-blur-sm'
                >
                  {ALL_MOTIONS.map(({ label, group }) => (
                    <button
                      key={group}
                      onClick={() => playMotion(group)}
                      className='hover:bg-brand/10 hover:text-brand block w-full rounded-lg px-3 py-1.5 text-left text-xs transition-colors'
                    >
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 表情下拉 */}
          <div className='relative'>
            <button
              onClick={() => toggleMenu('expression')}
              className='flex items-center gap-1.5 rounded-xl border bg-white/60 px-4 py-2 text-sm backdrop-blur-sm hover:bg-white/80 transition-colors'
            >
              <Smile className='h-4 w-4' />
              表情
            </button>
            <AnimatePresence>
              {openMenu === 'expression' && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className='absolute bottom-full left-0 mb-1 z-50 max-h-64 w-44 overflow-y-auto rounded-xl border bg-white/95 p-1 shadow-lg backdrop-blur-sm'
                >
                  {ALL_EXPRESSIONS.map(({ label, name }) => (
                    <button
                      key={name}
                      onClick={() => setExpression(name)}
                      className='hover:bg-brand/10 hover:text-brand block w-full rounded-lg px-3 py-1.5 text-left text-xs transition-colors'
                    >
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  )
}
