import React from 'react'

export function Footer() {
  return (
    <footer className="border-t border-white/10 py-8 mt-16">
      <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="text-gray-400 text-sm">
          © 2024 GitSoul. Discover the soul of code.
        </div>
        
        <div className="flex space-x-6">
          <a href="#" className="text-gray-400 hover:text-neon-cyan transition-colors text-sm">
            Privacy
          </a>
          <a href="#" className="text-gray-400 hover:text-neon-cyan transition-colors text-sm">
            Terms
          </a>
          <a href="#" className="text-gray-400 hover:text-neon-cyan transition-colors text-sm">
            Contact
          </a>
        </div>
      </div>
    </footer>
  )
}