import { useState, useEffect } from 'react'
import { auth, db } from '@/lib/firebase'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { Teacher } from '@/lib/firebase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)
      if (user) {
        const teacherDoc = await getDoc(doc(db, 'teachers', user.uid))
        if (teacherDoc.exists()) {
          setTeacher({ id: teacherDoc.id, ...teacherDoc.data() } as Teacher)
        }
      } else {
        setTeacher(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const logout = () => {
    return signOut(auth)
  }

  return { user, teacher, loading, login, logout }
}