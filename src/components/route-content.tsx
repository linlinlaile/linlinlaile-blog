'use client'

import type { PropsWithChildren } from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

export default function RouteContent({ children }: PropsWithChildren) {
	const pathname = usePathname()
	const reducedMotion = useReducedMotion()
	const routeKey = pathname

	return (
		<AnimatePresence mode='wait' initial={false}>
			<motion.div
				key={routeKey}
				initial={{ opacity: 0, y: reducedMotion ? 0 : 5 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: reducedMotion ? 0 : -3 }}
				transition={{ duration: reducedMotion ? 0 : 0.2, ease: 'easeOut' }}
				className='min-h-full motion-reduce:transform-none motion-reduce:transition-none'>
				{children}
			</motion.div>
		</AnimatePresence>
	)
}
