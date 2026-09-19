import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShoppingBasket, Search, MapPin, ArrowLeft } from 'lucide-react';

export default function ConsumerLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-slate-500 hover:text-slate-800 transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <Link to="/consumer/marketplace" className="flex items-center gap-2">
              <ShoppingBasket className="text-orange-500" size={28} />
              <span className="text-2xl font-extrabold text-slate-800 tracking-tight">AgriFresh</span>
            </Link>
          </div>

          <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Search for fresh tomatoes, potatoes..." 
                className="w-full bg-slate-100 rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
              <MapPin size={16} className="text-orange-500" />
              <span>Deliver to: Home</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
