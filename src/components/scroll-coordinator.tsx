'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

const keyFor = (pathname: string) => `route-scroll:${pathname}`

export default function ScrollCoordinator() {
	const pathname = usePathname()
	const previousPath = useRef(pathname)
	const popNavigation = useRef(false)

	useEffect(() => {
		if (typeof window === 'undefined') return
		const previous = previousPath.current
		const save = () => sessionStorage.setItem(keyFor(previous), String(window.scrollY))
		window.addEventListener('scroll', save, { passive: true })
		return () => {
			save()
			window.removeEventListener('scroll', save)
		}
	}, [pathname])

	useEffect(() => {
		if (typeof window === 'undefined') return
		const isSameRoute = previousPath.current === pathname
		previousPath.current = pathname
		if (isSameRoute) return

		const hash = window.location.hash
		if (hash) {
			requestAnimationFrame(() => document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView())
			return
		}

		const stored = popNavigation.current ? sessionStorage.getItem(keyFor(pathname)) : null
		popNavigation.current = false
		if (stored) {
			const y = Number(stored)
			requestAnimationFrame(() => window.scrollTo({ top: Number.isFinite(y) ? y : 0, behavior: 'auto' }))
		} else {
			window.scrollTo({ top: 0, behavior: 'auto' })
		}
	}, [pathname])

	useEffect(() => {
		if (typeof window === 'undefined') return
		const onPopState = () => {
			popNavigation.current = true
			requestAnimationFrame(() => {
				const y = Number(sessionStorage.getItem(keyFor(window.location.pathname)))
				if (Number.isFinite(y)) window.scrollTo({ top: y, behavior: 'auto' })
			})
		}
		window.addEventListener('popstate', onPopState)
		return () => window.removeEventListener('popstate', onPopState)
	}, [])

	return null
}
