'use client'

import React from 'react'

interface NeuralNetworkLoadingProps {
  message?: string
  progress?: number
}

export function NeuralNetworkLoading({ message = 'Analyzing...', progress = 0 }: NeuralNetworkLoadingProps) {
  return (
    <div className="relative flex flex-col items-center justify-center space-y-8 py-12">
      {/* Enhanced Neural Network Animation */}
      <div className="relative">
        {/* Pulsing Outer Glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-40 h-40 bg-gradient-to-r from-neon-cyan/20 to-neon-magenta/20 rounded-full animate-ping"></div>
        </div>
        
        {/* Central Core */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-gradient-to-br from-neon-cyan to-neon-magenta rounded-full animate-pulse shadow-lg shadow-neon-cyan/50">
            <div className="absolute inset-1 bg-dark-bg rounded-full animate-ping"></div>
          </div>
        </div>
        
        {/* Outer Ring - Data Flow */}
        <div className="w-40 h-40 relative animate-spin-slow">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((rotation, index) => (
            <div
              key={index}
              className="absolute inset-0"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-4 h-4 bg-gradient-to-br from-neon-cyan to-neon-magenta rounded-full animate-pulse shadow-lg"
                     style={{ 
                       animationDelay: `${index * 0.1}s`,
                       boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
                     }}></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Middle Ring - Processing Nodes */}
        <div className="w-28 h-28 absolute inset-0 m-auto animate-spin-slow-reverse">
          {[15, 75, 135, 195, 255, 315].map((rotation, index) => (
            <div
              key={index}
              className="absolute inset-0"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-3 h-3 bg-neon-green rounded-full animate-ping"
                     style={{ 
                       animationDelay: `${index * 0.2}s`,
                       boxShadow: '0 0 8px rgba(0, 255, 0, 0.6)'
                     }}></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Inner Ring - Neural Connections */}
        <div className="w-20 h-20 absolute inset-0 m-auto animate-spin-slow">
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((rotation, index) => (
            <div
              key={index}
              className="absolute inset-0"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-2 h-2 bg-neon-yellow rounded-full animate-bounce"
                     style={{ 
                       animationDelay: `${index * 0.05}s`,
                       boxShadow: '0 0 6px rgba(255, 255, 0, 0.4)'
                     }}></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Enhanced Connection Lines with Glitch Effect */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="absolute inset-0 m-auto w-40 h-40"
              style={{ transform: `rotate(${index * 45}deg)` }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent via-neon-cyan/50 to-transparent animate-pulse"
                   style={{ animationDelay: `${index * 0.1}s` }}></div>
            </div>
          ))}
        </div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, index) => (
            <div
              key={index}
              className="absolute w-1 h-1 bg-white rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
      </div>
      
      {/* Enhanced Progress Bar */}
      <div className="w-80 max-w-full">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span className="text-neon-cyan">{message}</span>
          <span className="font-mono text-neon-magenta">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden border border-gray-600">
          <div 
            className="h-full bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-green rounded-full transition-all duration-700 ease-out animate-pulse"
            style={{ 
              width: `${progress}%`,
              boxShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
            }}
          ></div>
        </div>
        {/* Progress Indicators */}
        <div className="flex justify-between mt-1">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className={`w-1 h-1 rounded-full transition-all duration-300 ${
                progress > (i + 1) * 20 ? 'bg-neon-cyan' : 'bg-gray-600'
              }`}
            ></div>
          ))}
        </div>
      </div>
      
      {/* Enhanced Neural Activity Text */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-neon-cyan rounded-full animate-pulse"></div>
          <p className="text-sm text-gray-400 font-mono">Neural network processing...</p>
          <div className="w-2 h-2 bg-neon-magenta rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>
        <div className="flex justify-center space-x-2">
          <div className="w-1 h-1 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-1 h-1 bg-neon-magenta rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-1 h-1 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          <div className="w-1 h-1 bg-neon-yellow rounded-full animate-bounce" style={{ animationDelay: '0.6s' }}></div>
        </div>
      </div>
    </div>
  )
}