import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../config/api'
import ReactMarkdown from 'react-markdown'
import { Sprout, Calendar, Ruler, Info, Activity, Plus } from 'lucide-react'

interface Crop {
  id: number
  crop_name: string
  variety: string
  area: string
  sowing_date: string
  expected_harvest: string
  status: string
  notes: string
}

export default function Crops() {
  const [crops, setCrops] = useState<Crop[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [aiLoading, setAiLoading] = useState<number | null>(null)
  const [aiResponse, setAiResponse] = useState<string | null>(null)

  // Form state
  const [cropName, setCropName] = useState('')
  const [variety, setVariety] = useState('')
  const [area, setArea] = useState('')
  const [sowingDate, setSowingDate] = useState(new Date().toISOString().split('T')[0])
  const [expectedHarvest, setExpectedHarvest] = useState('')
  const [notes, setNotes] = useState('')

  const fetchCrops = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/crops`)
      setCrops(res.data)
    } catch (err) {
      console.error("Error fetching crops:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCrops()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/api/admin/crops`, {
        crop_name: cropName,
        variety,
        area,
        sowing_date: sowingDate,
        expected_harvest: expectedHarvest,
        notes
      })
      setShowForm(false)
      setCropName('')
      setVariety('')
      setArea('')
      setExpectedHarvest('')
      setNotes('')
      fetchCrops()
    } catch (err) {
      alert("Failed to add crop")
    }
  }

  const askCropDoctor = async (crop: Crop) => {
    setAiLoading(crop.id)
    setAiResponse(null)
    try {
      const res = await axios.post(`${API_URL}/api/ai/ask_crop_doctor`, {
        crop_name: crop.crop_name,
        sowing_date: crop.sowing_date
      })
      setAiResponse(res.data.content)
    } catch (err) {
      alert("AI failed to respond")
    } finally {
      setAiLoading(null)
    }
  }

  const autoEstimate = async () => {
    if (!cropName) {
      alert("Enter crop name first")
      return
    }
    try {
      const res = await axios.post(`${API_URL}/api/ai/estimate_duration`, {
        crop_name: cropName
      })
      if (res.data.status === 'success') {
        const sowing = new Date(sowingDate)
        sowing.setDate(sowing.getDate() + res.data.days)
        setExpectedHarvest(sowing.toISOString().split('T')[0])
      }
    } catch (err) {
      alert("Could not estimate duration")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b p-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Crop Lifecycle</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
          >
            <Plus size={18} />
            {showForm ? 'Cancel' : 'New Crop'}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-8">
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-xl border border-green-100 animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="text-lg font-bold mb-6 text-green-800">Register New Crop</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Crop Name</label>
                <input 
                  type="text" 
                  value={cropName} 
                  onChange={(e) => setCropName(e.target.value)}
                  placeholder="e.g. Tomato"
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 font-bold" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Variety</label>
                <input 
                  type="text" 
                  value={variety} 
                  onChange={(e) => setVariety(e.target.value)}
                  placeholder="e.g. Cherry"
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 font-bold" 
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Area</label>
                <input 
                  type="text" 
                  value={area} 
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. 2 Acres"
                  className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 font-bold" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Sowing Date</label>
                  <input 
                    type="date" 
                    value={sowingDate} 
                    onChange={(e) => setSowingDate(e.target.value)}
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 font-bold" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Harvest (Est)</label>
                  <div className="flex gap-2">
                    <input 
                      type="date" 
                      value={expectedHarvest} 
                      onChange={(e) => setExpectedHarvest(e.target.value)}
                      className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 font-bold" 
                    />
                    <button 
                      type="button"
                      onClick={autoEstimate}
                      className="bg-blue-100 text-blue-600 px-3 rounded-2xl hover:bg-blue-200 transition-colors"
                      title="AI Estimate"
                    >
                      ✨
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button type="submit" className="bg-green-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg hover:bg-green-700 transition-all active:scale-95">Save Crop Lifecycle</button>
            </div>
          </form>
        )}

        {aiResponse && (
          <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl relative animate-in zoom-in duration-300">
             <button onClick={() => setAiResponse(null)} className="absolute top-4 right-4 text-blue-400 hover:text-blue-600 font-bold">Close</button>
             <h3 className="text-blue-800 font-black mb-4 flex items-center gap-2">
                <Activity size={20} />
                AI Crop Doctor Insight
             </h3>
             <div className="prose prose-sm prose-blue max-w-none">
                <ReactMarkdown>{aiResponse}</ReactMarkdown>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-20 text-gray-400 font-bold">Scanning your fields...</div>
          ) : crops.length > 0 ? (
            crops.map((crop) => (
              <div key={crop.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 leading-none">{crop.crop_name}</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase mt-1 tracking-widest">{crop.variety || 'Standard Variety'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${crop.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {crop.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Sowing</p>
                    <div className="flex items-center gap-2 text-gray-700">
                       <Calendar size={14} className="text-green-600" />
                       <span className="text-sm font-bold">{crop.sowing_date}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Harvest</p>
                    <div className="flex items-center gap-2 text-gray-700">
                       <Sprout size={14} className="text-orange-500" />
                       <span className="text-sm font-bold">{crop.expected_harvest || 'Pending'}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Area</p>
                    <div className="flex items-center gap-2 text-gray-700">
                       <Ruler size={14} className="text-blue-500" />
                       <span className="text-sm font-bold">{crop.area || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-2xl">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Notes</p>
                    <div className="flex items-center gap-2 text-gray-700 truncate">
                       <Info size={14} className="text-purple-500" />
                       <span className="text-sm font-bold truncate">{crop.notes || 'None'}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => askCropDoctor(crop)}
                  disabled={aiLoading === crop.id}
                  className="w-full bg-blue-600 text-white py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {aiLoading === crop.id ? (
                    <span className="flex items-center gap-2">
                       <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path></svg>
                       Analyzing...
                    </span>
                  ) : (
                    <>
                      <Activity size={16} />
                      AI Crop Doctor Advice
                    </>
                  )}
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
               <p className="text-gray-400 font-medium">No crops registered yet. Start your season now!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
