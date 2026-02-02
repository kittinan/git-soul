'use client'

import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera, SoftShadows, Float } from '@react-three/drei'
import { Suspense } from 'react'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { PersonalityShape } from './shapes/PersonalityShape'
import { Particles } from './effects/Particles'
import { GlowEffect } from './effects/GlowEffect'
import { AmbientParticles } from './effects/AmbientParticles'
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
          {/* Enhanced Lighting Setup */}
          <ambientLight intensity={0.3} />
          <directionalLight 
            position={[5, 5, 5]} 
            intensity={1.5} 
            color={personality.visualization.colors.primary}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight 
            position={[-5, -5, 5]} 
            intensity={0.8} 
            color={personality.visualization.colors.accent}
          />
          <spotLight 
            position={[0, 10, 0]} 
            intensity={0.5} 
            color={personality.visualization.colors.secondary}
            angle={0.5}
            penumbra={0.5}
          />
          
          {/* Soft shadows for better depth */}
          <SoftShadows />
          
          {/* Environment for reflections */}
          <Environment preset="city" />
          
          {/* Enhanced Main 3D Shape with Float animation */}
          <Float
            speed={2}
            rotationIntensity={0.5}
            floatIntensity={0.3}
          >
            <PersonalityShape personality={personality} />
          </Float>
          
          {/* Enhanced Particle Effects */}
          {personality.traits.creativity > 0.6 && (
            <Particles 
              count={Math.min(personality.visualization.shape.particle_count, 300)}
              color={personality.visualization.colors.accent}
            />
          )}
          
          {/* Ambient Particles for atmosphere */}
          <AmbientParticles 
            count={50}
            color={personality.visualization.colors.primary}
          />
          
          {/* Enhanced Glow Effect */}
          <GlowEffect color={personality.visualization.colors.primary} />
          
          {/* Post-processing effects */}
          <EffectComposer>
            <Bloom
              intensity={0.3}
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
              height={300}
            />
          </EffectComposer>
          
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
            enableDamping={true}
            dampingFactor={0.05}
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