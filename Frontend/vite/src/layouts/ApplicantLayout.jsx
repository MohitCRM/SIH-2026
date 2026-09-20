import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, FileText, MessageSquare, LogOut, Building } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';

const ApplicantLayout = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const navItems = [
    { name: 'Dashboard', label: t('common.dashboard'), path: '/applicant', icon: <LayoutDashboard size={20} />, exact: true },
    { name: 'My Drafts', label: t('layouts.applicant.nav.myDrafts'), path: '/applicant/drafts', icon: <FileText size={20} /> },
    { name: 'Messages', label: t('layouts.applicant.nav.messages'), path: '/applicant/messages', icon: <MessageSquare size={20} /> },
  ];

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      
      {/* Main Content Area */}
      <div className="drawer-content flex flex-col bg-base-200 min-h-screen">
        {/* Top Navbar */}
        <div className="navbar bg-base-100 shadow-sm px-8">
          <div className="flex-1 flex items-center gap-2">
            <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost lg:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </label>
            <span className="badge badge-outline badge-sm font-bold opacity-70 mr-2">{t('common.govBadge')}</span>
            <span className="text-sm font-semibold text-base-content/70">{t('roleSelector.govOfIndia')}</span>
          </div>
          <div className="flex-none flex items-center gap-3 text-sm font-medium text-base-content/60">
            <div className="hidden sm:flex items-center gap-2">
              <Building size={16} /> {t('common.ministryOfTribalAffairs')}
            </div>
            <LanguageSwitcher />
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
            <div className="w-10 h-10 bg-primary rounded-lg text-primary-content flex items-center justify-center shadow-sm">
              <Building size={20} />
            </div>
            <div>
              <h2 className="font-bold text-lg leading-tight text-base-content">{t('common.brandName')}</h2>
              <p className="text-xs text-primary font-bold uppercase tracking-wider">{t('roleSelector.applicant.title')}</p>
            </div>
          </div>

          <div className="flex-1">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) => isActive ? 'active bg-primary text-primary-content focus:bg-primary focus:text-primary-content font-medium py-3' : 'font-medium py-3'}
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

export default ApplicantLayout;
