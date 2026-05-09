import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../config/api'
import { TrendingUp, Plus, Calendar, Target, Scale, FileText, Trash2 } from 'lucide-react'

interface CropItem {
  id: number
  crop_name: string
}

interface YieldRecord {
  id: number
  date: string
  crop_name: string
  yield_value: number
  unit: string
  yield_in_kg: number
  notes: string
}

export default function Yields() {
  const [yields, setYields] = useState<YieldRecord[]>([])
  const [crops, setCrops] = useState<CropItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [cropId, setCropId] = useState('')
  const [yieldValue, setYieldValue] = useState('')
  const [unit, setUnit] = useState('kg')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const fetchData = async () => {
    try {
      const [yieldsRes, cropsRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/yields`),
        axios.get(`${API_URL}/api/admin/crops`)
      ])
      setYields(yieldsRes.data)
      setCrops(cropsRes.data)
    } catch (err) {
      console.error("Error fetching yields:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Calculate KG conversion for convenience (simplified)
    let inKg = parseFloat(yieldValue)
    if (unit === 'quintal') inKg *= 100
    if (unit === 'tons') inKg *= 1000
    if (unit === 'grams') inKg /= 1000

    try {
      await axios.post(`${API_URL}/api/admin/yields`, {
        crop_id: parseInt(cropId),
        yield_value: parseFloat(yieldValue),
        unit,
        yield_in_kg: inKg,
        notes,
        date
      })
      setShowForm(false)
      setYieldValue('')
      setNotes('')
      fetchData()
    } catch (err) {
      alert("Failed to save yield")
    }
  }

  const totalYield = yields.reduce((sum, item) => sum + item.yield_in_kg, 0)

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 font-sans text-slate-900">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                <TrendingUp size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">Yield Tracking</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">Harvest Performance</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`${showForm ? 'bg-slate-100 text-slate-600' : 'bg-emerald-600 text-white shadow-emerald-200'} px-6 py-2.5 rounded-2xl text-sm font-black flex items-center gap-2 hover:opacity-90 transition-all shadow-xl active:scale-95`}
          >
            {showForm ? <Trash2 size={18} className="rotate-45" /> : <Plus size={18} />}
            {showForm ? 'CLOSE' : 'LOG HARVEST'}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-8 mt-4">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 relative z-10">Cumulative Harvest</p>
              <div className="flex items-end justify-between relative z-10">
                <p className="text-3xl font-black text-emerald-600">{totalYield.toLocaleString()} <span className="text-sm font-bold text-slate-400">KG</span></p>
                <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                   <Scale size={18} />
                </div>
              </div>
           </div>
           
           <div className="bg-slate-900 p-6 rounded-[2rem] shadow-2xl shadow-slate-100 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/5 rounded-full group-hover:scale-110 transition-transform duration-700" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 relative z-10">Active Crop Cycles</p>
              <div className="flex items-end justify-between relative z-10 text-white">
                <p className="text-3xl font-black">{crops.length}</p>
                <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
                   <Target size={18} />
                </div>
              </div>
           </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-emerald-100/30 border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                 <span className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-black text-lg">🌾</span>
                 New Yield Record
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Harvest Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-[1.25rem] transition-all font-bold text-slate-800 outline-none" 
                      required 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Select Crop</label>
                  <select 
                    value={cropId} 
                    onChange={(e) => setCropId(e.target.value)}
                    className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-[1.25rem] transition-all font-bold text-slate-800 outline-none" 
                    required 
                  >
                    <option value="">Choose Crop...</option>
                    {crops.map(c => <option key={c.id} value={c.id}>{c.crop_name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Value</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={yieldValue} 
                      onChange={(e) => setYieldValue(e.target.value)}
                      placeholder="0.00"
                      className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-[1.25rem] transition-all font-black text-slate-800 text-xl outline-none" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Unit</label>
                    <select 
                      value={unit} 
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-[1.25rem] transition-all font-bold text-slate-800 outline-none" 
                    >
                      <option value="kg">KG</option>
                      <option value="quintal">Quintal</option>
                      <option value="tons">Tons</option>
                      <option value="grams">Grams</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Quality Notes</label>
                  <textarea 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe harvest quality, color, weight variations..."
                    className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-[1.5rem] transition-all font-bold text-slate-800 outline-none h-[180px] resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-50 flex justify-end">
              <button 
                type="submit" 
                className="bg-emerald-600 text-white px-16 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center gap-3"
              >
                <Plus size={20} />
                Confirm Yield
              </button>
            </div>
          </form>
        )}

        {/* Data View Section */}
        <div className="space-y-6">
          {loading ? (
             <div className="grid grid-cols-1 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-white rounded-[2rem] animate-pulse border border-slate-50"></div>
                ))}
             </div>
          ) : yields.length > 0 ? (
            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-slate-50 text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">
                     <tr>
                       <th className="px-8 py-5">Date</th>
                       <th className="px-8 py-5">Crop</th>
                       <th className="px-8 py-5 text-right">Yield Value</th>
                       <th className="px-8 py-5 text-right">Total (KG)</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {yields.map((y) => (
                       <tr key={y.id} className="hover:bg-slate-50/50 transition-all">
                         <td className="px-8 py-6 font-bold text-slate-500">{y.date}</td>
                         <td className="px-8 py-6">
                            <h3 className="font-black text-slate-800">{y.crop_name}</h3>
                         </td>
                         <td className="px-8 py-6 text-right font-black text-slate-600">
                            {y.yield_value} {y.unit}
                         </td>
                         <td className="px-8 py-6 text-right">
                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg font-black text-xs">
                               {y.yield_in_kg.toLocaleString()} KG
                            </span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          ) : (
            <div className="px-8 py-32 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
               <FileText size={40} className="mx-auto text-slate-200 mb-4" />
               <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">No Yield Records</h3>
               <p className="text-slate-300 font-bold mt-2">Start logging your harvest to see trends</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
