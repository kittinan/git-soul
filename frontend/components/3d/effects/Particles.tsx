'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instance, Instances } from '@react-three/drei'
import { Group } from 'three'

interface ParticlesProps {
  count: number
  color: string
}

export function Particles({ count, color }: ParticlesProps) {
  const groupRef = useRef<Group>(null)
  
  const particles = useMemo(() => {
    const positions = []
    const scales = []
    
    for (let i = 0; i < count; i++) {
      positions.push(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      )
      scales.push(Math.random() * 0.5 + 0.1)
    }
    
    return { positions, scales }
  }, [count])
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.1
    }
  })
  
  return (
    <group ref={groupRef}>
      <Instances limit={count}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
        
        {particles.positions.map((_, i) => (
          <Instance
            key={i}
            position={[
              particles.positions[i * 3],
              particles.positions[i * 3 + 1],
              particles.positions[i * 3 + 2]
            ]}
            scale={[particles.scales[i], particles.scales[i], particles.scales[i]]}
          />
        ))}
      </Instances>
    </group>
  )
}