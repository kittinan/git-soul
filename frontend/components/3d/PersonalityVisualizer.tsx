import React from 'react'

export function PersonalityVisualizer() {
  return (
    <div className="text-center">
      <div className="mb-4">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-neon-cyan to-neon-magenta rounded-full animate-pulse"></div>
      </div>
      <p className="text-gray-400">3D Visualization Coming Soon</p>
      <p className="text-sm text-gray-500 mt-2">Powered by Three.js & React Three Fiber</p>
    </div>
  )
}