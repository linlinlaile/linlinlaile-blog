'use client'

import dynamic from 'next/dynamic'
import { useWriteStore } from './stores/write-store'
import { usePreviewStore } from './stores/preview-store'
import { useEffect } from 'react'

const WriteEditor = dynamic(() => import('./components/editor').then(module => ({ default: module.WriteEditor })), {
	loading: () => <div className='card min-h-[24rem] flex-1 animate-pulse' />
})
const WriteSidebar = dynamic(() => import('./components/sidebar').then(module => ({ default: module.WriteSidebar })), {
	loading: () => <div className='card hidden min-h-[24rem] w-80 animate-pulse lg:block' />
})
const WriteActions = dynamic(() => import('./components/actions').then(module => ({ default: module.WriteActions })), {
	loading: () => null
})
const WritePreview = dynamic(() => import('./components/preview').then(module => ({ default: module.WritePreview })), {
	loading: () => <div className='card min-h-[24rem] animate-pulse' />
})

export default function WritePage() {
	const { form, cover, reset } = useWriteStore()
	useEffect(() => reset(), [])
	const { isPreview, closePreview } = usePreviewStore()

	const coverPreviewUrl = cover ? (cover.type === 'url' ? cover.url : cover.previewUrl) : null

	return isPreview ? (
		<WritePreview form={form} coverPreviewUrl={coverPreviewUrl} onClose={closePreview} />
	) : (
		<>
			<div className='flex h-full justify-center gap-6 px-6 pt-24 pb-12'>
				<WriteEditor />
				<WriteSidebar />
			</div>

			<WriteActions />
		</>
	)
}
