'use client'

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
	return (
		<div className='flex min-h-[60vh] items-center justify-center px-6 pt-24'>
			<div className='card static max-w-md space-y-4 text-center'>
				<h2 className='text-primary text-lg font-semibold'>页面加载失败</h2>
				<p className='text-secondary text-sm'>请稍后重试，或返回上一页。</p>
				<button type='button' onClick={() => reset()} className='brand-btn mx-auto'>重试</button>
			</div>
		</div>
	)
}
