'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Container } from '@/components/layout/Container'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PersonalityVisualizer } from '@/components/3d/PersonalityVisualizer'

export default function AnalyzePage() {
  const params = useParams()
  const analysisId = params.id as string
  const [status, setStatus] = useState<'pending' | 'analyzing' | 'completed' | 'error'>('pending')
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Simulate analysis progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setStatus('completed')
          return 100
        }
        return prev + Math.random() * 10
      })
    }, 500)

    return () => clearInterval(interval)
  }, [analysisId])

  return (
    <main className="min-h-screen bg-dark-bg">
      <Container>
        <Header />
        
        <div className="py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Repository Analysis</h1>
            <p className="text-gray-400">Analysis ID: {analysisId}</p>
          </div>

          {status !== 'completed' && (
            <GlassPanel className="w-full max-w-2xl mx-auto p-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4">
                  {status === 'pending' ? 'Initializing analysis...' : 'Analyzing repository...'}
                </h3>
                <ProgressBar value={progress} className="mb-4" />
                <p className="text-gray-400">{Math.round(progress)}% complete</p>
              </div>
            </GlassPanel>
          )}

          {status === 'completed' && (
            <div className="space-y-8">
              {/* 3D Visualization Placeholder */}
              <GlassPanel className="p-6">
                <h3 className="text-2xl font-bold mb-4">Personality Visualization</h3>
                <div className="h-96 bg-dark-panel rounded-lg flex items-center justify-center">
                  <PersonalityVisualizer />
                </div>
              </GlassPanel>

              {/* Personality Traits Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <h4 className="font-semibold text-neon-cyan mb-2">Innovation</h4>
                  <p className="text-3xl font-bold">87%</p>
                  <p className="text-sm text-gray-400">High creativity in problem-solving</p>
                </Card>
                
                <Card>
                  <h4 className="font-semibold text-neon-magenta mb-2">Collaboration</h4>
                  <p className="text-3xl font-bold">92%</p>
                  <p className="text-sm text-gray-400">Strong team contribution</p>
                </Card>
                
                <Card>
                  <h4 className="font-semibold text-neon-green mb-2">Reliability</h4>
                  <p className="text-3xl font-bold">95%</p>
                  <p className="text-sm text-gray-400">Consistent quality delivery</p>
                </Card>
              </div>

              {/* Insights Cards Section */}
              <GlassPanel className="p-6">
                <h3 className="text-2xl font-bold mb-4">Key Insights</h3>
                <div className="space-y-4">
                  <div className="glass p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Code Style</h4>
                    <p className="text-gray-400">Clean, modular architecture with excellent documentation practices.</p>
                  </div>
                  <div className="glass p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Development Patterns</h4>
                    <p className="text-gray-400">Test-driven approach with strong emphasis on code quality.</p>
                  </div>
                  <div className="glass p-4 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Team Dynamics</h4>
                    <p className="text-gray-400">Active collaboration with well-coordinated contributions.</p>
                  </div>
                </div>
              </GlassPanel>
            </div>
          )}
        </div>
      </Container>
      
      <Footer />
    </main>
  )
}