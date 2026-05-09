import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import BottomNav from './components/BottomNav'
import Sidebar from './components/Sidebar'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const AIChat = lazy(() => import('./pages/AIChat'))
const Login = lazy(() => import('./pages/Login'))
const Financials = lazy(() => import('./pages/Financials'))
const DailyLog = lazy(() => import('./pages/DailyLog'))
const Weather = lazy(() => import('./pages/Weather'))
const Crops = lazy(() => import('./pages/Crops'))
const Reminders = lazy(() => import('./pages/Reminders'))
const DiseaseLog = lazy(() => import('./pages/DiseaseLog'))
const Yields = lazy(() => import('./pages/Yields'))
const PestLog = lazy(() => import('./pages/PestLog'))

export default function App() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 pb-20 md:pb-0">
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-gray-300 animate-pulse">Loading Farmate...</div>}>
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
              <Route path="/crops" element={
                <ProtectedRoute>
                  <Crops />
                </ProtectedRoute>
              } />
              <Route path="/reminders" element={
                <ProtectedRoute>
                  <Reminders />
                </ProtectedRoute>
              } />
              <Route path="/diseases" element={
                <ProtectedRoute>
                  <DiseaseLog />
                </ProtectedRoute>
              } />
              <Route path="/yields" element={
                <ProtectedRoute>
                  <Yields />
                </ProtectedRoute>
              } />
              <Route path="/pests" element={
                <ProtectedRoute>
                  <PestLog />
                </ProtectedRoute>
              } />
            </Routes>
          </Suspense>
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
