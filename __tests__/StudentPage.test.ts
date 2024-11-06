import React from 'react'
import { render, screen } from '@testing-library/react'
import StudentPage from '@/app/students/[id]/page'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

jest.mock('@/hooks/useAuth')
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('StudentPage', () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({ user: { uid: 'testUid' }, loading: false })
    ;(useRouter as jest.Mock).mockReturnValue({ push: jest.fn() })
  })

  test('renders loading state', () => {
    ;(useAuth as jest.Mock).mockReturnValue({ user: null, loading: true })
    render(<StudentPage params={{ id: 'testId' }} />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  test('redirects to login if user is not authenticated', () => {
    const mockPush = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    ;(useAuth as jest.Mock).mockReturnValue({ user: null, loading: false })
    render(<StudentPage params={{ id: 'testId' }} />)
    expect(mockPush).toHaveBeenCalledWith('/login')
  })

  // Add more tests for different scenarios...
})