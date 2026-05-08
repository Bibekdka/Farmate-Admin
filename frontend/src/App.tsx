import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import AIChat from './pages/AIChat'
import Login from './pages/Login'
import Financials from './pages/Financials'
import DailyLog from './pages/DailyLog'
import Weather from './pages/Weather'
import ProtectedRoute from './components/ProtectedRoute'
import BottomNav from './components/BottomNav'
import Sidebar from './components/Sidebar'

export default function App() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 pb-20 md:pb-0">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/ai" element={
              <ProtectedRoute>
                <AIChat />
              </ProtectedRoute>
            } />
            <Route path="/financials" element={
              <ProtectedRoute>
                <Financials />
              </ProtectedRoute>
            } />
            <Route path="/logs" element={
              <ProtectedRoute>
                <DailyLog />
              </ProtectedRoute>
            } />
            <Route path="/weather" element={
              <ProtectedRoute>
                <Weather />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
