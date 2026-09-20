import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText, CheckCircle, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

const ApplicationView = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await fetch(`/api/applicant/application/${applicationId}`);
        if (!response.ok) throw new Error(t('verificationView.errors.fetchFailed'));
        const data = await response.json();
        setApplication(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [applicationId]);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'DRAFT': return <span className="badge badge-warning font-bold p-3">DRAFT</span>;
      case 'SUBMITTED': return <span className="badge badge-info font-bold p-3">SUBMITTED</span>;
      case 'DEFICIENCY_FOUND': return <span className="badge badge-error font-bold p-3 gap-1"><AlertCircle size={14}/> DEFICIENCY</span>;
      case 'MINISTRY_APPROVED': return <span className="badge badge-success font-bold p-3 gap-1"><CheckCircle size={14}/> APPROVED</span>;
      default: return <span className="badge font-bold p-3">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-base-content/50">
        <Loader2 className="animate-spin mb-4 text-primary" size={40} />
        <p className="text-lg">{t('applicationView.loading')}</p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <button onClick={() => navigate(-1)} className="btn btn-ghost mb-6">
          <ArrowLeft size={20} /> {t('meritListView.back')}
        </button>
        <div className="alert alert-error shadow-sm">
          <AlertCircle size={24}/>
          <span>{t('verificationView.errors.errorPrefix')}: {error || t('verificationView.errors.notFound')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto fade-in">
      
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm mb-6 gap-2">
        <ArrowLeft size={16} /> {t('applicationView.backToApplications')}
      </button>

      <header className="mb-8 border-b border-base-200 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-primary">{t('applicationView.header.title')}</h1>
          <p className="text-base-content/60 font-mono text-sm font-semibold">{application.applicationId}</p>
        </div>
        <div>
          {getStatusBadge(application.status)}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="card bg-base-100 p-6 border border-base-200 shadow-sm">
          <h3 className="text-sm text-base-content/40 uppercase font-bold mb-4 tracking-wider">{t('applicationView.schemeInfo.heading')}</h3>
          <p className="font-semibold text-lg text-base-content">{application.schemeId?.name || t('common.unknownScheme')}</p>
          <p className="text-sm text-base-content/60 mt-2">{t('applicationView.schemeInfo.appliedOn', { date: new Date(application.createdAt).toLocaleDateString() })}</p>
        </div>

        <div className="card bg-base-100 p-6 border border-base-200 shadow-sm">
           <h3 className="text-sm text-base-content/40 uppercase font-bold mb-4 tracking-wider">{t('applicationView.financialDetails.heading')}</h3>
           <div className="grid grid-cols-2 gap-4">
             <div>
               <p className="text-xs text-base-content/60 font-semibold mb-1">{t('applicationView.financialDetails.declaredIncomeLabel')}</p>
               <p className="font-bold text-success text-lg">
                  {application.submittedData?.declaredFamilyIncome
                    ? `₹${application.submittedData.declaredFamilyIncome.toLocaleString()}`
                    : t('common.notAvailable')}
               </p>
             </div>
             <div>
               <p className="text-xs text-base-content/60 font-semibold mb-1">{t('applicationView.financialDetails.bankAccountLabel')}</p>
               <p className="font-mono text-base-content font-bold">{application.submittedData?.bankDetails?.accountNumber || t('common.notAvailable')}</p>
             </div>
           </div>
        </div>
      </div>

      <div className="card bg-base-100 p-6 border border-base-200 shadow-sm">
        <h3 className="text-lg text-primary font-bold border-b border-base-200 pb-3 mb-6">{t('applicationView.uploadedDocuments.heading')}</h3>
        {application.documents && application.documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {application.documents.map((doc, idx) => (
              <div key={idx} className="border border-base-200 rounded-xl p-4 flex flex-col items-center text-center hover:bg-base-200/50 transition-colors">
                  <div className="bg-primary/10 text-primary p-4 rounded-full mb-3">
                    <FileText size={28} />
                  </div>
                  <p className="text-sm font-bold text-base-content mb-1">{doc.documentType.replace(/_/g, ' ')}</p>
                  <p className="text-xs font-semibold text-base-content/50 mb-4">{doc.verificationStatus}</p>
                  <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm btn-block mt-auto">
                    {t('applicationView.uploadedDocuments.viewFile')}
                  </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-base-content/50 italic text-center py-8">{t('applicationView.uploadedDocuments.empty')}</p>
        )}
      </div>

    </div>
  );
};

export default ApplicationView;
