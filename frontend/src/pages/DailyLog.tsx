import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../config/api'
import ReactMarkdown from 'react-markdown'
import { Calendar, Tag, Briefcase, Pill, Settings, MessageSquare, Filter, ChevronDown } from 'lucide-react'

interface LogEntry {
  id: number
  content: string
  category: string
  date: string
}

export default function DailyLog() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('General')
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<string | null>(null)
  
  // Filters
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterDate, setFilterDate] = useState('')

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/logs`)
      setLogs(res.data)
    } catch (err) {
      console.error("Error fetching logs:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    try {
      await axios.post(`${API_URL}/api/admin/logs`, { 
        content,
        category 
      })
      setContent('')
      setCategory('General')
      fetchLogs()
    } catch (err) {
      alert("Failed to save log entry")
    }
  }

  const analyzeWeek = async () => {
    setAnalyzing(true)
    setAnalysis(null)
    try {
      const res = await axios.post(`${API_URL}/api/ai/analyze_logs`)
      if (res.data.status === 'success') {
        setAnalysis(res.data.content)
      } else {
        alert(res.data.message)
      }
    } catch (err) {
      alert("AI analysis failed")
    } finally {
      setAnalyzing(false)
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchCat = filterCategory === 'All' || log.category === filterCategory
    const matchDate = !filterDate || log.date.includes(filterDate)
    return matchCat && matchDate
  })

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Labour': return <Briefcase size={14} />
      case 'Medicine': return <Pill size={14} />
      case 'Equipment': return <Settings size={14} />
      default: return <MessageSquare size={14} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      <header className="bg-white border-b p-4 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white">
                <Tag size={18} />
            </div>
            <h1 className="text-xl font-black text-gray-800 tracking-tight">Daily Blog</h1>
          </div>
          <button
            onClick={analyzeWeek}
            disabled={analyzing}
            className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-green-700 transition-all shadow-md shadow-green-100 disabled:opacity-50 active:scale-95"
          >
            {analyzing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path></svg>
                Analyzing...
              </span>
            ) : (
              <>✨ AI Summary</>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-8">
        {/* New Entry Form */}
        <section className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-500">
           <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-wrap gap-3 mb-2">
                {['General', 'Labour', 'Medicine', 'Equipment', 'Seed'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${category === cat ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe your farm activity today..."
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 text-gray-800 font-bold placeholder:text-gray-300 resize-none min-h-[140px] text-lg"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!content.trim()}
                  className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-30"
                >
                  Post Entry
                </button>
              </div>
           </form>
        </section>

        {/* AI Insight */}
        {analysis && (
          <div className="bg-blue-600 p-8 rounded-3xl shadow-2xl shadow-blue-200 text-white relative overflow-hidden animate-in zoom-in duration-300">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <MessageSquare size={120} />
            </div>
            <button onClick={() => setAnalysis(null)} className="absolute top-4 right-4 text-white/50 hover:text-white font-black">CLOSE</button>
            <h2 className="text-xl font-black mb-6 flex items-center gap-3">
              <span className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">✨</span>
              Weekly Farm Intelligence
            </h2>
            <div className="prose prose-invert max-w-none prose-p:font-bold prose-li:font-bold">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Filters & List */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/50 p-2 rounded-3xl">
             <div className="flex items-center gap-2 p-2 bg-white rounded-2xl shadow-sm border border-gray-100 w-full md:w-auto">
                <Filter size={16} className="text-gray-400 ml-2" />
                <select 
                  value={filterCategory} 
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 font-black text-xs uppercase tracking-widest text-gray-600 min-w-[120px]"
                >
                  <option value="All">All Categories</option>
                  <option value="General">General</option>
                  <option value="Labour">Labour</option>
                  <option value="Medicine">Medicine</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Seed">Seed</option>
                </select>
                <ChevronDown size={14} className="text-gray-300 mr-2" />
             </div>

             <div className="flex items-center gap-2 p-2 bg-white rounded-2xl shadow-sm border border-gray-100 w-full md:w-auto">
                <Calendar size={16} className="text-gray-400 ml-2" />
                <input 
                   type="date" 
                   value={filterDate}
                   onChange={(e) => setFilterDate(e.target.value)}
                   className="bg-transparent border-none focus:ring-0 font-black text-xs uppercase text-gray-600"
                />
             </div>
          </div>

          <div className="space-y-4">
            {loading ? (
               <div className="grid grid-cols-1 gap-4">
                  {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-3xl animate-pulse"></div>)}
               </div>
            ) : filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <div key={log.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-100/50 transition-all duration-300 group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                          {getCategoryIcon(log.category)}
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">{log.category}</p>
                          <p className="text-xs font-black text-gray-800 flex items-center gap-1">
                             <Calendar size={12} className="text-green-600" />
                             {log.date}
                          </p>
                       </div>
                    </div>
                  </div>
                  <p className="text-gray-700 font-bold leading-relaxed whitespace-pre-wrap pl-1">{log.content}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-24 bg-white rounded-[40px] border-4 border-dashed border-gray-50">
                 <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-200">
                    <MessageSquare size={40} />
                 </div>
                 <p className="text-gray-300 font-black uppercase tracking-widest text-sm">No entries match your filters</p>
                 <button onClick={() => {setFilterCategory('All'); setFilterDate('')}} className="mt-4 text-green-600 font-black text-xs uppercase underline">Clear Filters</button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
