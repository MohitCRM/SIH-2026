import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, AlertCircle, FileText, CheckCircle, ChevronRight, ArrowLeft } from 'lucide-react';

const OfficerSchemeView = () => {
  const navigate = useNavigate();
  const { schemeId } = useParams();
  const { t } = useTranslation();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const response = await fetch(`/api/officer/applications?schemeId=${schemeId}`);
        if (!response.ok) throw new Error(t('officerDashboard.errors.fetchFailed') || "Failed to fetch applications");
        const data = await response.json();
        setApplications(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (schemeId) {
      fetchPending();
    }
  }, [schemeId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-base-content/50">
        <span className="loading loading-spinner loading-lg text-warning mb-4"></span>
        <p className="text-lg font-medium">{t('officerDashboard.loading') || "Loading applications..."}</p>
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
    <div className="max-w-7xl mx-auto fade-in p-6">
      
      <Link to="/officer" className="btn btn-ghost btn-sm gap-2 mb-6 text-base-content/70">
        <ArrowLeft size={16} /> Back to Schemes
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-base-content">Scheme Applications</h1>
        <p className="text-base-content/60 font-medium">Verify pending applications for this scheme</p>
      </header>

      <div className="card bg-base-100 border border-base-200 shadow-sm overflow-hidden rounded-xl">
        <div className="p-6 border-b border-base-200 flex justify-between items-center bg-base-200/50">
          <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
            <FileText className="text-warning" size={20} />
            Pending Verification
          </h2>
          <div className="badge badge-warning badge-outline font-bold p-3">
            {t('officerDashboard.table.actionItems', { count: applications.length }) || `${applications.length} Action Items`}
          </div>
        </div>
        
        {applications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-base-200 text-base-content/70 text-sm">
                  <th>{t('officerDashboard.table.colAppId') || "App ID"}</th>
                  <th>{t('officerDashboard.table.colStudentName') || "Student Name"}</th>
                  <th>{t('officerDashboard.table.colScheme') || "Scheme"}</th>
                  <th>{t('officerDashboard.table.colSubmitted') || "Submitted On"}</th>
                  <th>{t('officerDashboard.table.colAction') || "Action"}</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app._id} className="hover">
                    <td className="font-mono text-sm font-semibold">{app.applicationId}</td>
                    <td className="font-bold">
                      {app.applicantId?.basicDetails?.fullName || t('common.unknownStudent') || "Unknown"}
                    </td>
                    <td className="font-medium text-base-content/70">{app.schemeId?.name || t('common.unknownScheme') || "Unknown"}</td>
                    <td className="text-base-content/60">{new Date(app.updatedAt).toLocaleDateString()}</td>
                    <td>
                      <button 
                        onClick={() => navigate(`/officer/verify/${app.applicationId}`)} 
                        className="btn btn-warning btn-sm gap-2"
                      >
                        {t('officerDashboard.table.verify') || "Verify"} <ChevronRight size={16} />
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
            <h3 className="text-lg font-bold text-base-content/80 mb-1">{t('officerDashboard.empty.title') || "All Caught Up!"}</h3>
            <p>{t('officerDashboard.empty.desc') || "There are no pending applications for this scheme right now."}</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default OfficerSchemeView;
