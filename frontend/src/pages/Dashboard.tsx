import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import axios from 'axios'
import { API_URL } from '../config/api'

interface Activity {
  id: number
  date: string
  activity_type: string
  category: string
  amount: number
  description: string
}

interface Reminder {
  id: number
  title: string
  date: string
  priority: string
}

interface Stats {
  income: number
  expense: number
  balance: number
}

export default function Dashboard() {
  const { logout } = useContext(AuthContext)
  const [stats, setStats] = useState<Stats | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/stats`)
        setStats(res.data.stats)
        setActivities(res.data.activities)
        setReminders(res.data.reminders)
      } catch (err) {
        console.error("Error fetching stats:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <h1 className="text-xl font-bold text-green-700">Farmate Admin</h1>
          <button 
            onClick={logout}
            className="text-gray-500 hover:text-red-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium mb-1">Total Income</p>
            <p className="text-2xl font-bold text-gray-900">₹{stats?.income.toLocaleString() || '0'}</p>
            <div className="mt-2 text-xs text-green-600 font-medium">↑ 12% from last month</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 font-medium mb-1">Total Expenses</p>
            <p className="text-2xl font-bold text-gray-900">₹{stats?.expense.toLocaleString() || '0'}</p>
            <div className="mt-2 text-xs text-red-600 font-medium">↑ 5% from last month</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 bg-green-50/50">
            <p className="text-sm text-gray-500 font-medium mb-1">Net Balance</p>
            <p className="text-2xl font-bold text-green-700">₹{stats?.balance.toLocaleString() || '0'}</p>
            <div className="mt-2 text-xs text-gray-500">Available for reinvestment</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Activities */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">Recent Activities</h2>
                <Link to="/reports" className="text-sm text-green-600 font-medium hover:underline">View All</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {loading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={4} className="px-6 py-4 bg-gray-50/50"></td>
                        </tr>
                      ))
                    ) : activities.length > 0 ? (
                      activities.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-600">{item.date}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-800">{item.activity_type}</td>
                          <td className={`px-6 py-4 text-sm font-bold ${item.category === 'Income' ? 'text-green-600' : 'text-red-500'}`}>
                            {item.category === 'Income' ? '+' : '-'}₹{item.amount}
                          </td>
                          <td className="px-6 py-4 text-xs">
                            <span className={`px-2 py-1 rounded-full font-medium ${
                              item.category === 'Income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {item.category}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No recent activities found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Sidebar: Reminders & Quick Links */}
          <div className="space-y-6">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Reminders
              </h2>
              <div className="space-y-3">
                {reminders.map((rem) => (
                  <div key={rem.id} className="flex items-start gap-3 p-3 rounded-xl bg-orange-50/50 border border-orange-100">
                    <div className={`mt-1.5 w-2 h-2 rounded-full ${rem.priority === 'High' ? 'bg-red-500' : 'bg-orange-400'}`}></div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{rem.title}</p>
                      <p className="text-xs text-gray-500">{rem.date}</p>
                    </div>
                  </div>
                ))}
                {reminders.length === 0 && <p className="text-sm text-gray-400 text-center py-4">All tasks completed!</p>}
              </div>
            </section>

            <section className="bg-green-700 p-6 rounded-2xl shadow-lg text-white">
              <h3 className="text-lg font-bold mb-2">Need help?</h3>
              <p className="text-green-100 text-sm mb-4">Ask our Farm AI about crop diseases, yields, or market trends.</p>
              <Link 
                to="/ai"
                className="inline-block bg-white text-green-700 px-6 py-2 rounded-xl font-bold text-sm hover:bg-green-50 transition-colors shadow-md"
              >
                Start AI Chat
              </Link>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
