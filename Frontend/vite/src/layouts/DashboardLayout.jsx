import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, PackagePlus, ArrowLeft, Building2, ShieldCheck, Truck } from 'lucide-react';

export default function DashboardLayout({ role }) {
  const location = useLocation();
  
  const farmerLinks = [
    { path: '/farmer/stock', name: 'Add Stock', icon: <PackagePlus size={20} /> },
    { path: '/farmer/messages', name: 'Messages', icon: <MessageSquare size={20} /> },
  ];

  const adminLinks = [
    { path: '/admin/warehouses', name: 'Warehouses', icon: <Building2 size={20} /> },
    { path: '/admin/grading', name: 'Quality Grading', icon: <ShieldCheck size={20} /> },
    { path: '/admin/tracking', name: 'Global Tracking', icon: <Truck size={20} /> },
  ];

  const links = role === 'Farmer' ? farmerLinks : adminLinks;
  
  const themeColor = role === 'Farmer' ? 'emerald' : 'blue';

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className={`w-64 bg-white border-r border-slate-200 flex flex-col`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <span className={`text-xl font-bold text-${themeColor}-600`}>
            {role} Portal
          </span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {links.map((link) => {
              const isActive = location.pathname.includes(link.path);
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isActive 
                        ? `bg-${themeColor}-50 text-${themeColor}-700 font-medium` 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-200">
          <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors px-3 py-2">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold text-slate-800">
            {links.find(l => location.pathname.includes(l.path))?.name || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full bg-${themeColor}-100 flex items-center justify-center text-${themeColor}-700 font-bold`}>
              {role.charAt(0)}
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
