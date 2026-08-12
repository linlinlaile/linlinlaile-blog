export default function Loading() {
	return (
		<div className='flex min-h-[60vh] items-start justify-center px-6 pt-32' aria-busy='true' aria-live='polite'>
			<div className='card static w-full max-w-3xl animate-pulse space-y-4'>
				<div className='bg-secondary/20 h-7 w-1/3 rounded-lg' />
				<div className='bg-secondary/15 h-4 w-2/3 rounded-lg' />
				<div className='bg-secondary/15 h-24 w-full rounded-2xl' />
			</div>
		</div>
	)
}
