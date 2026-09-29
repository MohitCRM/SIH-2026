import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, CheckCircle, FileText, LogOut, Building, ShieldCheck, Menu, User } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';

const OfficerLayout = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(window.innerWidth >= 1024);

  const navItems = [
    { name: 'Dashboard', label: t('common.dashboard'), path: '/officer', icon: <LayoutDashboard size={20} />, exact: true },
    { name: 'Approved', label: t('layouts.officer.nav.approved'), path: '/officer/approved', icon: <CheckCircle size={20} /> },
  ];

  return (
    <div className={`drawer ${isDrawerOpen ? 'lg:drawer-open' : ''}`}>
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" checked={isDrawerOpen} onChange={(e) => setIsDrawerOpen(e.target.checked)} />
      
      {/* Main Content Area */}
      <div className="drawer-content flex flex-col bg-base-200 min-h-screen">
        {/* Top Navbar */}
        <div className="navbar bg-base-100 shadow-sm px-4 md:px-8">
          <div className="flex-1 flex items-center gap-2">
            <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost">
              <Menu size={24} />
            </label>
            <span className="badge badge-outline badge-sm font-bold opacity-70 mr-2 hidden sm:inline-flex">{t('common.govBadge')}</span>
            <span className="text-sm font-semibold text-base-content/70 hidden sm:inline-block">{t('roleSelector.govOfIndia')}</span>
          </div>
          <div className="flex-none flex items-center gap-3 text-sm font-medium text-base-content/60">
            <div className="hidden sm:flex items-center gap-2">
              <Building size={16} /> {t('common.ministryOfTribalAffairs')}
            </div>
            <LanguageSwitcher />
            <div className="dropdown dropdown-end ml-2 z-50">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar bg-base-200 border border-base-300">
                <div className="w-10 rounded-full flex items-center justify-center text-primary">
                  <User size={20} />
                </div>
              </div>
              <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow-xl menu menu-sm dropdown-content bg-base-100 border border-base-200 rounded-box w-56">
                <li className="menu-title px-4 py-2 opacity-60 font-semibold uppercase tracking-wider text-xs">Nodal Officer</li>
                <li>
                  <button onClick={() => navigate('/')} className="hover:bg-base-200 py-3 font-medium">
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div> 
      
      {/* Sidebar */}
      <div className="drawer-side z-20">
        <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label> 
        <ul className="menu p-4 w-72 min-h-full bg-base-100 text-base-content border-r border-base-200 flex flex-col gap-2">
          
          <div className="flex items-center gap-3 mb-8 mt-2 px-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-warning text-warning-content rounded-lg flex items-center justify-center shadow-sm">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight text-base-content">{t('common.brandName')}</h2>
              <p className="text-xs text-warning-content font-bold uppercase tracking-wider">{t('layouts.officer.portalLabel')}</p>
            </div>
          </div>

          <div className="flex-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  end={item.exact}
                  onClick={() => setIsDrawerOpen(false)}
                  className={({ isActive }) => isActive ? 'active bg-warning text-warning-content focus:bg-warning focus:text-warning-content font-medium py-3' : 'font-medium py-3'}
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              </li>
            ))}
          </div>

          <li className="mt-auto">
            <button
              onClick={() => navigate('/')}
              className="text-error hover:bg-error/10 hover:text-error font-medium py-3"
            >
              <LogOut size={20} />
              {t('common.signOut')}
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default OfficerLayout;
