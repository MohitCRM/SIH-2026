import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, UserCircle, Building2 } from 'lucide-react';
import LanguageSwitcher from '../components/LanguageSwitcher';

const RoleSelector = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-base-200">
      <div className="fixed top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12 fade-in">
          <div className="mb-6 mx-auto w-20 h-20 border-4 border-base-300 rounded-full flex items-center justify-center text-base-content/50">
             {/* Placeholder for State Emblem */}
             <span className="text-xs font-bold">{t('roleSelector.emblemPlaceholder')}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-base-content">
            {t('roleSelector.govOfIndia')}
          </h1>
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-primary">
            {t('roleSelector.ministryTitle')}
          </h2>
          <p className="text-lg text-base-content/60">
            {t('roleSelector.selectPortal')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => navigate('/applicant')}
            className="card bg-base-100 p-8 flex flex-col items-center text-center fade-in delay-100 hover:bg-base-200 border border-base-300 shadow-sm"
            style={{ transition: 'all 0.2s ease' }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-primary/10 text-primary">
              <UserCircle size={32} />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-base-content">{t('roleSelector.applicant.title')}</h2>
            <p className="text-sm text-base-content/60">
              {t('roleSelector.applicant.description')}
            </p>
          </button>

          <button 
            onClick={() => navigate('/officer')}
            className="card bg-base-100 p-8 flex flex-col items-center text-center fade-in delay-200 hover:bg-base-200 border border-base-300 shadow-sm"
            style={{ transition: 'all 0.2s ease' }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-warning/10 text-warning">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-base-content">{t('roleSelector.officer.title')}</h2>
            <p className="text-sm text-base-content/60">
              {t('roleSelector.officer.description')}
            </p>
          </button>

          <button 
            onClick={() => navigate('/ministry')}
            className="card bg-base-100 p-8 flex flex-col items-center text-center fade-in delay-300 hover:bg-base-200 border border-base-300 shadow-sm"
            style={{ transition: 'all 0.2s ease' }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-accent/10 text-accent">
              <Building2 size={32} />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-base-content">{t('roleSelector.ministry.title')}</h2>
            <p className="text-sm text-base-content/60">
              {t('roleSelector.ministry.description')}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
