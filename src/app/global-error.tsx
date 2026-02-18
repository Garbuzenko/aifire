'use client'
 
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-black text-white">
          <h2 className="text-2xl font-bold text-red-500">Critical Error</h2>
          <p className="text-gray-400 mb-4">{error.message}</p>
          <button onClick={() => reset()} className="px-4 py-2 bg-blue-600 rounded">Try again</button>
        </div>
      </body>
    </html>
  )
}
