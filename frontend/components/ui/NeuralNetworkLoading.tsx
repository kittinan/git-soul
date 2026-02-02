'use client'

import React from 'react'

interface NeuralNetworkLoadingProps {
  message?: string
  progress?: number
}

export function NeuralNetworkLoading({ message = 'Analyzing...', progress = 0 }: NeuralNetworkLoadingProps) {
  return (
    <div className="relative flex flex-col items-center justify-center space-y-8 py-12">
      {/* Neural Network Animation */}
      <div className="relative">
        {/* Central Node */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-neon-cyan rounded-full animate-pulse"></div>
        </div>
        
        {/* Outer Ring */}
        <div className="w-32 h-32 relative animate-spin-slow">
          {[0, 60, 120, 180, 240, 300].map((rotation, index) => (
            <div
              key={index}
              className="absolute inset-0"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-3 h-3 bg-neon-magenta rounded-full animate-ping"
                     style={{ animationDelay: `${index * 0.2}s` }}></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Middle Ring */}
        <div className="w-24 h-24 absolute inset-0 m-auto animate-spin-slow-reverse">
          {[30, 90, 150, 210, 270, 330].map((rotation, index) => (
            <div
              key={index}
              className="absolute inset-0"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"
                     style={{ animationDelay: `${index * 0.3}s` }}></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Inner Ring */}
        <div className="w-16 h-16 absolute inset-0 m-auto animate-spin-slow">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((rotation, index) => (
            <div
              key={index}
              className="absolute inset-0"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-1.5 h-1.5 bg-neon-yellow rounded-full"
                     style={{ 
                       animation: `ping ${1 + index * 0.1}s infinite`,
                       animationDelay: `${index * 0.1}s` 
                     }}></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Connection Lines */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="absolute inset-0 m-auto w-32 h-32"
              style={{ transform: `rotate(${index * 60}deg)` }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-neon-cyan/0 to-neon-cyan/30"></div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-64 max-w-full">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>{message}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-neon-cyan to-neon-magenta rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      {/* Neural Activity Text */}
      <div className="text-center space-y-1">
        <p className="text-sm text-gray-500">Neural network processing...</p>
        <div className="flex justify-center space-x-1">
          <div className="w-1 h-1 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-1 h-1 bg-neon-magenta rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-1 h-1 bg-neon-green rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  )
}