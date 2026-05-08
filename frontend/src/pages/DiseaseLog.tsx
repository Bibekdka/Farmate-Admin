import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../config/api'
import { ShieldAlert, Trash2, Plus, Activity, Crop } from 'lucide-react'

interface CropItem {
  id: number
  crop_name: string
}

interface DiseaseLog {
  id: number
  date: string
  crop_name: string
  disease_name: string
  severity: string
  affected_area: string
  treatment: string
  notes: string
}

export default function DiseaseLog() {
  const [logs, setLogs] = useState<DiseaseLog[]>([])
  const [crops, setCrops] = useState<CropItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [cropId, setCropId] = useState('')
  const [diseaseName, setDiseaseName] = useState('')
  const [severity, setSeverity] = useState('Moderate')
  const [affectedArea, setAffectedArea] = useState('')
  const [treatment, setTreatment] = useState('')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const fetchData = async () => {
    try {
      const [logsRes, cropsRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/disease_logs`),
        axios.get(`${API_URL}/api/admin/crops`)
      ])
      setLogs(logsRes.data)
      setCrops(cropsRes.data)
    } catch (err) {
      console.error("Error fetching disease data:", err)
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
      await axios.post(`${API_URL}/api/admin/disease_logs`, {
        crop_id: parseInt(cropId),
        disease_name: diseaseName,
        severity,
        affected_area: affectedArea,
        treatment,
        notes,
        date
      })
      setShowForm(false)
      setDiseaseName('')
      setTreatment('')
      fetchData()
    } catch (err) {
      alert("Failed to add log")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Disease & Pest Log</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
          >
            <Plus size={18} />
            {showForm ? 'Cancel' : 'Log Incident'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-xl border border-red-100 animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="text-lg font-bold mb-6 text-red-600">Report Health Issue</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Select Crop</label>
                <select 
                  value={cropId} 
                  onChange={(e) => setCropId(e.target.value)}
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 font-bold"
                  required
                >
                  <option value="">Choose a crop...</option>
                  {crops.map(c => <option key={c.id} value={c.id}>{c.crop_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Disease/Pest Name</label>
                <input 
                  type="text" 
                  value={diseaseName} 
                  onChange={(e) => setDiseaseName(e.target.value)}
                  placeholder="e.g. Leaf Blast"
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 font-bold" 
                  required 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Severity</label>
                <select 
                  value={severity} 
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 font-bold"
                >
                  <option value="Mild">Mild (Low impact)</option>
                  <option value="Moderate">Moderate (Action needed)</option>
                  <option value="Severe">Severe (Urgent!)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Date</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 font-bold" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Treatment Applied</label>
                <input 
                  type="text" 
                  value={treatment} 
                  onChange={(e) => setTreatment(e.target.value)}
                  placeholder="e.g. Applied Organic Fungicide"
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-red-500 font-bold" 
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button type="submit" className="bg-red-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg hover:bg-red-700 transition-all active:scale-95">Log Health Data</button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div className="text-center py-20 text-gray-400 font-bold">Diagnosing your farm...</div>
          ) : logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                     <div className={`p-3 rounded-2xl ${log.severity === 'Severe' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                        <ShieldAlert size={20} />
                     </div>
                     <div>
                        <h3 className="font-black text-gray-900 leading-none">{log.disease_name}</h3>
                        <p className="text-xs font-bold text-gray-400 uppercase mt-1 tracking-widest">Crop: {log.crop_name}</p>
                     </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${log.severity === 'Severe' ? 'bg-red-600 text-white' : 'bg-orange-100 text-orange-700'}`}>
                    {log.severity}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-4 border-t border-gray-50">
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1 flex items-center gap-1"><Activity size={10} /> Treatment</p>
                      <p className="text-sm font-bold text-gray-800">{log.treatment || 'No treatment recorded'}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Date Logged</p>
                      <p className="text-sm font-bold text-gray-800">{log.date}</p>
                   </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
               <ShieldAlert size={40} className="mx-auto text-gray-200 mb-4" />
               <p className="text-gray-400 font-medium">All crops seem healthy. No diseases reported!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
