'use client'

import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei'
import { Suspense } from 'react'
import { PersonalityShape } from './shapes/PersonalityShape'
import { Particles } from './effects/Particles'
import { GlowEffect } from './effects/GlowEffect'
import { FallbackVisualizer } from './FallbackVisualizer'

interface PersonalityVisualizerProps {
  personality?: {
    traits: {
      complexity: number
      creativity: number
      maintainability: number
      innovation: number
      organization: number
      performance: number
    }
    visualization: {
      colors: {
        primary: string
        secondary: string
        accent: string
      }
      shape: {
        type: 'sphere' | 'cube' | 'complex' | 'torus'
        complexity: number
        rotation_speed: number
        particle_count: number
      }
    }
  }
  show3D?: boolean
}

const defaultPersonality = {
  traits: {
    complexity: 0.7,
    creativity: 0.8,
    maintainability: 0.6,
    innovation: 0.9,
    organization: 0.5,
    performance: 0.7
  },
  visualization: {
    colors: {
      primary: '#00ffff',
      secondary: '#ff00ff', 
      accent: '#00ff00'
    },
    shape: {
      type: 'complex' as const,
      complexity: 0.7,
      rotation_speed: 1.0,
      particle_count: 100
    }
  }
}

export function PersonalityVisualizer({ 
  personality = defaultPersonality, 
  show3D = true 
}: PersonalityVisualizerProps) {
  const [webGLAvailable, setWebGLAvailable] = useState(true)
  const [useFallback, setUseFallback] = useState(false)

  useEffect(() => {
    // Check if WebGL is available
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) {
        setWebGLAvailable(false)
        setUseFallback(true)
      }
    } catch (error) {
      setWebGLAvailable(false)
      setUseFallback(true)
    }
  }, [])

  if (useFallback || !show3D) {
    return <FallbackVisualizer personality={personality} />
  }

  return (
    <div className="w-full h-full relative">
      <Canvas
        className="rounded-lg"
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'radial-gradient(circle, #0a0a0a 0%, #000000 100%)' }}
        onError={() => {
          setUseFallback(true)
        }}
      >
        <Suspense fallback={null}>
          {/* Lighting Setup */}
          <ambientLight intensity={0.2} />
          <directionalLight 
            position={[5, 5, 5]} 
            intensity={1} 
            color={personality.visualization.colors.primary}
          />
          <pointLight 
            position={[-5, -5, 5]} 
            intensity={0.5} 
            color={personality.visualization.colors.accent}
          />
          
          {/* Environment for reflections */}
          <Environment preset="city" />
          
          {/* Main 3D Shape */}
          <PersonalityShape personality={personality} />
          
          {/* Particle Effects */}
          {personality.traits.creativity > 0.6 && (
            <Particles 
              count={Math.min(personality.visualization.shape.particle_count, 200)}
              color={personality.visualization.colors.accent}
            />
          )}
          
          {/* Glow Effect */}
          <GlowEffect color={personality.visualization.colors.primary} />
          
          {/* Camera Controls */}
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={true}
            autoRotateSpeed={personality.visualization.shape.rotation_speed}
            maxDistance={10}
            minDistance={2}
          />
        </Suspense>
      </Canvas>
      
      {/* Fallback toggle */}
      {!webGLAvailable && (
        <div className="absolute top-2 right-2">
          <button 
            onClick={() => setUseFallback(!useFallback)}
            className="px-2 py-1 text-xs bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            {useFallback ? 'Try 3D' : 'Use 2D'}
          </button>
        </div>
      )}
    </div>
  )
}