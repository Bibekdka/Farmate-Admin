import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../config/api'
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, Filter, Search, Calendar, ChevronDown, FileText, X } from 'lucide-react'

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
  const [serverStats, setServerStats] = useState({ income: 0, expense: 0, balance: 0 })
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
  const [expenseTypes, setExpenseTypes] = useState<string[]>([])

  const fetchRecords = async () => {
    try {
      // Use limit=0 to fetch all records for the ledger
      const res = await axios.get(`${API_URL}/api/admin/stats?limit=0`)
      setRecords(res.data.activities)
      setServerStats(res.data.stats)
    } catch (err) {
      console.error("Error fetching records:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  const toggleExpenseType = (type: string) => {
    setExpenseTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || parseFloat(amount) <= 0) return alert("Please enter a valid amount")
    
    try {
      await axios.post(`${API_URL}/api/admin/records`, {
        date,
        activity_type: activityType,
        category,
        amount: parseFloat(amount),
        description,
        expense_type: category === 'Expense' ? expenseTypes : null
      })
      
      // Reset form
      setShowForm(false)
      setActivityType('')
      setAmount('')
      setDescription('')
      setExpenseTypes([])
      setDate(new Date().toISOString().split('T')[0])
      
      fetchRecords()
    } catch (err) {
      alert("Failed to save record")
    }
  }

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.activity_type.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'All' || r.category === filterType
    const matchesCat = filterCategory === 'All' || (r.expense_type && r.expense_type.includes(filterCategory))
    return matchesSearch && matchesType && matchesCat
  })

  const filteredTotals = filteredRecords.reduce((acc, curr) => {
    if (curr.category === 'Income') acc.income += curr.amount
    else acc.expense += curr.amount
    return acc
  }, { income: 0, expense: 0 })

  const EXPENSE_CATEGORIES = ['Seed', 'Labour', 'Fuel', 'Medicine', 'Fertilizer', 'Transportation', 'Irrigation', 'Maintenance', 'Misc']

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans text-slate-900">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <Wallet size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">Financial Ledger</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">Real-time Data Sync</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={`${showForm ? 'bg-slate-100 text-slate-600' : 'bg-indigo-600 text-white shadow-indigo-200'} px-6 py-2.5 rounded-2xl text-sm font-black flex items-center gap-2 hover:opacity-90 transition-all shadow-xl active:scale-95`}
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
            {showForm ? 'CLOSE' : 'ADD RECORD'}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-8 mt-4">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 relative z-10">Total Revenue</p>
              <div className="flex items-end justify-between relative z-10">
                <p className="text-3xl font-black text-emerald-600">₹{serverStats.income.toLocaleString()}</p>
                <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                   <ArrowDownLeft size={18} />
                </div>
              </div>
           </div>
           
           <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 relative z-10">Total Expenditure</p>
              <div className="flex items-end justify-between relative z-10">
                <p className="text-3xl font-black text-rose-500">₹{serverStats.expense.toLocaleString()}</p>
                <div className="w-8 h-8 bg-rose-100 rounded-xl flex items-center justify-center text-rose-500">
                   <ArrowUpRight size={18} />
                </div>
              </div>
           </div>

           <div className="bg-indigo-900 p-6 rounded-[2rem] shadow-2xl shadow-indigo-100 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-700" />
              <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-3 relative z-10">Operating Balance</p>
              <p className="text-3xl font-black text-white relative z-10">
                ₹{serverStats.balance.toLocaleString()}
              </p>
              <div className="mt-4 flex items-center gap-2 relative z-10">
                 <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-400 rounded-full" 
                      style={{ width: `${Math.min(100, (serverStats.income / (serverStats.expense || 1)) * 50)}%` }} 
                    />
                 </div>
                 <span className="text-[10px] font-black text-indigo-200">SYNCED</span>
              </div>
           </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-indigo-100/50 border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                 <span className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-lg">💰</span>
                 New Entry
              </h2>
              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl">
                 <button
                   type="button"
                   onClick={() => setCategory('Expense')}
                   className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${category === 'Expense' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
                 >
                   Expense
                 </button>
                 <button
                   type="button"
                   onClick={() => setCategory('Income')}
                   className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${category === 'Income' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
                 >
                   Income
                 </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Transaction Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[1.25rem] transition-all font-bold text-slate-800 outline-none" 
                      required 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Title / Activity</label>
                  <input 
                    type="text" 
                    value={activityType} 
                    onChange={(e) => setActivityType(e.target.value)}
                    placeholder="e.g. Purchase of organic fertilizers"
                    className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[1.25rem] transition-all font-bold text-slate-800 outline-none" 
                    required 
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Amount (INR)</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xl">₹</span>
                    <input 
                      type="number" 
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-12 pr-4 py-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[1.25rem] transition-all font-black text-slate-800 text-2xl outline-none" 
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {category === 'Expense' && (
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Category (Select multiple)</label>
                    <div className="flex flex-wrap gap-2">
                      {EXPENSE_CATEGORIES.map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleExpenseType(t)}
                          className={`px-4 py-2.5 rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all border-2 ${expenseTypes.includes(t) ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Details (Optional)</label>
                  <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide additional context for this transaction..."
                    className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[1.5rem] transition-all font-bold text-slate-800 outline-none h-[180px] resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-50 flex justify-end">
              <button 
                type="submit" 
                className="bg-indigo-600 text-white px-16 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center gap-3"
              >
                <Plus size={20} />
                Save Entry
              </button>
            </div>
          </form>
        )}

        {/* Data View Section */}
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
             <div className="flex-1 flex items-center gap-3 bg-white p-3 rounded-3xl shadow-sm border border-slate-100">
                <Search size={20} className="text-slate-300 ml-2" />
                <input 
                   type="text" 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   placeholder="Search activities..."
                   className="w-full bg-transparent border-none focus:ring-0 font-bold text-slate-600 placeholder:text-slate-300"
                />
             </div>
             
             <div className="flex flex-wrap items-center gap-3">
               <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <select 
                    value={filterType} 
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 font-black text-[10px] uppercase tracking-widest text-slate-500 min-w-[140px] cursor-pointer"
                  >
                    <option value="All">All Transactions</option>
                    <option value="Income">Income Only</option>
                    <option value="Expense">Expense Only</option>
                  </select>
               </div>

               <div className="flex items-center gap-2 p-1.5 bg-white rounded-2xl shadow-sm border border-slate-100">
                  <select 
                    value={filterCategory} 
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 font-black text-[10px] uppercase tracking-widest text-slate-500 min-w-[140px] cursor-pointer"
                  >
                    <option value="All">All Sub-Categories</option>
                    {EXPENSE_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
               </div>

               <div className="flex items-center gap-2">
                  <a 
                    href={`${API_URL}/api/export/xlsx`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-12 h-12 bg-white text-emerald-600 rounded-2xl border border-slate-100 flex items-center justify-center hover:bg-emerald-50 hover:border-emerald-100 transition-all shadow-sm"
                    title="Export Excel"
                  >
                    <FileText size={20} />
                  </a>
                  <a 
                    href={`${API_URL}/api/export/pdf`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-12 h-12 bg-white text-rose-500 rounded-2xl border border-slate-100 flex items-center justify-center hover:bg-rose-50 hover:border-rose-100 transition-all shadow-sm"
                    title="Export PDF"
                  >
                    <FileText size={20} />
                  </a>
               </div>
             </div>
          </div>

          {/* Record List */}
          <div className="space-y-8">
            {loading ? (
              <div className="grid grid-cols-1 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-40 bg-white rounded-[2.5rem] animate-pulse border border-slate-50"></div>
                ))}
              </div>
            ) : filteredRecords.length > 0 ? (
              (() => {
                const grouped: { [key: string]: Record[] } = {}
                filteredRecords.forEach(r => {
                  if (!grouped[r.date]) grouped[r.date] = []
                  grouped[r.date].push(r)
                })

                return Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0])).map(([date, dateRecords]) => {
                  const dayIncome = dateRecords.filter(r => r.category === 'Income').reduce((s, r) => s + r.amount, 0)
                  const dayExpense = dateRecords.filter(r => r.category === 'Expense').reduce((s, r) => s + r.amount, 0)

                  return (
                    <div key={date} className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden group hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-500">
                      <div className="bg-slate-50/50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100">
                               <Calendar size={22} />
                            </div>
                            <div>
                               <h3 className="font-black text-slate-800 tracking-tight text-lg">
                                  {new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                               </h3>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{dateRecords.length} Transactions</p>
                            </div>
                         </div>
                         <div className="flex gap-4">
                            <div className="text-right">
                               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Day Net</p>
                               <p className={`font-black ${dayIncome - dayExpense >= 0 ? 'text-indigo-600' : 'text-rose-500'}`}>
                                  ₹{(dayIncome - dayExpense).toLocaleString()}
                               </p>
                            </div>
                         </div>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <tbody className="divide-y divide-slate-50">
                            {dateRecords.map((record) => (
                              <tr key={record.id} className="hover:bg-slate-50/50 transition-all">
                                <td className="px-8 py-7">
                                  <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${record.category === 'Income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                                      {record.category === 'Income' ? <ArrowDownLeft size={22} /> : <ArrowUpRight size={22} />}
                                    </div>
                                    <div>
                                       <h3 className="font-black text-slate-800 text-lg leading-tight mb-1">{record.activity_type}</h3>
                                       <div className="flex flex-wrap items-center gap-2 mt-1">
                                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${record.category === 'Income' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {record.category}
                                          </span>
                                          {record.expense_type && record.expense_type.split(', ').map(tag => (
                                            <span key={tag} className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-tighter border border-indigo-100">
                                              {tag}
                                            </span>
                                          ))}
                                       </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-8 py-7 hidden md:table-cell max-w-xs">
                                   {record.description && <p className="text-sm font-bold text-slate-400 line-clamp-2 leading-relaxed">{record.description}</p>}
                                </td>
                                <td className="px-8 py-7 text-right">
                                  <p className={`text-xl font-black ${record.category === 'Income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                     {record.category === 'Income' ? '+' : '-'}₹{record.amount.toLocaleString()}
                                  </p>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                })
              })()
            ) : (
              <div className="px-8 py-32 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                 <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                    <Search size={40} />
                 </div>
                 <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">No Matches Found</h3>
                 <p className="text-slate-300 font-bold mt-2">Try adjusting your search or filters</p>
                 <button 
                   onClick={() => {setSearchTerm(''); setFilterType('All'); setFilterCategory('All')}}
                   className="mt-6 text-indigo-600 font-black text-xs uppercase underline tracking-widest hover:text-indigo-800"
                 >
                   Clear All Filters
                 </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
