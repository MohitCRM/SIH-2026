import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, AlertCircle, FileText, CheckCircle, FileWarning } from 'lucide-react';

const VerificationView = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDocument, setActiveDocument] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await fetch(`/api/officer/applications/${applicationId}`);
        if (!response.ok) throw new Error('Failed to fetch application details');
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
    if (!window.confirm(`Are you sure you want to ${action === 'APPROVE' ? 'Approve and Forward to Ministry' : 'Mark as Defective'}?`)) return;
    
    setActionLoading(true);
    try {
      const response = await fetch(`/api/officer/applications/${applicationId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, remarks: `Nodal Officer ${action}` })
      });
      if (!response.ok) throw new Error('Failed to verify application');
      
      alert(`Application ${action === 'APPROVE' ? 'Approved' : 'Marked Defective'} successfully!`);
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
        <p className="text-lg font-medium">Loading verification portal...</p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="p-8">
        <div className="alert alert-error shadow-lg">
          <AlertCircle size={24} /> 
          <span>Error: {error || "Application not found"}</span>
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
              Verification Mode <span className="badge badge-warning badge-outline font-mono p-3">{application.applicationId}</span>
            </h1>
            <p className="text-sm font-medium text-base-content/60">{application.applicantId?.basicDetails?.fullName || 'Unknown Student'} - {application.schemeId?.name || 'Unknown Scheme'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            disabled={actionLoading}
            onClick={() => handleAction('MARK_DEFECTIVE')}
            className="btn btn-error btn-outline gap-2"
          >
            <FileWarning size={18} /> Mark Defective
          </button>
          <button 
            disabled={actionLoading}
            onClick={() => handleAction('APPROVE')}
            className="btn btn-success text-white gap-2"
          >
            {actionLoading ? <span className="loading loading-spinner loading-sm"></span> : <CheckCircle size={18} />} 
            Approve & Forward
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
                 No document selected
               </div>
             )}
          </div>
        </div>

        {/* Right Side: Data Panel */}
        <div className="w-1/3 card bg-base-100 border border-base-200 shadow-sm rounded-xl overflow-y-auto">
          <div className="p-4 border-b border-base-200 bg-base-200/50 sticky top-0">
             <h2 className="font-bold text-base-content flex items-center gap-2"><CheckCircle size={18} className="text-success" /> Extracted Data to Verify</h2>
          </div>
          
          <div className="p-5 space-y-6">
            
            <div>
              <h3 className="text-xs font-bold text-base-content/40 uppercase tracking-wider mb-3">Identity Details</h3>
              <div className="space-y-4">
                <div className="bg-base-200/50 p-3 rounded-lg border border-base-200">
                  <p className="text-xs text-base-content/60 font-semibold mb-1">Full Name</p>
                  <p className="font-bold text-base-content text-sm">{application.applicantId?.basicDetails?.fullName || 'N/A'}</p>
                </div>
                <div className="bg-base-200/50 p-3 rounded-lg border border-base-200">
                  <p className="text-xs text-base-content/60 font-semibold mb-1">Aadhaar Number</p>
                  <p className="font-mono font-bold text-base-content text-sm tracking-wider">{application.applicantId?.aadhaarNumber || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-base-content/40 uppercase tracking-wider mb-3">Eligibility Data</h3>
              <div className="space-y-4">
                <div className="bg-warning/10 p-3 rounded-lg border border-warning/20">
                  <p className="text-xs text-warning-content/80 font-semibold mb-1">Declared Family Income</p>
                  <p className="font-bold text-warning-content text-lg">
                    {application.submittedData?.declaredFamilyIncome 
                      ? `₹${application.submittedData.declaredFamilyIncome.toLocaleString()}` 
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-base-content/40 uppercase tracking-wider mb-3">Bank Details</h3>
              <div className="space-y-4">
                <div className="bg-base-200/50 p-3 rounded-lg border border-base-200">
                  <p className="text-xs text-base-content/60 font-semibold mb-1">Account Number</p>
                  <p className="font-mono font-bold text-base-content text-sm tracking-wider">{application.submittedData?.bankDetails?.accountNumber || 'N/A'}</p>
                </div>
                <div className="bg-base-200/50 p-3 rounded-lg border border-base-200">
                  <p className="text-xs text-base-content/60 font-semibold mb-1">IFSC Code</p>
                  <p className="font-mono font-bold text-base-content text-sm tracking-wider">{application.submittedData?.bankDetails?.ifscCode || 'N/A'}</p>
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
