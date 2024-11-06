import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col justify-center items-center text-white">
      <header className="mb-8">
        <h1 className="text-4xl md:text-6xl font-bold text-center">
          <span className="animate-pulse bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            IPING
          </span>{' '}
          &nbsp;School Manager
        </h1>
      </header>
      <main className="text-center">
        <p className="text-xl mb-8 max-w-md mx-auto">
          Empower your teaching with our intuitive and efficient school management system.
        </p>
        <div className="space-y-4">
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            <Link href="/login">Login as Teacher</Link>
          </Button>
          
        </div>
      </main>
      <footer className="mt-16 text-sm text-gray-400">
        © 2024 IPING School Manager. All rights reserved.
      </footer>
    </div>
  )
}