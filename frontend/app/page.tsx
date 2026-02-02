'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Container } from '@/components/layout/Container'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { analyzeRepository, AnalyzeRepositoryResponse } from '@/lib/api'

export default function Home() {
  const router = useRouter()
  const [repoUrl, setRepoUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isCopied, setIsCopied] = useState(false)

  const isValidGitHubUrl = (url: string): boolean => {
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[^\/]+\/[^\/]+(\/)?$/
    return githubRegex.test(url.trim())
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter or Cmd+Enter to submit
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        if (!isLoading && repoUrl.trim() && isValidGitHubUrl(repoUrl)) {
          handleSubmit(e as unknown as React.FormEvent)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [repoUrl, isLoading])

  const getValidationError = (url: string): string => {
    if (!url.trim()) {
      return 'Repository URL is required'
    }
    
    if (!isValidGitHubUrl(url)) {
      return 'Please enter a valid GitHub repository URL (e.g., https://github.com/username/repository)'
    }
    
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate URL
    const validationError = getValidationError(repoUrl)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)

    try {
      // Clean the URL (remove trailing slash)
      const cleanUrl = repoUrl.trim().replace(/\/$/, '')
      const response: AnalyzeRepositoryResponse = await analyzeRepository(cleanUrl)
      
      if (response.analysis_id) {
        // Redirect to analysis page
        router.push(`/analyze/${response.analysis_id}`)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err: any) {
      console.error('Error analyzing repository:', err)
      
      // Handle different error types
      if (err.response?.status === 429) {
        setError('Rate limit exceeded. Please try again later.')
      } else if (err.response?.status >= 500) {
        setError('Server error. Please try again later.')
      } else if (err.response?.status === 400) {
        setError('Invalid repository URL or repository not found.')
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
        setError('Request timeout. Please check your connection and try again.')
      } else {
        setError(err.response?.data?.message || 'Failed to analyze repository. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleUrlChange = (url: string) => {
    setRepoUrl(url)
    // Clear error when user starts typing
    if (error) setError('')
  }

  return (
    <main className="min-h-screen bg-dark-bg relative">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-neon-cyan/3 to-transparent animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-neon-magenta/2 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Floating particles background */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-neon-cyan/20 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
      </div>
      
      <Container>
        <Header />
        
        <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-7xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-green bg-clip-text text-transparent animate-pulse">
              GitSoul
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-4">
              Discover the personality and insights behind any code repository
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Press <kbd className="px-2 py-1 text-xs bg-gray-800 rounded">Ctrl+Enter</kbd> to analyze quickly
            </p>
          </div>

          <GlassPanel className="w-full max-w-2xl p-8 transform hover:scale-105 transition-transform duration-300">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="repoUrl" className="block text-sm font-medium text-gray-300 mb-2">
                  Enter GitHub Repository URL
                </label>
                <div className="relative">
                  <Input
                    id="repoUrl"
                    type="url"
                    placeholder="https://github.com/username/repository"
                    value={repoUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className={`w-full transition-all duration-300 ${
                      error ? 'border-red-500 focus:border-red-500 shake' : 
                      repoUrl && isValidGitHubUrl(repoUrl) ? 'border-green-500 focus:border-green-500' : ''
                    }`}
                    required
                    disabled={isLoading}
                  />
                  {repoUrl && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isValidGitHubUrl(repoUrl) ? (
                        <span className="text-green-400">✓</span>
                      ) : (
                        <span className="text-red-400">✗</span>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Enhanced error display */}
                {error && (
                  <div className="mt-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <p className="text-sm text-red-400 flex items-center">
                      <span className="mr-2">⚠️</span>
                      {error}
                    </p>
                    {error.includes('timeout') && (
                      <p className="text-xs text-red-300 mt-1">
                        Tip: Check your internet connection and try again
                      </p>
                    )}
                  </div>
                )}
                
                {/* Success indicator */}
                {!error && repoUrl && isValidGitHubUrl(repoUrl) && (
                  <p className="mt-2 text-sm text-green-400 flex items-center">
                    <span className="mr-2">✓</span>
                    Valid GitHub repository ready to analyze
                  </p>
                )}
              </div>
              
              <Button
                type="submit"
                disabled={isLoading || !repoUrl.trim() || !isValidGitHubUrl(repoUrl)}
                className={`w-full transform hover:scale-105 transition-all duration-300 ${
                  !isLoading && !repoUrl.trim() ? 'opacity-50 cursor-not-allowed' : 'neon-glow-cyan'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing repository...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Analyze Repository</span>
                    <span className="text-xs opacity-70">Ctrl+Enter</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Enhanced Example URLs */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <p className="text-sm text-gray-400 mb-3 flex items-center">
                <span className="mr-2">💡</span>
                Try these example repositories:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <button
                  onClick={() => setRepoUrl('https://github.com/facebook/react')}
                  className="text-left p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded transition-colors duration-200 group"
                  disabled={isLoading}
                >
                  <div className="text-sm text-neon-cyan group-hover:text-neon-cyan/80">
                    React
                  </div>
                  <div className="text-xs text-gray-500">Large framework project</div>
                </button>
                
                <button
                  onClick={() => setRepoUrl('https://github.com/tailwindlabs/tailwindcss')}
                  className="text-left p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded transition-colors duration-200 group"
                  disabled={isLoading}
                >
                  <div className="text-sm text-neon-magenta group-hover:text-neon-magenta/80">
                    Tailwind CSS
                  </div>
                  <div className="text-xs text-gray-500">Popular CSS framework</div>
                </button>
                
                <button
                  onClick={() => setRepoUrl('https://github.com/vercel/next.js')}
                  className="text-left p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded transition-colors duration-200 group"
                  disabled={isLoading}
                >
                  <div className="text-sm text-neon-green group-hover:text-neon-green/80">
                    Next.js
                  </div>
                  <div className="text-xs text-gray-500">React framework</div>
                </button>
                
                <button
                  onClick={() => setRepoUrl('https://github.com/microsoft/vscode')}
                  className="text-left p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded transition-colors duration-200 group"
                  disabled={isLoading}
                >
                  <div className="text-sm text-neon-yellow group-hover:text-neon-yellow/80">
                    VS Code
                  </div>
                  <div className="text-xs text-gray-500">Code editor</div>
                </button>
              </div>
            </div>
          </GlassPanel>
        </div>
      </Container>
      
      <Footer />
    </main>
  )
}