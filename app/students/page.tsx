'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { useAuth } from '@/hooks/useAuth'
import { db, Student, Class } from '@/lib/firebase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function StudentsPage() {
  const { user, teacher, loading } = useAuth()
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Class[]>([])
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
      } catch (err) {
        setError('Failed to fetch data. Please try again later.')
      }
    }

    fetchData()
  }, [teacher])

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  if (!user || !teacher) {
    return null
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">Students</h1>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="mb-6 flex items-center justify-between">
        <Input
          placeholder="Search students..."
          className="w-[300px]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button>Add Student</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Class</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStudents.map((student) => (
            <TableRow key={student.id}>
              <TableCell>{student.name}</TableCell>
              <TableCell>{student.email}</TableCell>
              <TableCell>{student.gender}</TableCell>
              <TableCell>{classes.find(c => c.id === student.classId)?.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}