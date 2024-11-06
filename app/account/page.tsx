'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function AccountPage() {
  const { user, teacher, loading, logout } = useAuth()
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (teacher) {
      setName(teacher.name)
      setEmail(teacher.email)
    }
  }, [teacher])

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (err) {
      setError('Failed to log out. Please try again.')
    }
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  if (!user || !teacher) {
    return null
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">My Account</h1>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name">Name</label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email">Email</label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="teacherId">Teacher ID</label>
            <Input
              id="teacherId"
              value={teacher.teacherId}
              disabled
            />
          </div>
          <Button onClick={handleLogout} className="w-full">Log Out</Button>
        </CardContent>
      </Card>
    </div>
  )
}