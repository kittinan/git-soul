'use client'

import React from 'react'

interface FallbackVisualizerProps {
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

export function FallbackVisualizer({ personality = defaultPersonality }: FallbackVisualizerProps) {
  const getShapePath = () => {
    const complexity = personality.traits.complexity
    const creativity = personality.traits.creativity
    
    if (complexity < 0.4) {
      // Circle for simple
      return 'M50 10 A40 40 0 1 1 49.9 10 Z'
    } else if (complexity < 0.7) {
      // Hexagon for medium
      return 'M50 5 L85 25 L85 65 L50 85 L15 65 L15 25 Z'
    } else {
      // Star for complex
      return 'M50 5 L61 35 L95 35 L68 57 L79 87 L50 70 L21 87 L32 57 L5 35 L39 35 Z'
    }
  }
  
  const getTransform = () => {
    const speed = personality.visualization.shape.rotation_speed
    return `rotate(${Date.now() / 50 * speed} 50 50)`
  }
  
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black rounded-lg">
      <div className="relative">
        <svg 
          width="200" 
          height="200" 
          viewBox="0 0 100 100"
          className="animate-pulse"
        >
          {/* Background circles for creativity */}
          {personality.traits.creativity > 0.6 && (
            <>
              <circle cx="20" cy="20" r="8" fill={personality.visualization.colors.accent} opacity="0.6">
                <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="80" cy="80" r="6" fill={personality.visualization.colors.secondary} opacity="0.6">
                <animate attributeName="r" values="6;10;6" dur="1.5s" repeatCount="indefinite" />
              </circle>
            </>
          )}
          
          {/* Main shape */}
          <path 
            d={getShapePath()} 
            fill={personality.visualization.colors.primary}
            stroke={personality.visualization.colors.secondary}
            strokeWidth="2"
            opacity="0.9"
            transform={getTransform()}
          />
          
          {/* Center dot for performance */}
          {personality.traits.performance > 0.7 && (
            <circle cx="50" cy="50" r="5" fill={personality.visualization.colors.accent}>
              <animate attributeName="opacity" values="0.5;1;0.5" dur="1s" repeatCount="indefinite" />
            </circle>
          )}
        </svg>
        
        <div className="absolute -bottom-8 left-0 right-0 text-center">
          <p className="text-xs text-gray-400">2D Fallback</p>
        </div>
      </div>
    </div>
  )
}