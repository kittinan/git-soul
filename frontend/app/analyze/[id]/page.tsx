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
import { NeuralNetworkLoading } from '@/components/ui/NeuralNetworkLoading'
import { getAnalysisStatus, getPersonality, Personality } from '@/lib/api'

export default function AnalyzePage() {
  const params = useParams()
  const analysisId = params.id as string
  const [status, setStatus] = useState<'pending' | 'analyzing' | 'completed' | 'error'>('pending')
  const [progress, setProgress] = useState(0)
  const [personality, setPersonality] = useState<Personality | null>(null)
  const [show3D, setShow3D] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [shareSuccess, setShareSuccess] = useState(false)
  const MAX_RETRIES = 3

  // Poll for analysis status
  useEffect(() => {
    const pollStatus = async () => {
      try {
        const statusData = await getAnalysisStatus(analysisId)
        setStatus(statusData.status as any)
        setProgress(statusData.progress)
        setError('') // Clear any previous errors
        
        if (statusData.status === 'completed') {
          // Fetch personality data when analysis is complete
          const personalityData = await getPersonality(analysisId)
          setPersonality(personalityData)
        } else if (statusData.status === 'error') {
          setError('Analysis failed. The repository may be private, empty, or inaccessible.')
        }
      } catch (error: any) {
        console.error('Error polling status:', error)
        setStatus('error')
        
        if (error.response?.status === 404) {
          setError('Analysis not found. It may have expired or been deleted.')
        } else if (error.response?.status === 429) {
          setError('Rate limit exceeded. Please wait a moment and try again.')
        } else if (error.response?.status >= 500) {
          setError('Server error. Please try again later.')
        } else {
          setError('Failed to check analysis status. Please try again.')
        }
      }
    }

    // Only poll if not completed or in error state (with retry limit)
    if (status !== 'completed' && status !== 'error' && retryCount < MAX_RETRIES) {
      pollStatus()
    }

    const interval = setInterval(() => {
      if (status !== 'completed' && status !== 'error' && retryCount < MAX_RETRIES) {
        pollStatus()
      }
    }, 2000)
    
    return () => clearInterval(interval)
  }, [analysisId, status, retryCount])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    setStatus('pending')
    setProgress(0)
    setPersonality(null)
    setError('')
  }

  const copyShareUrl = () => {
    const url = `${window.location.origin}/analyze/${analysisId}`
    navigator.clipboard.writeText(url).then(() => {
      setShareSuccess(true)
      setTimeout(() => setShareSuccess(false), 3000) // Hide after 3 seconds
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setShareSuccess(true)
      setTimeout(() => setShareSuccess(false), 3000)
    })
  }

  const shareOnSocial = (platform: string) => {
    const url = `${window.location.origin}/analyze/${analysisId}`
    const text = 'Check out this repository analysis on GitSoul!'
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    }
    
    if (shareUrls[platform as keyof typeof shareUrls]) {
      window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400')
    }
  }

  // Map API personality data to 3D visualization format
  const mapToVisualizationPersonality = (personalityData: Personality) => {
    // Parse string scores to floats
    const innovation = parseFloat(personalityData.innovation_score)
    const creativity = parseFloat(personalityData.creativity_score)
    const organization = parseFloat(personalityData.organization_score)
    const maintainability = parseFloat(personalityData.maintainability_score)
    const performance = parseFloat(personalityData.performance_score)
    const complexity = parseFloat(personalityData.complexity_score)
    
    const avgInnovation = (innovation + creativity) / 2
    
    return {
      traits: {
        complexity,
        creativity,
        maintainability,
        innovation,
        organization,
        performance
      },
      visualization: {
        colors: {
          primary: personalityData.primary_color,
          secondary: personalityData.secondary_color,
          accent: personalityData.accent_color
        },
        shape: {
          type: personalityData.shape_type as 'complex' | 'sphere' | 'cube',
          complexity: complexity,
          rotation_speed: parseFloat(personalityData.rotation_speed),
          particle_count: personalityData.particle_count
        }
      }
    }
  }

  const visualizationPersonality = personality ? mapToVisualizationPersonality(personality) : undefined

  return (
    <main className="min-h-screen bg-dark-bg">
      <Container>
        <Header />
        
        <div className="py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Repository Analysis</h1>
            <div className="flex items-center justify-center space-x-4">
              <p className="text-gray-400">Analysis ID: {analysisId}</p>
              {status === 'completed' && (
                <Button
                  onClick={copyShareUrl}
                  variant="secondary"
                  className="text-xs px-3 py-1"
                >
                  📋 Copy URL
                </Button>
              )}
            </div>
          </div>

          {/* Loading/Error State */}
          {status !== 'completed' && (
            <GlassPanel className="w-full max-w-2xl mx-auto p-8">
              {status === 'error' ? (
                <div className="text-center">
                  <div className="text-6xl mb-4">❌</div>
                  <h3 className="text-xl font-semibold mb-4 text-red-400">Analysis Failed</h3>
                  <p className="text-gray-400 mb-6">{error || 'The analysis could not be completed.'}</p>
                  {retryCount < MAX_RETRIES && (
                    <Button onClick={handleRetry} className="neon-glow-cyan">
                      🔄 Try Again ({MAX_RETRIES - retryCount} attempts remaining)
                    </Button>
                  )}
                  {retryCount >= MAX_RETRIES && (
                    <p className="text-sm text-gray-500 mt-4">
                      Maximum retry attempts reached. Please start a new analysis.
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <NeuralNetworkLoading 
                    message={
                      status === 'pending' ? 'Initializing analysis...' : 
                      status === 'analyzing' ? 'Analyzing repository...' : 'Processing...'
                    }
                    progress={progress}
                  />
                </div>
              )}
            </GlassPanel>
          )}

          {status === 'completed' && personality && (
            <div className="space-y-8">
              {/* 3D Visualization */}
              <GlassPanel className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold">Personality Visualization</h3>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => setShow3D(!show3D)}
                      variant="secondary"
                      className="text-sm px-4 py-2"
                    >
                      {show3D ? 'Show 2D' : 'Show 3D'}
                    </Button>
                    
                    {/* Share Button */}
                    <Button 
                      onClick={copyShareUrl}
                      variant="secondary"
                      className="text-sm px-4 py-2 relative"
                      title="Share analysis results"
                    >
                      📤 Share
                    </Button>
                  </div>
                </div>
                
                {/* Share Success Message */}
                {shareSuccess && (
                  <div className="absolute top-16 right-6 z-20">
                    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3 animate-pulse">
                      <p className="text-sm text-green-400 flex items-center">
                        <span className="mr-2">✓</span>
                        Share URL copied to clipboard!
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="h-96 bg-dark-panel rounded-lg overflow-hidden">
                  <PersonalityVisualizer 
                    personality={visualizationPersonality}
                    show3D={show3D}
                  />
                </div>
                
                {/* Social Share Buttons */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-500 mb-2">Share on social media:</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => shareOnSocial('twitter')}
                      className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/40 rounded text-xs text-blue-400 transition-colors duration-200"
                      title="Share on Twitter"
                    >
                      Twitter
                    </button>
                    <button
                      onClick={() => shareOnSocial('linkedin')}
                      className="px-3 py-1 bg-blue-700/20 hover:bg-blue-700/40 rounded text-xs text-blue-500 transition-colors duration-200"
                      title="Share on LinkedIn"
                    >
                      LinkedIn
                    </button>
                    <button
                      onClick={() => shareOnSocial('facebook')}
                      className="px-3 py-1 bg-blue-800/20 hover:bg-blue-800/40 rounded text-xs text-blue-600 transition-colors duration-200"
                      title="Share on Facebook"
                    >
                      Facebook
                    </button>
                  </div>
                </div>
              </GlassPanel>

              {/* Personality Traits Section - All 6 traits */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <h4 className="font-semibold text-neon-cyan mb-2">Complexity</h4>
                  <p className="text-3xl font-bold">{Math.round(visualizationPersonality?.traits.complexity! * 100)}%</p>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-neon-cyan h-2 rounded-full" 
                      style={{ width: `${visualizationPersonality?.traits.complexity! * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    {visualizationPersonality?.traits.complexity! > 0.7 ? 'Highly complex architecture' : 
                     visualizationPersonality?.traits.complexity! > 0.4 ? 'Moderate complexity' : 'Simple and straightforward'}
                  </p>
                </Card>
                
                <Card>
                  <h4 className="font-semibold text-neon-magenta mb-2">Creativity</h4>
                  <p className="text-3xl font-bold">{Math.round(parseFloat(personality.creativity_score) * 100)}%</p>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-neon-magenta h-2 rounded-full" 
                      style={{ width: `${parseFloat(personality.creativity_score) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    {parseFloat(personality.creativity_score) > 0.7 ? 'Highly creative solutions' :
                     parseFloat(personality.creativity_score) > 0.4 ? 'Creative approach' : 'Conventional methods'}
                  </p>
                </Card>
                
                <Card>
                  <h4 className="font-semibold text-neon-green mb-2">Maintainability</h4>
                  <p className="text-3xl font-bold">{Math.round(parseFloat(personality.maintainability_score) * 100)}%</p>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-neon-green h-2 rounded-full" 
                      style={{ width: `${parseFloat(personality.maintainability_score) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    {parseFloat(personality.maintainability_score) > 0.7 ? 'Easy to maintain' :
                     parseFloat(personality.maintainability_score) > 0.4 ? 'Moderately maintainable' : 'Hard to maintain'}
                  </p>
                </Card>

                <Card>
                  <h4 className="font-semibold text-neon-purple mb-2">Innovation</h4>
                  <p className="text-3xl font-bold">{Math.round(parseFloat(personality.innovation_score) * 100)}%</p>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-neon-purple h-2 rounded-full" 
                      style={{ width: `${parseFloat(personality.innovation_score) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    {parseFloat(personality.innovation_score) > 0.7 ? 'Cutting-edge innovation' :
                     parseFloat(personality.innovation_score) > 0.4 ? 'Innovative approach' : 'Traditional approach'}
                  </p>
                </Card>

                <Card>
                  <h4 className="font-semibold text-neon-yellow mb-2">Organization</h4>
                  <p className="text-3xl font-bold">{Math.round(parseFloat(personality.organization_score) * 100)}%</p>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-neon-yellow h-2 rounded-full" 
                      style={{ width: `${parseFloat(personality.organization_score) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    {parseFloat(personality.organization_score) > 0.7 ? 'Well-organized structure' :
                     parseFloat(personality.organization_score) > 0.4 ? 'Good organization' : 'Needs organization'}
                  </p>
                </Card>

                <Card>
                  <h4 className="font-semibold text-orange-500 mb-2">Performance</h4>
                  <p className="text-3xl font-bold">{Math.round(parseFloat(personality.performance_score) * 100)}%</p>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${parseFloat(personality.performance_score) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    {parseFloat(personality.performance_score) > 0.7 ? 'High-performance code' :
                     parseFloat(personality.performance_score) > 0.4 ? 'Good performance' : 'Performance concerns'}
                  </p>
                </Card>
              </div>

              {/* Code Insights Section */}
              <GlassPanel className="p-6">
                <h3 className="text-2xl font-bold mb-4">Code Insights</h3>
                <div className="space-y-4">
                  {personality.insights.map((insight, index) => {
                    const isStrength = insight.category.toLowerCase().includes('strength') || 
                                    insight.category.toLowerCase().includes('positive')
                    const isIssue = insight.category.toLowerCase().includes('issue') || 
                                  insight.category.toLowerCase().includes('problem') ||
                                  insight.category.toLowerCase().includes('error')
                    const isPattern = !isStrength && !isIssue
                    
                    const categoryColor = isStrength ? 'green' : isIssue ? 'red' : 'blue'
                    
                    return (
                      <div key={insight.id} className="glass p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-block w-3 h-3 rounded-full ${
                              isStrength ? 'bg-green-500' : 
                              isIssue ? 'bg-red-500' : 'bg-blue-500'
                            }`}></span>
                            <h4 className="font-semibold text-white">{insight.category}</h4>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isStrength ? 'bg-green-500/20 text-green-400' : 
                            isIssue ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {isStrength ? 'Strength' : isIssue ? 'Issue' : 'Pattern'}
                          </span>
                        </div>
                        <p className="text-gray-400">{insight.insight_text}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            Severity: {insight.severity}
                          </span>
                          {isIssue && (
                            <span className={`text-xs px-2 py-1 rounded ${
                              insight.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                              insight.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-orange-500/20 text-orange-400'
                            }`}>
                              {insight.severity === 'high' ? 'High Severity' :
                               insight.severity === 'medium' ? 'Medium Severity' : 'Low Severity'}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                {/* Summary */}
                <div className="mt-6 p-4 bg-dark-panel rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Personality Summary</h4>
                  <p className="text-gray-400">{personality.personality_description}</p>
                  
                  {/* Personality Tags */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {personality.tags.map((tag, index) => (
                      <span key={index} className="text-xs px-2 py-1 bg-neon-cyan/20 text-neon-cyan rounded-full">
                        {tag}
                      </span>
                    ))}
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