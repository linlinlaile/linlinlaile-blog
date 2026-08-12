'use client'

import dynamic from 'next/dynamic'

const Live2DViewer = dynamic(() => import('./live2d-viewer'), {
	ssr: false,
	loading: () => <div className='text-secondary flex aspect-square w-full max-w-[500px] items-center justify-center'>加载 Live2D 模型中...</div>
})

export default function Live2DPage() {
	return (
		<div className='flex h-full items-center justify-center py-8'>
			<Live2DViewer />
		</div>
	)
}
