import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';

const MOCK_APPLICANT_ID = "64a7c2f1b2a3d4e5f6a7b8c9"; // Using the same mock applicant ID as ApplicationFlow

const Applications = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/applicant/applications/${MOCK_APPLICANT_ID}`);
      if (!response.ok) throw new Error(t('applicantApplications.errors.fetchFailed'));
      const data = await response.json();
      setApplications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDraft = async (applicationId) => {
    if(!window.confirm(t('applicantApplications.confirmFinalSubmit'))) return;
    try {
      const response = await fetch(`/api/applicant/applications/${applicationId}/submit`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error(t('applicantApplications.errors.submitFailed'));
      alert(t('applicantApplications.alertSubmitSuccess'));
      fetchApplications(); // Refresh list
    } catch (err) {
      alert(err.message);
    }
  };

  const drafts = applications.filter(a => a.status === 'DRAFT');
  const submitted = applications.filter(a => a.status !== 'DRAFT');

  const getStatusBadge = (status) => {
    switch(status) {
      case 'DRAFT': return <span className="badge badge-warning font-bold p-3">DRAFT</span>;
      case 'SUBMITTED': return <span className="badge badge-info font-bold p-3">SUBMITTED</span>;
      case 'DEFICIENCY_FOUND': return <span className="badge badge-error font-bold p-3 gap-1"><AlertCircle size={14}/> DEFICIENCY</span>;
      case 'MINISTRY_APPROVED': return <span className="badge badge-success font-bold p-3 gap-1"><CheckCircle size={14}/> APPROVED</span>;
      default: return <span className="badge font-bold p-3">{status}</span>;
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto fade-in">
      <header className="mb-10 border-b border-base-200 pb-6">
        <h1 className="text-3xl font-bold mb-1 text-primary">{t('applicantApplications.header.title')}</h1>
        <p className="text-base-content/60 font-medium">{t('applicantApplications.header.subtitle')}</p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-base-content/50">
          <Loader2 className="animate-spin mb-4 text-primary" size={32} />
          <p>{t('applicantApplications.loading')}</p>
        </div>
      ) : error ? (
        <div className="alert alert-error shadow-lg">
          <AlertCircle size={24} /> {t('verificationView.errors.errorPrefix')}: {error}
        </div>
      ) : (
        <>
          {/* Saved Drafts Section */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="text-primary" size={24} />
              <h2 className="text-xl font-bold text-base-content">{t('applicantApplications.drafts.heading')}</h2>
            </div>

            {drafts.length > 0 ? (
              <div className="card bg-base-100 border border-base-200 shadow-sm overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr className="bg-base-200 text-base-content/70">
                      <th>{t('applicationFlow.stage4.applicationIdLabel')}</th>
                      <th>{t('ministryDashboard.schemesTable.colScheme')}</th>
                      <th>{t('applicantApplications.drafts.colLastSaved')}</th>
                      <th>{t('meritListView.table.status')}</th>
                      <th>{t('officerDashboard.table.colAction')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drafts.map(app => (
                      <tr key={app._id} className="hover">
                        <td className="font-mono text-sm text-primary font-semibold">{app.applicationId}</td>
                        <td className="text-sm font-medium text-base-content">{app.schemeId ? app.schemeId.name : t('common.unknownScheme')}</td>
                        <td className="text-sm text-base-content/60 flex items-center gap-1">
                          <Clock size={14}/>
                          {new Date(app.updatedAt).toLocaleDateString()}
                        </td>
                        <td>{getStatusBadge(app.status)}</td>
                        <td className="flex gap-3">
                          <button onClick={() => navigate(`/applicant/application/${app.applicationId}`)} className="btn btn-sm btn-ghost text-primary gap-1">
                            <FileText size={16} /> {t('applicantApplications.drafts.openDocument')}
                          </button>
                          <button onClick={() => handleSubmitDraft(app.applicationId)} className="btn btn-sm btn-success text-success-content">
                            {t('applicationFlow.stage4.finalSubmit')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="card bg-base-100 border border-base-200 p-8 text-center text-base-content/50">{t('applicantApplications.drafts.empty')}</div>
            )}
          </div>

          {/* Submitted Applications Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="text-success" size={24} />
              <h2 className="text-xl font-bold text-base-content">{t('applicantApplications.submitted.heading')}</h2>
            </div>

            {submitted.length > 0 ? (
              <div className="card bg-base-100 border border-base-200 shadow-sm overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr className="bg-base-200 text-base-content/70">
                      <th>{t('applicationFlow.stage4.applicationIdLabel')}</th>
                      <th>{t('ministryDashboard.schemesTable.colScheme')}</th>
                      <th>{t('applicantApplications.submitted.colDateApplied')}</th>
                      <th>{t('applicantApplications.submitted.colCurrentStatus')}</th>
                      <th>{t('officerDashboard.table.colAction')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submitted.map(app => (
                      <tr key={app._id} className="hover">
                        <td className="font-mono text-sm text-primary font-semibold">{app.applicationId}</td>
                        <td className="text-sm font-medium text-base-content">{app.schemeId ? app.schemeId.name : t('common.unknownScheme')}</td>
                        <td className="text-sm text-base-content/60">{new Date(app.createdAt).toLocaleDateString()}</td>
                        <td>{getStatusBadge(app.status)}</td>
                        <td>
                          <button onClick={() => navigate(`/applicant/application/${app.applicationId}`)} className="btn btn-sm btn-ghost gap-1">
                            <FileText size={16} /> {t('applicantApplications.submitted.viewDocument')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="card bg-base-100 border border-base-200 p-8 text-center text-base-content/50">{t('applicantApplications.submitted.empty')}</div>
            )}
          </div>
        </>
      )}

      {/* Document View Modal */}
    </div>
  );
};
export default Applications;
