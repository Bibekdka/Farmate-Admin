import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../config/api'

interface Record {
  id: number
  date: string
  activity_type: string
  category: string
  amount: number
  description: string
  expense_type?: string
}

export default function Financials() {
  const [records, setRecords] = useState<Record[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  
  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [activityType, setActivityType] = useState('')
  const [category, setCategory] = useState('Expense')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [expenseType, setExpenseType] = useState('Misc')

  const fetchRecords = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/stats`)
      setRecords(res.data.activities)
    } catch (err) {
      console.error("Error fetching records:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/api/admin/records`, {
        date,
        activity_type: activityType,
        category,
        amount: parseFloat(amount),
        description,
        expense_type: category === 'Expense' ? expenseType : null
      })
      setShowForm(false)
      setActivityType('')
      setAmount('')
      setDescription('')
      fetchRecords()
    } catch (err) {
      alert("Failed to save record")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Financial Records</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition-colors shadow-sm"
          >
            {showForm ? 'Close Form' : 'Add Record'}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg border border-green-100 animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="text-lg font-bold mb-4 text-green-800">New Farm Record</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Activity</label>
                <input 
                  type="text" 
                  value={activityType} 
                  onChange={(e) => setActivityType(e.target.value)}
                  placeholder="e.g. Sold Wheat, Bought Seeds"
                  className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500"
                >
                  <option value="Expense">Expense (Outgoing)</option>
                  <option value="Income">Income (Incoming)</option>
                </select>
              </div>
              {category === 'Expense' && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expense Type</label>
                  <select 
                    value={expenseType} 
                    onChange={(e) => setExpenseType(e.target.value)}
                    className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Fuel">Fuel</option>
                    <option value="Labour">Labour</option>
                    <option value="Seed">Seed</option>
                    <option value="Fertilizer">Fertilizer</option>
                    <option value="Misc">Misc</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount (₹)</label>
                <input 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500" 
                  required 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description (Optional)</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500 h-24"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                type="submit"
                className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-md active:scale-95"
              >
                Save Record
              </button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] text-gray-400 uppercase font-black tracking-widest border-b">
              <tr>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={2} className="px-6 py-10 text-center text-gray-400">Loading records...</td></tr>
              ) : records.length > 0 ? (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-400 mb-0.5">{record.date}</div>
                      <div className="font-bold text-gray-800">{record.activity_type}</div>
                      {record.description && <div className="text-xs text-gray-500 italic mt-0.5">{record.description}</div>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`font-black text-lg ${record.category === 'Income' ? 'text-green-600' : 'text-red-500'}`}>
                        {record.category === 'Income' ? '+' : '-'}₹{record.amount.toLocaleString()}
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase">{record.expense_type || record.category}</div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={2} className="px-6 py-10 text-center text-gray-300">No records found. Add your first transaction!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
