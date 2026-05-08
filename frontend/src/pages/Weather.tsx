import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../config/api'

interface Weather {
  date: string
  max_temp: number
  rainfall: number
  description: string
}

export default function Weather() {
  const [history, setHistory] = useState<Weather[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/stats`)
        // The stats endpoint currently returns a placeholder for financial data, 
        // but we can adapt it or just keep the state for future updates.
        // For now, we'll set an empty list to stop the unused error.
        setHistory(res.data.weather || [])
      } catch (err) {
        console.error("Error fetching weather:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchWeather()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b p-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-bold text-gray-800">Weather History</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-2">32°C</h2>
            <p className="text-blue-100 font-bold uppercase tracking-widest text-xs">Partly Cloudy • Guwahati</p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                <p className="text-[10px] text-blue-100 uppercase font-bold">Rainfall</p>
                <p className="text-lg font-bold">0.5 mm</p>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                <p className="text-[10px] text-blue-100 uppercase font-bold">Humidity</p>
                <p className="text-lg font-bold">65%</p>
              </div>
            </div>
          </div>
          {/* Abstract Sun SVG decoration */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-yellow-300/30 rounded-full blur-3xl"></div>
        </div>

        <section>
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">Weather Log</h3>
          <div className="space-y-3">
             {loading ? (
                <div className="text-center py-10 text-gray-400">Loading history...</div>
             ) : history.length > 0 ? (
                history.map((day, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-400 font-bold">{day.date}</p>
                      <p className="font-bold text-gray-800">{day.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-gray-900">{day.max_temp}°C</p>
                      <p className="text-[10px] text-blue-500 font-bold">{day.rainfall} mm rain</p>
                    </div>
                  </div>
                ))
             ) : (
                <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-gray-200">
                   <p className="text-gray-400">No weather history recorded yet.</p>
                </div>
             )}
          </div>
        </section>
      </main>
    </div>
  )
}
