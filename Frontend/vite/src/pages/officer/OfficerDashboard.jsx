import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, AlertCircle, FileText, CheckCircle, ChevronRight, Users } from 'lucide-react';

const OfficerDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const response = await fetch('/api/officer/applications');
        if (!response.ok) throw new Error(t('officerDashboard.errors.fetchFailed'));
        const data = await response.json();
        setApplications(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-base-content/50">
        <span className="loading loading-spinner loading-lg text-warning mb-4"></span>
        <p className="text-lg font-medium">{t('officerDashboard.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="alert alert-error shadow-lg">
          <AlertCircle size={24} /> 
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto fade-in">
      
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2 text-base-content">{t('officerDashboard.header.title')}</h1>
        <p className="text-base-content/60 font-medium">{t('officerDashboard.header.subtitle')}</p>
      </header>

      {/* Metric Cards using DaisyUI Stat */}
      <div className="stats shadow-sm w-full mb-10 border border-base-200">
        <div className="stat">
          <div className="stat-figure text-warning bg-warning/10 p-3 rounded-full">
            <FileText size={24}/>
          </div>
          <div className="stat-title font-bold uppercase tracking-wider text-xs">{t('officerDashboard.stats.pendingReview')}</div>
          <div className="stat-value text-base-content">{applications.length}</div>
          <div className="stat-desc text-warning font-medium">{t('officerDashboard.stats.pendingReviewDesc')}</div>
        </div>
        
        <div className="stat">
          <div className="stat-figure text-success bg-success/10 p-3 rounded-full">
            <CheckCircle size={24}/>
          </div>
          <div className="stat-title font-bold uppercase tracking-wider text-xs">{t('officerDashboard.stats.approvedToday')}</div>
          <div className="stat-value text-base-content opacity-70">0</div>
          <div className="stat-desc">{t('officerDashboard.stats.approvedTodayDesc')}</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-info bg-info/10 p-3 rounded-full">
            <Users size={24}/>
          </div>
          <div className="stat-title font-bold uppercase tracking-wider text-xs">{t('officerDashboard.stats.assignedInstitutes')}</div>
          <div className="stat-value text-base-content opacity-70">12</div>
          <div className="stat-desc text-info font-medium">{t('officerDashboard.stats.assignedInstitutesDesc')}</div>
        </div>
      </div>

      <div className="card bg-base-100 border border-base-200 shadow-sm overflow-hidden rounded-xl">
        <div className="p-6 border-b border-base-200 flex justify-between items-center bg-base-200/50">
          <h2 className="text-lg font-bold text-base-content">{t('officerDashboard.table.title')}</h2>
          <div className="badge badge-warning badge-outline font-bold p-3">
            {t('officerDashboard.table.actionItems', { count: applications.length })}
          </div>
        </div>
        
        {applications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-base-200 text-base-content/70 text-sm">
                  <th>{t('officerDashboard.table.colAppId')}</th>
                  <th>{t('officerDashboard.table.colStudentName')}</th>
                  <th>{t('officerDashboard.table.colScheme')}</th>
                  <th>{t('officerDashboard.table.colSubmitted')}</th>
                  <th>{t('officerDashboard.table.colAction')}</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app._id} className="hover">
                    <td className="font-mono text-sm font-semibold">{app.applicationId}</td>
                    <td className="font-bold">
                      {app.applicantId?.basicDetails?.fullName || t('common.unknownStudent')}
                    </td>
                    <td className="font-medium text-base-content/70">{app.schemeId?.name || t('common.unknownScheme')}</td>
                    <td className="text-base-content/60">{new Date(app.updatedAt).toLocaleDateString()}</td>
                    <td>
                      <button 
                        onClick={() => navigate(`/officer/verify/${app.applicationId}`)} 
                        className="btn btn-warning btn-sm gap-2"
                      >
                        {t('officerDashboard.table.verify')} <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-base-content/50">
            <CheckCircle className="mx-auto mb-4 text-base-content/20" size={48} />
            <h3 className="text-lg font-bold text-base-content/80 mb-1">{t('officerDashboard.empty.title')}</h3>
            <p>{t('officerDashboard.empty.desc')}</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default OfficerDashboard;
