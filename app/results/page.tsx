'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { useAuth } from '@/hooks/useAuth'
import { db, Student, Class, Result } from '@/lib/firebase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ResultsPage() {
  const { user, teacher, loading } = useAuth()
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [results, setResults] = useState<Result[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchData = async () => {
      if (!teacher) return
      try {
        const classesQuery = query(collection(db, 'classes'), where('teacherId', '==', teacher.id))
        const classesSnapshot = await getDocs(classesQuery)
        const classesData = classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Class))
        setClasses(classesData)

        const studentsPromises = classesData.map(async (cls) => {
          const studentsQuery = query(collection(db, 'students'), where('classId', '==', cls.id))
          const studentsSnapshot = await getDocs(studentsQuery)
          return studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student))
        })
        const studentsData = (await Promise.all(studentsPromises)).flat()
        setStudents(studentsData)

        const resultsPromises = classesData.map(async (cls) => {
          const resultsQuery = query(collection(db, 'results'), where('classId', '==', cls.id))
          const resultsSnapshot = await getDocs(resultsQuery)
          return resultsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Result))
        })
        const resultsData = (await Promise.all(resultsPromises)).flat()
        setResults(resultsData)
      } catch (err) {
        setError('Failed to fetch data. Please try again later.')
      }
    }

    fetchData()
  }, [teacher])

  const filteredResults = results.filter(result => {
    const student = students.find(s => s.id === result.studentId)
    const cls = classes.find(c => c.id === result.classId)
    return (
      student?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls?.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  if (!user || !teacher) {
    return null
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Results</h1>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="mb-6 flex items-center justify-between">
        <Input
          placeholder="Search results..."
          className="w-[300px]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button>Add Result</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredResults.map((result) => {
            const student = students.find(s => s.id === result.studentId)
            const cls = classes.find(c => c.id === result.classId)
            return (
              <TableRow key={result.id}>
                <TableCell>{student?.name}</TableCell>
                <TableCell>{cls?.name}</TableCell>
                <TableCell>{result.grade}</TableCell>
                <TableCell>{result.date.toDate().toLocaleDateString()}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}