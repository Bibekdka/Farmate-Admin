import { Link, useLocation } from 'react-router-dom'
import { Home, CloudRain, Wallet, Notebook, Sprout } from 'lucide-react'

export default function BottomNav() {
  const location = useLocation()
  
  const isActive = (path: string) => location.pathname === path

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe z-50 md:hidden">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/') ? 'text-green-600' : 'text-gray-400'}`}
        >
          <Home size={20} strokeWidth={isActive('/') ? 3 : 2} />
          <span className="text-[10px] font-bold">Home</span>
        </Link>
        
        <Link 
          to="/financials" 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/financials') ? 'text-green-600' : 'text-gray-400'}`}
        >
          <Wallet size={20} strokeWidth={isActive('/financials') ? 3 : 2} />
          <span className="text-[10px] font-bold">Finance</span>
        </Link>

        <Link 
          to="/crops" 
          className="flex flex-col items-center justify-center w-full h-full -mt-8"
        >
          <div className={`p-4 rounded-3xl shadow-xl transition-all duration-300 ${isActive('/crops') ? 'bg-green-600 text-white scale-110 shadow-green-200' : 'bg-green-500 text-white shadow-green-100'}`}>
            <Sprout size={24} />
          </div>
        </Link>

        <Link 
          to="/logs" 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/logs') ? 'text-green-600' : 'text-gray-400'}`}
        >
          <Notebook size={20} strokeWidth={isActive('/logs') ? 3 : 2} />
          <span className="text-[10px] font-bold">Blog</span>
        </Link>

        <Link 
          to="/weather" 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/weather') ? 'text-green-600' : 'text-gray-400'}`}
        >
          <CloudRain size={20} strokeWidth={isActive('/weather') ? 3 : 2} />
          <span className="text-[10px] font-bold">Weather</span>
        </Link>
      </div>
    </div>
  )
}
