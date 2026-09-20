import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, ArrowLeft, AlertCircle, FileText, CheckCircle, FileWarning } from 'lucide-react';

const VerificationView = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDocument, setActiveDocument] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await fetch(`/api/officer/applications/${applicationId}`);
        if (!response.ok) throw new Error(t('verificationView.errors.fetchFailed'));
        const data = await response.json();
        setApplication(data);
        if (data.documents && data.documents.length > 0) {
          setActiveDocument(data.documents[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [applicationId]);

  const handleAction = async (action) => {
    const actionLabel = action === 'APPROVE' ? t('verificationView.confirmApprove') : t('verificationView.confirmDefective');
    if (!window.confirm(t('verificationView.confirmPrompt', { action: actionLabel }))) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/officer/applications/${applicationId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, remarks: `Nodal Officer ${action}` })
      });
      if (!response.ok) throw new Error(t('verificationView.errors.verifyFailed'));

      const statusLabel = action === 'APPROVE' ? t('verificationView.alertApproved') : t('verificationView.alertDefective');
      alert(t('verificationView.alertSuccess', { status: statusLabel }));
      navigate('/officer');
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-base-content/50">
        <span className="loading loading-spinner loading-lg text-warning mb-4"></span>
        <p className="text-lg font-medium">{t('verificationView.loading')}</p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="p-8">
        <div className="alert alert-error shadow-lg">
          <AlertCircle size={24} /> 
          <span>{t('verificationView.errors.errorPrefix')}: {error || t('verificationView.errors.notFound')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-[calc(100vh-64px)] flex flex-col fade-in overflow-hidden">
      
      <div className="flex justify-between items-center mb-4 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/officer')} className="btn btn-square btn-ghost border border-base-200 shadow-sm bg-base-100">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-base-content flex items-center gap-2">
              {t('verificationView.header.title')} <span className="badge badge-warning badge-outline font-mono p-3">{application.applicationId}</span>
            </h1>
            <p className="text-sm font-medium text-base-content/60">{application.applicantId?.basicDetails?.fullName || t('common.unknownStudent')} - {application.schemeId?.name || t('common.unknownScheme')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            disabled={actionLoading}
            onClick={() => handleAction('MARK_DEFECTIVE')}
            className="btn btn-error btn-outline gap-2"
          >
            <FileWarning size={18} /> {t('verificationView.buttons.markDefective')}
          </button>
          <button 
            disabled={actionLoading}
            onClick={() => handleAction('APPROVE')}
            className="btn btn-success text-white gap-2"
          >
            {actionLoading ? <span className="loading loading-spinner loading-sm"></span> : <CheckCircle size={18} />}
            {t('verificationView.buttons.approveForward')}
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        
        {/* Left Side: Document Viewer */}
        <div className="w-2/3 card bg-base-100 border border-base-200 shadow-sm rounded-xl flex flex-col overflow-hidden">
          <div className="bg-base-200/50 border-b border-base-200 p-2 flex gap-2 overflow-x-auto">
            {application.documents?.map(doc => (
              <button
                key={doc.documentType}
                onClick={() => setActiveDocument(doc)}
                className={`btn btn-sm gap-2 ${activeDocument?.documentType === doc.documentType ? 'btn-warning' : 'btn-ghost border border-base-200 bg-base-100'}`}
              >
                <FileText size={16} />
                {doc.documentType.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
          <div className="flex-1 bg-base-300 p-4 relative">
             {activeDocument ? (
               <iframe 
                 src={activeDocument.fileUrl} 
                 className="w-full h-full rounded shadow-sm bg-white"
                 title="Document Viewer"
               ></iframe>
             ) : (
               <div className="flex items-center justify-center h-full text-base-content/50 font-medium">
                 {t('verificationView.noDocumentSelected')}
               </div>
             )}
          </div>
        </div>

        {/* Right Side: Data Panel */}
        <div className="w-1/3 card bg-base-100 border border-base-200 shadow-sm rounded-xl overflow-y-auto">
          <div className="p-4 border-b border-base-200 bg-base-200/50 sticky top-0">
             <h2 className="font-bold text-base-content flex items-center gap-2"><CheckCircle size={18} className="text-success" /> {t('verificationView.panel.title')}</h2>
          </div>
          
          <div className="p-5 space-y-6">
            
            <div>
              <h3 className="text-xs font-bold text-base-content/40 uppercase tracking-wider mb-3">{t('verificationView.panel.identityDetails')}</h3>
              <div className="space-y-4">
                <div className="bg-base-200/50 p-3 rounded-lg border border-base-200">
                  <p className="text-xs text-base-content/60 font-semibold mb-1">{t('verificationView.panel.fullNameLabel')}</p>
                  <p className="font-bold text-base-content text-sm">{application.applicantId?.basicDetails?.fullName || t('common.notAvailable')}</p>
                </div>
                <div className="bg-base-200/50 p-3 rounded-lg border border-base-200">
                  <p className="text-xs text-base-content/60 font-semibold mb-1">{t('applicationFlow.stage1.aadhaarLabel')}</p>
                  <p className="font-mono font-bold text-base-content text-sm tracking-wider">{application.applicantId?.aadhaarNumber || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-base-content/40 uppercase tracking-wider mb-3">{t('verificationView.panel.eligibilityData')}</h3>
              <div className="space-y-4">
                <div className="bg-warning/10 p-3 rounded-lg border border-warning/20">
                  <p className="text-xs text-warning-content/80 font-semibold mb-1">{t('verificationView.panel.declaredIncomeLabel')}</p>
                  <p className="font-bold text-warning-content text-lg">
                    {application.submittedData?.declaredFamilyIncome
                      ? `₹${application.submittedData.declaredFamilyIncome.toLocaleString()}`
                      : t('common.notAvailable')}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-base-content/40 uppercase tracking-wider mb-3">{t('verificationView.panel.bankDetails')}</h3>
              <div className="space-y-4">
                <div className="bg-base-200/50 p-3 rounded-lg border border-base-200">
                  <p className="text-xs text-base-content/60 font-semibold mb-1">{t('verificationView.panel.accountNumberLabel')}</p>
                  <p className="font-mono font-bold text-base-content text-sm tracking-wider">{application.submittedData?.bankDetails?.accountNumber || t('common.notAvailable')}</p>
                </div>
                <div className="bg-base-200/50 p-3 rounded-lg border border-base-200">
                  <p className="text-xs text-base-content/60 font-semibold mb-1">{t('applicationFlow.stage1.ifscLabel')}</p>
                  <p className="font-mono font-bold text-base-content text-sm tracking-wider">{application.submittedData?.bankDetails?.ifscCode || t('common.notAvailable')}</p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default VerificationView;
