'use client'

import dynamic from 'next/dynamic'

const ImageToolbox = dynamic(() => import('./toolbox'), {
	ssr: false,
	loading: () => <div className='relative min-h-[32rem] px-6 pt-32 pb-12' />
})

export default function ImageToolboxPage() {
	return <ImageToolbox />
}
