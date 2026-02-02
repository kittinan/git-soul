'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instance, Instances } from '@react-three/drei'
import { Group, Vector3 } from 'three'

interface AmbientParticlesProps {
  count: number
  color: string
}

export function AmbientParticles({ count, color }: AmbientParticlesProps) {
  const groupRef = useRef<Group>(null)
  const particlePositions = useRef<Vector3[]>([])
  
  // Initialize particle positions in a sphere
  useMemo(() => {
    particlePositions.current = []
    for (let i = 0; i < count; i++) {
      const radius = 4 + Math.random() * 2
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      
      particlePositions.current.push(new Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi)
      ))
    }
  }, [count])
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Gentle rotation
      groupRef.current.rotation.y += delta * 0.05
      
      // Animate particles with subtle floating motion
      const time = state.clock.getElapsedTime()
      particlePositions.current.forEach((pos, i) => {
        const offset = Math.sin(time + i) * 0.1
        pos.multiplyScalar(1 + offset * 0.01)
      })
    }
  })
  
  return (
    <group ref={groupRef}>
      <Instances limit={count}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          transparent
          opacity={0.6}
        />
        
        {Array.from({ length: count }, (_, i) => (
          <Instance
            key={i}
            position={particlePositions.current[i]}
            scale={[0.5, 0.5, 0.5]}
          />
        ))}
      </Instances>
    </group>
  )
}