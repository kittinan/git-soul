'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instance, Instances } from '@react-three/drei'
import { Group, Vector3 } from 'three'

interface ParticlesProps {
  count: number
  color: string
}

export function Particles({ count, color }: ParticlesProps) {
  const groupRef = useRef<Group>(null)
  const originalPositions = useRef<Vector3[]>([])
  
  const particles = useMemo(() => {
    const positions = []
    const scales = []
    const speeds = []
    
    for (let i = 0; i < count; i++) {
      // Create particles in a more organized pattern
      const radius = 2 + Math.random() * 3
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      
      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)
      
      positions.push(x, y, z)
      
      const pos = new Vector3(x, y, z)
      originalPositions.current.push(pos)
      
      scales.push(Math.random() * 0.3 + 0.1)
      speeds.push(Math.random() * 2 + 1)
    }
    
    return { positions, scales, speeds }
  }, [count])
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime()
      
      // Complex rotation animation
      groupRef.current.rotation.x = Math.sin(time * 0.3) * 0.2
      groupRef.current.rotation.y = time * 0.1
      groupRef.current.rotation.z = Math.cos(time * 0.2) * 0.1
      
      // Animate individual particles
      particles.positions.forEach((_, i) => {
        const timeOffset = time + i * 0.1
        const speed = particles.speeds[i]
        
        // Floating motion
        const floatY = Math.sin(timeOffset * speed) * 0.5
        const floatX = Math.cos(timeOffset * speed * 0.7) * 0.3
        const floatZ = Math.sin(timeOffset * speed * 0.5) * 0.2
        
        // Update particle positions with subtle floating
        const originalPos = originalPositions.current[i]
        const instance = groupRef.current?.children[i] as any
        
        if (instance && instance.position) {
          instance.position.x = originalPos.x + floatX
          instance.position.y = originalPos.y + floatY
          instance.position.z = originalPos.z + floatZ
          
          // Pulsing scale
          const pulseScale = particles.scales[i] * (1 + Math.sin(timeOffset * speed * 2) * 0.2)
          instance.scale.setScalar(pulseScale)
        }
      })
    }
  })
  
  return (
    <group ref={groupRef}>
      <Instances limit={count}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          transparent
          opacity={0.9}
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