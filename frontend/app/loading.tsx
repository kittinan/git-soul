export default function Loading() {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-neon-cyan/20 border-t-neon-cyan rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-neon-magenta/20 border-t-neon-magenta rounded-full animate-spin animate-ping"></div>
        </div>
        <p className="mt-4 text-gray-400">Loading GitSoul...</p>
      </div>
    </div>
  )
}