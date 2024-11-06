'use server'

import { db } from '@/lib/firebase'
import { collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore'
import { Student, Class, Result } from '@/lib/firebase'

export async function addStudent(studentData: Omit<Student, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, 'students'), studentData)
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error('Error adding student:', error)
    return { success: false, error: 'Failed to add student' }
  }
}

export async function updateStudent(id: string, studentData: Partial<Student>) {
  try {
    await updateDoc(doc(db, 'students', id), studentData)
    return { success: true }
  } catch (error) {
    console.error('Error updating student:', error)
    return { success: false, error: 'Failed to update student' }
  }
}

export async function addClass(classData: Omit<Class, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, 'classes'), classData)
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error('Error adding class:', error)
    return { success: false, error: 'Failed to add class' }
  }
}

export async function updateClass(id: string, classData: Partial<Class>) {
  try {
    await updateDoc(doc(db, 'classes', id), classData)
    return { success: true }
  } catch (error) {
    console.error('Error updating class:', error)
    return { success: false, error: 'Failed to update class' }
  }
}

export async function addResult(resultData: Omit<Result, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, 'results'), resultData)
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error('Error adding result:', error)
    return { success: false, error: 'Failed to add result' }
  }
}

export async function updateResult(id: string, resultData: Partial<Result>) {
  try {
    await updateDoc(doc(db, 'results', id), resultData)
    return { success: true }
  } catch (error) {
    console.error('Error updating result:', error)
    return { success: false, error: 'Failed to update result' }
  }
}