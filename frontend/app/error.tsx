'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="glass-lg p-8 rounded-2xl max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-white mb-4">Something went wrong!</h2>
        <p className="text-gray-400 mb-6">
          We encountered an unexpected error. Please try again.
        </p>
        <button
          onClick={reset}
          className="w-full glass px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-colors neon-glow-cyan"
        >
          Try again
        </button>
      </div>
    </div>
  )
}