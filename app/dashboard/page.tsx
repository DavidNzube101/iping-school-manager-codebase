'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart, LineChart, PieChart } from 'recharts'
import { Bell, Search, Settings, User } from 'lucide-react'
import { collection, getDocs, query, where } from 'firebase/firestore'

import { useAuth } from '@/hooks/useAuth'
import { db, Student, Class, Result } from '@/lib/firebase'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DashboardPage() {
  const { user, teacher, loading } = useAuth()
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [results, setResults] = useState<Result[]>([])
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
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

        if (classesData.length > 0) {
          setSelectedClass(classesData[0])
        }
      } catch (err) {
        setError('Failed to fetch data. Please try again later.')
      }
    }

    fetchData()
  }, [teacher])

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  if (!user || !teacher) {
    return null
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        {/* Left Sidebar */}
        <Sidebar className="border-r">
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-2">
              <img src="/logo.svg" alt="School Logo" className="h-8 w-8" />
              <span className="font-semibold">Teacher Dashboard</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>Overview</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => router.push('/students')}>Students</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => router.push('/classes')}>Classes</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => router.push('/results')}>Results</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => router.push('/account')}>My Account</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          {/* Top Bar */}
          <header className="flex items-center justify-between border-b px-6 py-3">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  className="w-[300px] pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="grid grid-cols-[1fr_300px] gap-6 p-6">
            {error && (
              <Alert variant="destructive" className="col-span-2">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Students</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{students.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Total Classes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{classes.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Average Class Size</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {Math.round(students.length / (classes.length || 1))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Class Size Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Class Sizes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      students: {
                        label: "Students",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <BarChart
                      data={classes.map(c => ({
                        name: c.name,
                        students: students.filter(s => s.classId === c.id).length
                      }))}
                    >
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Class Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Class Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      grade: {
                        label: "Grade",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <LineChart
                      data={results
                        .filter(r => r.classId === selectedClass?.id)
                        .map(r => ({
                          name: students.find(s => s.id === r.studentId)?.name || '',
                          grade: r.grade
                        }))}
                    >
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Gender Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Gender Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      value: {
                        label: "Students",
                        color: "hsl(var(--chart-3))",
                      },
                    }}
                    className="h-[200px]"
                  >
                    <PieChart
                      data={[
                        {
                          name: "Male",
                          value: students.filter(s => s.gender === 'male').length
                        },
                        {
                          name: "Female",
                          value: students.filter(s => s.gender === 'female').length
                        },
                        {
                          name: "Other",
                          value: students.filter(s => s.gender === 'other').length
                        }
                      ]}
                    >
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results.slice(0, 5).map(result => {
                      const student = students.find(s => s.id === result.studentId)
                      const cls = classes.find(c => c.id === result.classId)
                      return (
                        <div key={result.id} className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted" />
                          <div>
                            <div className="font-medium">{student?.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Scored {result.grade} in {cls?.name}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}