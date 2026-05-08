import { Link, useLocation } from 'react-router-dom'
import { Home, MessageSquare, CloudRain, Wallet, Notebook, LogOut } from 'lucide-react'

export default function Sidebar() {
  const location = useLocation()
  
  const isActive = (path: string) => location.pathname === path

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/financials', icon: Wallet, label: 'Financials' },
    { path: '/logs', icon: Notebook, label: 'Daily Blog' },
    { path: '/weather', icon: CloudRain, label: 'Weather' },
    { path: '/ai', icon: MessageSquare, label: 'Farm AI' },
  ]

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-green-200">
            F
          </div>
          <span className="font-black text-xl text-gray-800 tracking-tight">Farmate<span className="text-green-600">.</span></span>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-green-50 text-green-700 shadow-sm'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
              }`}
            >
              <item.icon size={20} strokeWidth={isActive(item.path) ? 2.5 : 2} />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-gray-50">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-red-500 font-bold text-sm transition-colors">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  )
}
