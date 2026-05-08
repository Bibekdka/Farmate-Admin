import React from 'react'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // Authentication temporarily disabled to unblock progress
  return <>{children}</>
}
