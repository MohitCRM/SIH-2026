import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IndianRupee, Users, TrendingUp, ChevronRight, AlertCircle } from 'lucide-react';

const MOCK_SCHEME_ID = "64a7d3a2b3c4d5e6f7a8b9c0";

const MinistryDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const schemes = [
    { id: MOCK_SCHEME_ID, nameKey: 'ministryDashboard.schemes.topClass.name', pendingLists: 1, totalDisbursed: '₹14.2 Cr' },
    { id: 'nos', nameKey: 'ministryDashboard.schemes.nos.name', pendingLists: 0, totalDisbursed: '₹8.5 Cr' },
    { id: 'pre-matric', nameKey: 'ministryDashboard.schemes.preMatric.name', pendingLists: 0, totalDisbursed: '₹22.1 Cr' }
  ];

  return (
    <div className="max-w-7xl mx-auto fade-in">
      
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2 text-base-content">{t('ministryDashboard.header.title')}</h1>
        <p className="text-base-content/60 font-medium">{t('ministryDashboard.header.subtitle')}</p>
      </header>

      {/* Macro Metrics using DaisyUI Stat */}
      <div className="stats shadow-sm w-full mb-10 border border-base-200">
        <div className="stat">
          <div className="stat-figure text-primary bg-primary/10 p-3 rounded-full">
            <IndianRupee size={24}/>
          </div>
          <div className="stat-title font-bold uppercase tracking-wider text-xs">{t('ministryDashboard.stats.totalDisbursed')}</div>
          <div className="stat-value text-base-content">₹44.8 Cr</div>
          <div className="stat-desc text-primary font-medium">{t('ministryDashboard.stats.totalDisbursedChange')}</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-secondary bg-secondary/10 p-3 rounded-full">
            <Users size={24}/>
          </div>
          <div className="stat-title font-bold uppercase tracking-wider text-xs">{t('ministryDashboard.stats.beneficiaries')}</div>
          <div className="stat-value text-base-content">124,592</div>
          <div className="stat-desc text-secondary font-medium">{t('ministryDashboard.stats.beneficiariesDesc')}</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-success bg-success/10 p-3 rounded-full">
            <TrendingUp size={24}/>
          </div>
          <div className="stat-title font-bold uppercase tracking-wider text-xs">{t('ministryDashboard.stats.successRate')}</div>
          <div className="stat-value text-base-content">98.2%</div>
          <div className="stat-desc text-success font-medium">{t('ministryDashboard.stats.successRateDesc')}</div>
        </div>
      </div>

      {/* Active Schemes Table */}
      <div className="card bg-base-100 border border-base-200 shadow-sm overflow-hidden rounded-xl">
        <div className="p-6 border-b border-base-200 bg-base-200/50 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-base-content">{t('ministryDashboard.schemesTable.title')}</h2>
            <p className="text-sm text-base-content/60 mt-1">{t('ministryDashboard.schemesTable.subtitle')}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-base-200 text-base-content/70 text-sm">
                <th>{t('ministryDashboard.schemesTable.colScheme')}</th>
                <th>{t('ministryDashboard.schemesTable.colDisbursed')}</th>
                <th>{t('ministryDashboard.schemesTable.colPending')}</th>
                <th>{t('ministryDashboard.schemesTable.colAction')}</th>
              </tr>
            </thead>
            <tbody>
              {schemes.map(scheme => (
                <tr key={scheme.id} className="hover">
                  <td className="font-bold text-base-content">{t(scheme.nameKey)}</td>
                  <td className="font-mono text-sm font-semibold">{scheme.totalDisbursed}</td>
                  <td>
                    {scheme.pendingLists > 0 ? (
                      <span className="badge badge-error gap-1 p-3">
                        <AlertCircle size={14}/> {t('ministryDashboard.schemesTable.requiresApproval')}
                      </span>
                    ) : (
                      <span className="text-base-content/40 text-sm font-medium">{t('ministryDashboard.schemesTable.upToDate')}</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => navigate(`/ministry/merit-list/${scheme.id}`)}
                      className="btn btn-neutral btn-sm gap-2"
                    >
                      {t('ministryDashboard.schemesTable.viewMeritList')} <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default MinistryDashboard;
