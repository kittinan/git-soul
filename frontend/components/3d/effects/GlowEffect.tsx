'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'

interface GlowEffectProps {
  color: string
}

export function GlowEffect({ color }: GlowEffectProps) {
  const meshRef = useRef<Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime()) * 0.1
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.05
    }
  })
  
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[3, 32, 32]} />
      <meshBasicMaterial 
        color={color}
        transparent
        opacity={0.1}
        wireframe
      />
    </mesh>
  )
}