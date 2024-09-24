'use client' // Error boundaries must be Client Components
 
import clsx from 'clsx'; // Add this import

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div
      className={clsx(
        'background-grid flex h-full items-center justify-center'
      )}
    >
      <div
        className={clsx(
          'content-wrapper text-center text-slate-600',
          'dark:text-slate-400'
        )}
      >
        <h1 className={clsx('py-12 text-center')}>
          <div className={clsx('mb-3 text-8xl font-extrabold')}>500</div>
          <div className={clsx('text-2xl')}> Server Error </div>
        </h1>
          <button onClick={() => reset()}>Try again</button>
      </div>
    </div>
  )
}