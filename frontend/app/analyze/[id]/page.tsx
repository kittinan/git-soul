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
import { getAnalysisStatus, getPersonality, Personality } from '@/lib/api'

export default function AnalyzePage() {
  const params = useParams()
  const analysisId = params.id as string
  const [status, setStatus] = useState<'pending' | 'analyzing' | 'completed' | 'error'>('pending')
  const [progress, setProgress] = useState(0)
  const [personality, setPersonality] = useState<Personality | null>(null)
  const [show3D, setShow3D] = useState(true)
  const [loading, setLoading] = useState(false)

  // Poll for analysis status
  useEffect(() => {
    const pollStatus = async () => {
      try {
        const statusData = await getAnalysisStatus(analysisId)
        setStatus(statusData.status as any)
        setProgress(statusData.progress)
        
        if (statusData.status === 'completed') {
          // Fetch personality data when analysis is complete
          const personalityData = await getPersonality(analysisId)
          setPersonality(personalityData)
        } else if (statusData.status === 'error') {
          console.error('Analysis failed')
        }
      } catch (error) {
        console.error('Error polling status:', error)
        setStatus('error')
      }
    }

    const interval = setInterval(pollStatus, 2000)
    return () => clearInterval(interval)
  }, [analysisId])

  // Map API personality data to 3D visualization format
  const mapToVisualizationPersonality = (personalityData: Personality) => {
    const avgInnovation = (personalityData.traits.innovation + personalityData.traits.creativity) / 2
    const avgCollaboration = personalityData.traits.collaboration
    const avgReliability = personalityData.traits.reliability
    
    const shapeType = avgInnovation > 0.7 ? 'complex' as const : 
                     avgInnovation > 0.4 ? 'sphere' as const : 'cube' as const
    
    return {
      traits: {
        complexity: (avgInnovation + personalityData.traits.technical_excellence) / 2,
        creativity: personalityData.traits.creativity,
        maintainability: avgReliability,
        innovation: personalityData.traits.innovation,
        organization: avgCollaboration,
        performance: personalityData.traits.technical_excellence
      },
      visualization: {
        colors: {
          primary: avgInnovation > 0.7 ? '#00ffff' : '#0080ff',
          secondary: avgCollaboration > 0.7 ? '#ff00ff' : '#ff8000',
          accent: avgReliability > 0.7 ? '#00ff00' : '#ffff00'
        },
        shape: {
          type: shapeType,
          complexity: (avgInnovation + personalityData.traits.technical_excellence) / 2,
          rotation_speed: avgInnovation * 2,
          particle_count: Math.floor(personalityData.traits.creativity * 150)
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
            <p className="text-gray-400">Analysis ID: {analysisId}</p>
          </div>

          {status !== 'completed' && (
            <GlassPanel className="w-full max-w-2xl mx-auto p-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-4">
                  {status === 'pending' ? 'Initializing analysis...' : 
                   status === 'analyzing' ? 'Analyzing repository...' :
                   status === 'error' ? 'Analysis failed' : 'Processing...'}
                </h3>
                {status !== 'error' && (
                  <>
                    <ProgressBar value={progress} className="mb-4" />
                    <p className="text-gray-400">{Math.round(progress)}% complete</p>
                  </>
                )}
              </div>
            </GlassPanel>
          )}

          {status === 'completed' && personality && (
            <div className="space-y-8">
              {/* 3D Visualization */}
              <GlassPanel className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold">Personality Visualization</h3>
                  <Button 
                    onClick={() => setShow3D(!show3D)}
                    variant="secondary"
                    className="text-sm px-4 py-2"
                  >
                    {show3D ? 'Show 2D' : 'Show 3D'}
                  </Button>
                </div>
                <div className="h-96 bg-dark-panel rounded-lg overflow-hidden">
                  <PersonalityVisualizer 
                    personality={visualizationPersonality}
                    show3D={show3D}
                  />
                </div>
              </GlassPanel>

              {/* Personality Traits Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <h4 className="font-semibold text-neon-cyan mb-2">Innovation</h4>
                  <p className="text-3xl font-bold">{Math.round(personality.traits.innovation * 100)}%</p>
                  <p className="text-sm text-gray-400">
                    {personality.traits.innovation > 0.7 ? 'High creativity in problem-solving' : 
                     personality.traits.innovation > 0.4 ? 'Moderate innovation' : 'Room for innovation'}
                  </p>
                </Card>
                
                <Card>
                  <h4 className="font-semibold text-neon-magenta mb-2">Collaboration</h4>
                  <p className="text-3xl font-bold">{Math.round(personality.traits.collaboration * 100)}%</p>
                  <p className="text-sm text-gray-400">
                    {personality.traits.collaboration > 0.7 ? 'Strong team contribution' :
                     personality.traits.collaboration > 0.4 ? 'Good collaboration' : 'Limited collaboration'}
                  </p>
                </Card>
                
                <Card>
                  <h4 className="font-semibold text-neon-green mb-2">Reliability</h4>
                  <p className="text-3xl font-bold">{Math.round(personality.traits.reliability * 100)}%</p>
                  <p className="text-sm text-gray-400">
                    {personality.traits.reliability > 0.7 ? 'Consistent quality delivery' :
                     personality.traits.reliability > 0.4 ? 'Generally reliable' : 'Inconsistent quality'}
                  </p>
                </Card>
              </div>

              {/* Additional Traits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <h4 className="font-semibold text-neon-purple mb-2">Creativity</h4>
                  <p className="text-3xl font-bold">{Math.round(personality.traits.creativity * 100)}%</p>
                  <p className="text-sm text-gray-400">Creative problem-solving approach</p>
                </Card>
                
                <Card>
                  <h4 className="font-semibold text-neon-yellow mb-2">Technical Excellence</h4>
                  <p className="text-3xl font-bold">{Math.round(personality.traits.technical_excellence * 100)}%</p>
                  <p className="text-sm text-gray-400">Code quality and technical practices</p>
                </Card>
              </div>

              {/* Insights Cards Section */}
              <GlassPanel className="p-6">
                <h3 className="text-2xl font-bold mb-4">Key Insights</h3>
                <div className="space-y-4">
                  {personality.insights.map((insight, index) => (
                    <div key={index} className="glass p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-white">{insight.category}</h4>
                        <span className="text-xs text-gray-400">
                          {Math.round(insight.confidence * 100)}% confidence
                        </span>
                      </div>
                      <p className="text-gray-400">{insight.description}</p>
                    </div>
                  ))}
                </div>
                
                {/* Summary */}
                <div className="mt-6 p-4 bg-dark-panel rounded-lg">
                  <h4 className="font-semibold text-white mb-2">Summary</h4>
                  <p className="text-gray-400">{personality.summary}</p>
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