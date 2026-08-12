export default function BlogLoading() {
	return (
		<div className='flex flex-col items-center gap-6 px-6 pt-24' aria-busy='true' aria-live='polite'>
			{[1, 2, 3].map(item => (
				<div key={item} className='card static w-full max-w-[840px] animate-pulse space-y-5'>
					<div className='bg-secondary/20 h-5 w-32 rounded' />
					{[1, 2, 3, 4].map(row => <div key={row} className='bg-secondary/15 h-4 w-full rounded' />)}
				</div>
			))}
		</div>
	)
}
