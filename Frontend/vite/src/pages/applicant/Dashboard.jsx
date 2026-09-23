import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GraduationCap, ArrowRight, Clock } from 'lucide-react';

const ApplicantDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="max-w-6xl mx-auto fade-in">
      <header className="mb-10 flex justify-between items-center border-b border-base-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1 text-primary">{t('applicantDashboard.header.title')}</h1>
          <p className="text-base-content/60 font-medium">{t('applicantDashboard.header.subtitle')}</p>
        </div>
      </header>

      <h2 className="text-xl font-bold mb-4 fade-in delay-100 text-base-content">{t('applicantDashboard.schemesHeading')}</h2>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {/* Top Class Scholarship Card */}
        <div className="card bg-base-100 shadow-xl border border-base-200 fade-in delay-200">
          <div className="card-body">
            <div className="flex items-start justify-between mb-2">
              <div className="p-3 bg-primary/10 text-primary rounded-xl">
                <GraduationCap size={24} />
              </div>
              <div className="badge badge-success font-bold gap-1 p-3">{t('applicantDashboard.topClass.status')}</div>
            </div>
            <h3 className="card-title text-base-content mt-2">{t('applicantDashboard.topClass.title')}</h3>
            <p className="text-base-content/70 text-sm flex-grow">
              {t('applicantDashboard.topClass.description')}
            </p>
            <div className="card-actions justify-between items-center border-t border-base-200 pt-4 mt-4">
              <div className="flex flex-col">
                <span className="text-xs text-base-content/50 font-bold uppercase tracking-wider">{t('applicantDashboard.coverageLabel')}</span>
                <span className="text-sm font-bold text-primary">{t('applicantDashboard.topClass.coverageValue')}</span>
              </div>
              <button
                onClick={() => navigate('/applicant/apply/64a7d3a2b3c4d5e6f7a8b9c0')}
                className="btn btn-primary gap-2"
              >
                {t('applicantDashboard.topClass.applyNow')} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* National Overseas Scholarship Card */}
        <div className="card bg-base-200/50 border border-base-200 fade-in delay-300 opacity-80">
          <div className="card-body">
            <div className="flex items-start justify-between mb-2">
              <div className="p-3 bg-base-300 text-base-content/50 rounded-xl">
                <GraduationCap size={24} />
              </div>
              <div className="badge badge-warning badge-outline font-bold p-3">{t('applicantDashboard.nos.status')}</div>
            </div>
            <h3 className="card-title text-base-content mt-2">{t('ministryDashboard.schemes.nos.name')}</h3>
            <p className="text-base-content/60 text-sm flex-grow">
              {t('applicantDashboard.nos.description')}
            </p>
            <div className="card-actions justify-between items-center border-t border-base-200 pt-4 mt-4">
              <div className="flex flex-col">
                <span className="text-xs text-base-content/40 font-bold uppercase tracking-wider">{t('applicantDashboard.coverageLabel')}</span>
                <span className="text-sm font-bold text-base-content/50">{t('applicantDashboard.nos.coverageValue')}</span>
              </div>
              <button disabled className="btn btn-disabled">
                {t('applicantDashboard.nos.applyLater')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4 fade-in delay-300 text-base-content">{t('applicantDashboard.myApplications.heading')}</h2>
      <div className="card bg-base-100 border-dashed border-2 border-base-300 p-10 text-center fade-in delay-300">
        <Clock className="mx-auto text-base-content/20 mb-4" size={48} />
        <h3 className="text-lg font-bold text-base-content/80 mb-1">{t('applicantDashboard.myApplications.emptyTitle')}</h3>
        <p className="text-sm text-base-content/50 font-medium">{t('applicantDashboard.myApplications.emptyDesc')}</p>
      </div>
    </div>
  );
};

export default ApplicantDashboard;
