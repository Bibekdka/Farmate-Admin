import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import axios from 'axios'
import { API_URL } from '../config/api'
import { Wallet, Notebook, CloudRain, MessageSquare, Activity, Home } from 'lucide-react'

interface ActivityData {
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
  const [activities, setActivities] = useState<ActivityData[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/admin/stats?limit=20`)
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

  if (loading || !stats) {
    return <div className="p-10 text-center font-bold text-gray-400">Loading your farm data...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard</h1>
            <p className="text-gray-500 font-medium">Welcome back, Farm Manager</p>
          </div>
          <div className="hidden md:flex gap-3">
             <button className="bg-white border border-gray-100 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors">Export Report</button>
             <button onClick={logout} className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-green-700 transition-colors">Sync Data</button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Income</p>
              <h2 className="text-3xl font-black text-green-600">₹{stats.income.toLocaleString()}</h2>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
               <Wallet size={80} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Expenses</p>
              <h2 className="text-3xl font-black text-red-500">₹{stats.expense.toLocaleString()}</h2>
            </div>
             <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
               <Wallet size={80} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Net Balance</p>
              <h2 className={`text-3xl font-black ${stats.balance >= 0 ? 'text-blue-600' : 'text-orange-500'}`}>
                ₹{stats.balance.toLocaleString()}
              </h2>
            </div>
             <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
               <Activity size={80} />
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link to="/financials" className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:bg-green-50 transition-colors">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl"><Wallet size={20} /></div>
            <span className="text-xs font-bold text-gray-600">Finance</span>
          </Link>
          <Link to="/logs" className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:bg-green-50 transition-colors">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Notebook size={20} /></div>
            <span className="text-xs font-bold text-gray-600">Daily Blog</span>
          </Link>
          <Link to="/weather" className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:bg-green-50 transition-colors">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl"><CloudRain size={20} /></div>
            <span className="text-xs font-bold text-gray-600">Weather</span>
          </Link>
          <Link to="/legacy-dashboard" className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center gap-2 hover:bg-green-50 transition-colors">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Home size={20} /></div>
            <span className="text-xs font-bold text-gray-600">Legacy View</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content: Activities */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">Recent Activities</h2>
                <Link to="/financials" className="text-sm text-green-600 font-bold hover:underline">View All</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-[10px] text-gray-400 uppercase font-black tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Activity</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {activities.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-xs text-gray-500">{item.date}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-gray-800">{item.activity_type}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">{item.category}</p>
                        </td>
                        <td className={`px-6 py-4 text-right text-sm font-black ${item.category === 'Income' ? 'text-green-600' : 'text-red-500'}`}>
                          {item.category === 'Income' ? '+' : '-'}₹{item.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {activities.length === 0 && (
                      <tr><td colSpan={3} className="px-6 py-10 text-center text-gray-400">No activities recorded</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Sidebar: Reminders */}
          <div className="space-y-6">
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Activity size={20} className="text-orange-500" />
                Tasks & Reminders
              </h2>
              <div className="space-y-4">
                {reminders.map((rem) => (
                  <div key={rem.id} className="flex items-start gap-4 p-4 rounded-2xl bg-orange-50/50 border border-orange-100 transition-transform hover:scale-[1.02]">
                    <div className={`mt-1.5 w-2.5 h-2.5 rounded-full ${rem.priority === 'High' ? 'bg-red-500' : 'bg-orange-400'} shadow-sm shadow-orange-200`}></div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{rem.title}</p>
                      <p className="text-xs font-bold text-orange-600/60 uppercase mt-0.5">{rem.date}</p>
                    </div>
                  </div>
                ))}
                {reminders.length === 0 && <p className="text-sm text-gray-400 text-center py-6 italic font-medium">Your schedule is clear! 🌾</p>}
              </div>
            </section>

            <section className="bg-gradient-to-br from-green-600 to-green-800 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden group">
               <div className="relative z-10">
                 <h3 className="text-xl font-black mb-3 tracking-tight">Crop Manager</h3>
                 <p className="text-green-100 text-sm font-medium mb-6 leading-relaxed opacity-90">Track your crop lifecycles and harvest estimations in one place.</p>
                 <Link 
                   to="/crops"
                   className="inline-block bg-white text-green-700 px-8 py-3 rounded-2xl font-black text-sm hover:bg-green-50 transition-all shadow-lg active:scale-95"
                 >
                   Manage Crops
                 </Link>
               </div>
               <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
