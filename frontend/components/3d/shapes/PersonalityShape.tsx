'use client'

import { useRef, useMemo } from 'react'
import { Mesh } from 'three'
import { Sphere, Icosahedron, Box, Torus } from '@react-three/drei'

interface PersonalityShapeProps {
  personality: {
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

export function PersonalityShape({ personality }: PersonalityShapeProps) {
  const meshRef = useRef<Mesh>(null)
  
  // Calculate position based on organization trait
  const position = useMemo(() => {
    if (personality.traits.organization > 0.7) {
      return [0, 0, 0] as [number, number, number] // Centered, organized
    } else if (personality.traits.organization < 0.4) {
      return [
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ] as [number, number, number] // Random, chaotic
    } else {
      return [(Math.random() - 0.5), 0, 0] as [number, number, number] // Slightly offset, balanced
    }
  }, [personality.traits.organization])
  
  // Calculate scale based on performance trait
  const scale = useMemo(() => {
    const baseScale = 1 + (personality.traits.performance * 0.5)
    return [baseScale, baseScale, baseScale] as [number, number, number]
  }, [personality.traits.performance])
  
  // Determine geometry based on complexity
  const GeometryComponent = useMemo(() => {
    const complexity = personality.traits.complexity
    const creativity = personality.traits.creativity
    
    if (complexity < 0.4) {
      // Simple sphere for low complexity
      return Sphere
    } else if (complexity < 0.7) {
      // Icosahedron for medium complexity
      return Icosahedron
    } else {
      // Complex shape for high complexity
      if (creativity > 0.7) {
        return Torus // Creative, complex shape
      } else {
        return Box // Structured, complex shape
      }
    }
  }, [personality.traits.complexity, personality.traits.creativity])
  
  // Calculate geometry args based on type
  const geometryArgs = useMemo(() => {
    const complexity = personality.traits.complexity
    
    switch (GeometryComponent) {
      case Sphere:
        return [1, 32, 32]
      case Icosahedron:
        return [1, Math.floor(complexity * 4) + 1]
      case Box:
        return [1.2, 1.2, 1.2]
      case Torus:
        return [1, 0.4, 16, Math.floor(complexity * 32) + 16]
      default:
        return [1, 32, 32]
    }
  }, [GeometryComponent, personality.traits.complexity])
  
  return (
    <group position={position} scale={scale}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <GeometryComponent args={geometryArgs as any} />
        <meshStandardMaterial 
          color={personality.visualization.colors.primary}
          emissive={personality.visualization.colors.secondary}
          emissiveIntensity={0.2}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      
      {/* Add secondary elements for high complexity */}
      {personality.traits.complexity > 0.7 && (
        <mesh position={[0.5, 0.5, 0]} scale={[0.3, 0.3, 0.3]}>
          <Sphere args={[1, 16, 16]} />
          <meshStandardMaterial 
            color={personality.visualization.colors.secondary}
            emissive={personality.visualization.colors.accent}
            emissiveIntensity={0.3}
            transparent
            opacity={0.8}
          />
        </mesh>
      )}
      
      {/* Add accent elements for high creativity */}
      {personality.traits.creativity > 0.6 && (
        <mesh position={[-0.5, -0.5, 0]} scale={[0.2, 0.2, 0.2]}>
          <Icosahedron args={[1, 1]} />
          <meshStandardMaterial 
            color={personality.visualization.colors.accent}
            emissive={personality.visualization.colors.accent}
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
    </group>
  )
}