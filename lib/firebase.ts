import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyAJGyClwBG6KcKY2RsSRO1uPyeezypKyUY",
  authDomain: "school-management-1264e.firebaseapp.com",
  projectId: "school-management-1264e",
  storageBucket: "school-management-1264e.firebasestorage.app",
  messagingSenderId: "264229243802",
  appId: "1:264229243802:web:e7123fc8395ed62922c823"
}

let app: FirebaseApp
let auth: Auth
let db: Firestore

if (!getApps().length) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
}

export { app, auth, db }

// TypeScript types for our data models
export interface Teacher {
  id: string
  name: string
  email: string
  teacherId: string
}

export interface Student {
  id: string
  name: string
  email: string
  gender: 'male' | 'female' | 'other'
  classId: string
  grade?: number
}

export interface Class {
  id: string
  name: string
  teacherId: string
  subject: string
}

export interface Result {
  id: string
  studentId: string
  classId: string
  grade: number
  date: Date
}