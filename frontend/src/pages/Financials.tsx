import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../config/api'
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, Filter, Search, Calendar, ChevronDown } from 'lucide-react'

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
  
  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [filterCategory, setFilterCategory] = useState('All')

  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [activityType, setActivityType] = useState('')
  const [category, setCategory] = useState('Expense')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [expenseType, setExpenseType] = useState('Misc')

  const fetchRecords = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/stats?limit=0`)
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

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.activity_type.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'All' || r.category === filterType
    const matchesCat = filterCategory === 'All' || r.expense_type === filterCategory
    return matchesSearch && matchesType && matchesCat
  })

  const totals = filteredRecords.reduce((acc, curr) => {
    if (curr.category === 'Income') acc.income += curr.amount
    else acc.expense += curr.amount
    return acc
  }, { income: 0, expense: 0 })

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">
      <header className="bg-white border-b p-4 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                <Wallet size={18} />
            </div>
            <h1 className="text-xl font-black text-gray-800 tracking-tight">Ledger</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md shadow-blue-100 active:scale-95"
          >
            {showForm ? 'CLOSE' : <><Plus size={18} /> ADD ENTRY</>}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Income</p>
              <p className="text-2xl font-black text-green-600">₹{totals.income.toLocaleString()}</p>
           </div>
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Expense</p>
              <p className="text-2xl font-black text-red-500">₹{totals.expense.toLocaleString()}</p>
           </div>
           <div className="hidden md:block bg-gray-900 p-6 rounded-3xl shadow-xl shadow-gray-200">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Net Cashflow</p>
              <p className={`text-2xl font-black ${totals.income - totals.expense >= 0 ? 'text-white' : 'text-orange-400'}`}>
                ₹{(totals.income - totals.expense).toLocaleString()}
              </p>
           </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-blue-100 border border-blue-50 animate-in fade-in slide-in-from-top-4 duration-500">
            <h2 className="text-xl font-black mb-8 text-gray-800 flex items-center gap-2">
               <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-black">#</span>
               New Transaction
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Date of Entry</label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Activity Title</label>
                  <input 
                    type="text" 
                    value={activityType} 
                    onChange={(e) => setActivityType(e.target.value)}
                    placeholder="e.g. Bulk Seed Purchase"
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Flow</label>
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                    >
                      <option value="Expense">Expense</option>
                      <option value="Income">Income</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Amount (₹)</label>
                    <input 
                      type="number" 
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-lg" 
                      required 
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                {category === 'Expense' && (
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Expense Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Seed', 'Labour', 'Fuel', 'Medicine', 'Fertilizer', 'Misc'].map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setExpenseType(t)}
                          className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${expenseType === t ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Narrative (Optional)</label>
                  <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Notes about this transaction..."
                    className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold h-32 resize-none"
                  />
                </div>
              </div>
            </div>
            <div className="mt-10 flex justify-end">
              <button type="submit" className="bg-gray-900 text-white px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-black transition-all active:scale-95">Save Transaction</button>
            </div>
          </form>
        )}

        <div className="space-y-6">
          {/* Advanced Filters */}
          <div className="flex flex-col md:flex-row gap-4">
             <div className="flex-1 flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                <Search size={18} className="text-gray-300 ml-2" />
                <input 
                   type="text" 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   placeholder="Search activities or descriptions..."
                   className="w-full bg-transparent border-none focus:ring-0 font-bold text-gray-600"
                />
             </div>
             <div className="flex items-center gap-2 p-2 bg-white rounded-2xl shadow-sm border border-gray-100">
                <Filter size={16} className="text-gray-400 ml-2" />
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 font-black text-[10px] uppercase tracking-widest text-gray-600 min-w-[120px]"
                >
                  <option value="All">All Types</option>
                  <option value="Income">Income Only</option>
                  <option value="Expense">Expense Only</option>
                </select>
                <ChevronDown size={14} className="text-gray-300 mr-2" />
             </div>
          </div>

          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-[10px] text-gray-400 uppercase font-black tracking-widest border-b">
                    <th className="px-8 py-5">Transaction Details</th>
                    <th className="px-8 py-5">Category</th>
                    <th className="px-8 py-5 text-right">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    [1,2,3,4].map(i => (
                      <tr key={i}><td colSpan={3} className="px-8 py-6"><div className="h-10 bg-gray-50 rounded-xl animate-pulse"></div></td></tr>
                    ))
                  ) : filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-blue-50/30 transition-all group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${record.category === 'Income' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                              {record.category === 'Income' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-1 mb-0.5">
                                  <Calendar size={10} /> {record.date}
                               </p>
                               <h3 className="font-black text-gray-800 leading-none mb-1">{record.activity_type}</h3>
                               {record.description && <p className="text-xs font-bold text-gray-400 line-clamp-1">{record.description}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${record.category === 'Income' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                             {record.expense_type || record.category}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <p className={`text-lg font-black ${record.category === 'Income' ? 'text-green-600' : 'text-gray-900'}`}>
                             {record.category === 'Income' ? '+' : '-'}₹{record.amount.toLocaleString()}
                          </p>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-8 py-24 text-center">
                         <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-200">
                            <Wallet size={32} />
                         </div>
                         <p className="text-gray-300 font-black uppercase tracking-widest text-sm">No transactions found matching your criteria</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
