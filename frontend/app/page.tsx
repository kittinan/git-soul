'use client'

import { useState } from 'react'
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

  const isValidGitHubUrl = (url: string): boolean => {
    const githubRegex = /^https?:\/\/(www\.)?github\.com\/[^\/]+\/[^\/]+(\/)?$/
    return githubRegex.test(url.trim())
  }

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
    <main className="min-h-screen bg-dark-bg">
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-neon-cyan/5 to-transparent"></div>
        
        <Container>
          <Header />
          
          <div className="flex flex-col items-center justify-center min-h-[80vh] py-12">
            <div className="text-center mb-12">
              <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-green bg-clip-text text-transparent">
                GitSoul
              </h1>
              <p className="text-xl text-gray-400 mb-8">
                Discover the personality and insights behind any code repository
              </p>
            </div>

            <GlassPanel className="w-full max-w-2xl p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="repoUrl" className="block text-sm font-medium text-gray-300 mb-2">
                    Enter GitHub Repository URL
                  </label>
                  <Input
                    id="repoUrl"
                    type="url"
                    placeholder="https://github.com/username/repository"
                    value={repoUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className={`w-full ${error ? 'border-red-500 focus:border-red-500' : ''}`}
                    required
                    disabled={isLoading}
                  />
                  {error && (
                    <p className="mt-2 text-sm text-red-500">{error}</p>
                  )}
                  {!error && repoUrl && (
                    <p className="mt-2 text-sm text-green-500">
                      {isValidGitHubUrl(repoUrl) ? '✓ Valid GitHub repository' : 'Invalid GitHub URL'}
                    </p>
                  )}
                </div>
                
                <Button
                  type="submit"
                  disabled={isLoading || !repoUrl.trim() || !isValidGitHubUrl(repoUrl)}
                  className={`w-full ${!isLoading && !repoUrl.trim() ? 'opacity-50 cursor-not-allowed' : 'neon-glow-cyan'}`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Analyzing...</span>
                    </div>
                  ) : (
                    'Analyze Repository'
                  )}
                </Button>
              </form>

              {/* Example URLs */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <p className="text-xs text-gray-500 mb-2">Try these examples:</p>
                <div className="space-y-1">
                  <button
                    onClick={() => setRepoUrl('https://github.com/facebook/react')}
                    className="text-xs text-neon-cyan hover:text-neon-cyan/80 block w-full text-left"
                    disabled={isLoading}
                  >
                    • React (Large project)
                  </button>
                  <button
                    onClick={() => setRepoUrl('https://github.com/tailwindlabs/tailwindcss')}
                    className="text-xs text-neon-cyan hover:text-neon-cyan/80 block w-full text-left"
                    disabled={isLoading}
                  >
                    • Tailwind CSS (Popular tool)
                  </button>
                </div>
              </div>
            </GlassPanel>
          </div>
        </Container>
        
        <Footer />
      </div>
    </main>
  )
}