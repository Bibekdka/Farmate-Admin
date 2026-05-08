import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../config/api'
import ReactMarkdown from 'react-markdown'

interface LogEntry {
  id: number
  content: string
  date: string
}

export default function DailyLog() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<string | null>(null)

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
      await axios.post(`${API_URL}/api/admin/logs`, { content })
      setContent('')
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

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b p-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Daily Blog</h1>
          <button
            onClick={analyzeWeek}
            disabled={analyzing}
            className="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-green-200 transition-colors disabled:opacity-50"
          >
            {analyzing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-green-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </span>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI Summary
              </>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-6">
        {/* AI Analysis Card */}
        {analysis && (
          <div className="bg-green-50 border border-green-100 p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold text-green-800 mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              AI Weekly Insight
            </h2>
            <div className="prose prose-sm prose-green max-w-none text-green-900">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
            <button 
              onClick={() => setAnalysis(null)}
              className="mt-4 text-xs font-bold text-green-700 hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What happened on the farm today?"
            className="w-full p-3 border-none focus:ring-0 text-gray-700 resize-none min-h-[120px]"
          />
          <div className="flex justify-end mt-2 pt-2 border-t">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-sm"
            >
              Post Entry
            </button>
          </div>
        </form>

        {/* List */}
        <div className="space-y-4">
          {loading ? (
             <div className="text-center py-10 text-gray-400">Loading your farm story...</div>
          ) : logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-xs font-bold text-green-600 uppercase tracking-wider mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 00-2 2z" />
                  </svg>
                  {log.date}
                </div>
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{log.content}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
               <p className="text-gray-400">No blog entries yet. Start recording your farming journey!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
