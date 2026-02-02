import React from 'react'
import Link from 'next/link'

export function Header() {
  return (
    <header className="py-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-neon-cyan to-neon-magenta rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">GS</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-cyan via-neon-magenta to-neon-green bg-clip-text text-transparent">
            GitSoul
          </h1>
        </Link>
        
        <nav className="hidden md:flex space-x-6">
          <a href="#" className="text-gray-400 hover:text-white transition-colors">About</a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">GitHub</a>
        </nav>
      </div>
    </header>
  )
}