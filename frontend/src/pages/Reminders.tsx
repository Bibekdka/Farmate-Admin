import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../config/api'
import { Bell, CheckCircle2, Clock, Plus, AlertCircle } from 'lucide-react'

interface Reminder {
  id: number
  date: string
  title: string
  description: string
  priority: string
  completed: boolean
}

export default function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [priority, setPriority] = useState('Normal')

  const fetchReminders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/reminders`)
      setReminders(res.data)
    } catch (err) {
      console.error("Error fetching reminders:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReminders()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/api/admin/reminders`, {
        title,
        description,
        date,
        priority
      })
      setShowForm(false)
      setTitle('')
      setDescription('')
      fetchReminders()
    } catch (err) {
      alert("Failed to add reminder")
    }
  }

  const toggleComplete = async (id: number, currentStatus: boolean) => {
    try {
      await axios.patch(`${API_URL}/api/admin/reminders`, {
        id,
        completed: !currentStatus
      })
      fetchReminders()
    } catch (err) {
      alert("Failed to update status")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b p-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Tasks & Reminders</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
          >
            <Plus size={18} />
            {showForm ? 'Cancel' : 'New Task'}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-6">
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-xl border border-orange-100 animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="text-lg font-bold mb-6 text-orange-600">New Farm Task</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Task Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Fertilizer application"
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold" 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Date</label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Priority</label>
                  <select 
                    value={priority} 
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High (Red)</option>
                    <option value="Low">Low (Blue)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Notes</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 font-bold h-24"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button type="submit" className="bg-orange-500 text-white px-10 py-4 rounded-2xl font-black shadow-lg hover:bg-orange-600 transition-all active:scale-95">Set Reminder</button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-20 text-gray-400 font-bold">Organizing your schedule...</div>
          ) : reminders.length > 0 ? (
            reminders.map((rem) => (
              <div key={rem.id} className={`bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 transition-all ${rem.completed ? 'opacity-50' : ''}`}>
                <button 
                  onClick={() => toggleComplete(rem.id, rem.completed)}
                  className={`p-2 rounded-2xl transition-colors ${rem.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-500'}`}
                >
                  <CheckCircle2 size={24} />
                </button>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-bold text-lg leading-none ${rem.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>{rem.title}</h3>
                    {rem.priority === 'High' && <AlertCircle size={14} className="text-red-500" />}
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-400 tracking-wider">
                     <span className="flex items-center gap-1"><Clock size={12} /> {rem.date}</span>
                     <span className={`uppercase ${rem.priority === 'High' ? 'text-red-400' : rem.priority === 'Low' ? 'text-blue-400' : 'text-gray-400'}`}>
                        {rem.priority} Priority
                     </span>
                  </div>
                  {rem.description && !rem.completed && <p className="mt-2 text-sm text-gray-500 italic">{rem.description}</p>}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
               <Bell size={40} className="mx-auto text-gray-200 mb-4" />
               <p className="text-gray-400 font-medium">Your farm schedule is clear. Relax! 🌾</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
