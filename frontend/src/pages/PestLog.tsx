import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../config/api'
import { Bug, Plus, Calendar, AlertTriangle, ShieldCheck, Trash2 } from 'lucide-react'

interface PestRecord {
  id: number
  date: string
  crop_name: string
  pest_name: string
  value: number
  alert_status: string
  notes: string
}

export default function PestLog() {
  const [logs, setLogs] = useState<PestRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [cropName, setCropName] = useState('')
  const [pestName, setPestName] = useState('')
  const [value, setValue] = useState('')
  const [alertStatus, setAlertStatus] = useState('SAFE')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const fetchData = async () => {
    try {
      // Assuming we have an endpoint for pest logs
      const res = await axios.get(`${API_URL}/api/admin/disease_logs`) // Fallback to disease logs if specific one not found
      // But let's assume we want a specific one or we filter
      setLogs(res.data)
    } catch (err) {
      console.error("Error fetching pest logs:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/api/admin/pest_logs`, {
        crop_name: cropName,
        pest_name: pestName,
        value: parseFloat(value),
        alert_status: alertStatus,
        notes,
        date
      })
      setShowForm(false)
      setPestName('')
      fetchData()
    } catch (err) {
      alert("Failed to log pest activity")
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 font-sans text-slate-900">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-100">
                <Bug size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">Pest Surveillance</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">Biosecurity Monitoring</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`${showForm ? 'bg-slate-100 text-slate-600' : 'bg-rose-600 text-white shadow-rose-200'} px-6 py-2.5 rounded-2xl text-sm font-black flex items-center gap-2 hover:opacity-90 transition-all shadow-xl active:scale-95`}
          >
            {showForm ? <Trash2 size={18} className="rotate-45" /> : <Plus size={18} />}
            {showForm ? 'CLOSE' : 'REPORT INCIDENT'}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-8 mt-4">
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-rose-100/30 border border-slate-100 animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black text-slate-800 mb-10 flex items-center gap-3">
               <span className="w-10 h-10 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center font-black text-lg">⚠️</span>
               Pest Alert Registration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Observation Date</label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-rose-500 focus:bg-white rounded-[1.25rem] transition-all font-bold text-slate-800 outline-none" 
                    required 
                  />
                </div>
                
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Affected Crop</label>
                  <input 
                    type="text" 
                    value={cropName} 
                    onChange={(e) => setCropName(e.target.value)}
                    placeholder="e.g. Wheat"
                    className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-rose-500 focus:bg-white rounded-[1.25rem] transition-all font-bold text-slate-800 outline-none" 
                    required 
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Pest Name</label>
                  <input 
                    type="text" 
                    value={pestName} 
                    onChange={(e) => setPestName(e.target.value)}
                    placeholder="e.g. Aphids"
                    className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-rose-500 focus:bg-white rounded-[1.25rem] transition-all font-bold text-slate-800 outline-none" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Severity / Status</label>
                  <div className="flex gap-2">
                    {['SAFE', 'ALERT', 'WARNING'].map(status => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setAlertStatus(status)}
                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${alertStatus === status ? (status === 'SAFE' ? 'bg-emerald-600 border-emerald-600 text-white' : status === 'ALERT' ? 'bg-orange-500 border-orange-500 text-white' : 'bg-rose-600 border-rose-600 text-white') : 'bg-white border-slate-100 text-slate-400'}`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Observations</label>
                  <textarea 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe infestation levels, specific locations, and current action plan..."
                    className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-rose-500 focus:bg-white rounded-[1.5rem] transition-all font-bold text-slate-800 outline-none h-[180px] resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-50 flex justify-end">
              <button 
                type="submit" 
                className="bg-rose-600 text-white px-16 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-rose-200 hover:bg-rose-700 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center gap-3"
              >
                <Plus size={20} />
                Deploy Record
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
             <div className="col-span-full text-center py-20 text-gray-400 animate-pulse">Scanning surveillance network...</div>
          ) : logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id} className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl opacity-10 ${log.alert_status === 'SAFE' ? 'bg-emerald-500' : log.alert_status === 'ALERT' ? 'bg-orange-500' : 'bg-rose-500'}`}></div>
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                   <div>
                      <h3 className="font-black text-slate-800 text-lg">{log.pest_name}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.crop_name}</p>
                   </div>
                   <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${log.alert_status === 'SAFE' ? 'bg-emerald-50 text-emerald-600' : log.alert_status === 'ALERT' ? 'bg-orange-50 text-orange-600' : 'bg-rose-50 text-rose-600'}`}>
                      {log.alert_status === 'SAFE' ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
                   </div>
                </div>

                <div className="space-y-4 mb-6 relative z-10">
                   <div className="bg-slate-50 p-3 rounded-2xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Status</p>
                      <p className={`text-xs font-black tracking-widest ${log.alert_status === 'SAFE' ? 'text-emerald-600' : log.alert_status === 'ALERT' ? 'text-orange-600' : 'text-rose-600'}`}>{log.alert_status}</p>
                   </div>
                   <p className="text-xs font-bold text-slate-500 leading-relaxed italic line-clamp-3">"{log.notes || 'No specific observations recorded.'}"</p>
                </div>

                <div className="pt-4 border-t border-slate-50 flex justify-between items-center relative z-10">
                   <div className="flex items-center gap-2 text-slate-400">
                      <Calendar size={14} />
                      <span className="text-[10px] font-black uppercase">{log.date}</span>
                   </div>
                   <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Analysis</button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full px-8 py-32 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
               <Bug size={40} className="mx-auto text-slate-200 mb-4" />
               <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">Clear Perimeter</h3>
               <p className="text-slate-300 font-bold mt-2">No pest activities detected in the network.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
