'use client'

import { useState } from 'react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Container } from '@/components/layout/Container'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function Home() {
  const [repoUrl, setRepoUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!repoUrl.trim()) return

    setIsLoading(true)
    // API call will be implemented later
    console.log('Analyzing repository:', repoUrl)
    
    // For now, just simulate loading
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
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
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="w-full"
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={isLoading || !repoUrl.trim()}
                  className="w-full neon-glow-cyan"
                >
                  {isLoading ? 'Analyzing...' : 'Analyze Repository'}
                </Button>
              </form>
            </GlassPanel>
          </div>
        </Container>
        
        <Footer />
      </div>
    </main>
  )
}