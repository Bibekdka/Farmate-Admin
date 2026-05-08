import {
  createContext,
  useEffect,
  useState
} from 'react'

import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import type { User } from 'firebase/auth'

import {
  auth,
  provider
} from '../firebase'

export const AuthContext = createContext<any>(null)

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth || !auth.app) {
      console.error("Auth is not initialized correctly.")
      setLoading(false)
      return
    }

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })

    // Safety timeout: if auth doesn't respond in 10 seconds, clear loading
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 10000)

    return () => {
      unsub()
      clearTimeout(timeout)
    }
  }, [])

  const login = async () => {
    await signInWithPopup(auth, provider)
  }

  const logout = async () => {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
