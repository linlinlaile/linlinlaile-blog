export default function GithubLoading() {
	return (
		<div className='flex flex-col items-center px-6 pt-32' aria-busy='true' aria-live='polite'>
			<div className='mb-8 space-y-3 text-center'>
				<div className='bg-secondary/20 mx-auto h-7 w-28 animate-pulse rounded' />
				<div className='bg-secondary/15 mx-auto h-4 w-64 animate-pulse rounded' />
			</div>
			<div className='grid w-full max-w-[1200px] grid-cols-2 gap-6 max-md:grid-cols-1'>
				{[1, 2, 3, 4].map(item => <div key={item} className='card static h-52 animate-pulse' />)}
			</div>
		</div>
	)
}
