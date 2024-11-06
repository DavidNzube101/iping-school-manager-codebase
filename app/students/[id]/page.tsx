'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { useAuth } from '@/hooks/useAuth'
import { db, Student, Result } from '@/lib/firebase'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { updateStudent } from '@/app/actions'

export default function StudentPage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [results, setResults] = useState<Result[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentDoc = await getDoc(doc(db, 'students', params.id))
        if (studentDoc.exists()) {
          setStudent({ id: studentDoc.id, ...studentDoc.data() } as Student)
        } else {
          setError('Student not found')
        }
      } catch (err) {
        setError('Failed to fetch student data')
      }
    }

    fetchData()
  }, [params.id])

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  if (!user || !student) {
    return null
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">{student.name}</h1>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Email:</strong> {student.email}</p>
          <p><strong>Gender:</strong> {student.gender}</p>
          <p><strong>Class ID:</strong> {student.classId}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent>
          {results.length > 0 ? (
            <ul>
              {results.map((result) => (
                <li key={result.id}>
                  Grade: {result.grade}, Date: {result.date.toDate().toLocaleDateString()}
                </li>
              ))}
            </ul>
          ) : (
            <p>No results available</p>
          )}
        </CardContent>
      </Card>
      <Button className="mt-4" onClick={() => router.push('/students')}>Back to Students</Button>
    </div>
  )
}