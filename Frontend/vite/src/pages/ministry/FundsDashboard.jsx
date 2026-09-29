import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, ShieldCheck, CheckCircle, AlertCircle, Clock, Building, Download } from 'lucide-react';

const FundsDashboard = () => {
  const [data, setData] = useState({ applications: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingPFMS, setProcessingPFMS] = useState(false);

  useEffect(() => {
    const fetchDisbursed = async () => {
      try {
        const response = await fetch('/api/ministry/disbursed-applications');
        if (!response.ok) throw new Error("Failed to fetch funds data");
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDisbursed();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-base-content/50">
        <span className="loading loading-spinner loading-lg text-success mb-4"></span>
        <p className="text-lg font-medium">Loading disbursement logs...</p>
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

  const handleProcessPFMS = async () => {
    const pendingApps = data.applications.filter(a => a.status === 'MINISTRY_APPROVED').map(a => a.applicationId);
    if (pendingApps.length === 0) return;
    
    setProcessingPFMS(true);
    try {
      const response = await fetch('/api/ministry/disburse-funds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationIds: pendingApps, ministryUserId: 'ministry-admin-001' })
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "PFMS simulation failed");
      
      // Reload data seamlessly
      const fetchResponse = await fetch('/api/ministry/disbursed-applications');
      const fetchResult = await fetchResponse.json();
      setData(fetchResult);
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingPFMS(false);
    }
  };

  const { applications, summary } = data;

  return (
    <div className="w-full fade-in p-2 lg:p-4 space-y-10">
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-base-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-base-content">Funds Disbursement Log</h1>
          <p className="text-base-content/60 font-medium flex items-center gap-2">
            <Building size={16} /> Centralised PFMS Integrated Tracking
          </p>
        </div>
        
        <button className="btn btn-outline gap-2 text-base-content/70">
          <Download size={18} /> Export CSV Report
        </button>
      </header>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card bg-success text-success-content shadow-lg">
          <div className="card-body">
             <div className="flex justify-between items-start">
                <h3 className="card-title text-success-content/80 text-sm uppercase tracking-wider">Total Funds Disbursed</h3>
                <IndianRupee size={24} className="opacity-70" />
             </div>
             <p className="text-4xl font-extrabold mt-2">₹{summary.totalDisbursedCr} Cr</p>
             <p className="text-sm font-medium mt-1 opacity-80">Synchronized across all active schemes</p>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-200 shadow-sm">
          <div className="card-body">
             <div className="flex justify-between items-start">
                <h3 className="card-title text-base-content/60 text-sm uppercase tracking-wider">Students Benefitted</h3>
                <CheckCircle size={24} className="text-success opacity-70" />
             </div>
             <p className="text-4xl font-extrabold text-base-content mt-2">{summary.totalStudents}</p>
             <p className="text-sm text-base-content/60 font-medium mt-1">Successfully received DBT</p>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-200 shadow-sm">
          <div className="card-body">
             <div className="flex justify-between items-start">
                <h3 className="card-title text-base-content/60 text-sm uppercase tracking-wider">Pending PFMS Clearance</h3>
                <Clock size={24} className="text-warning opacity-70" />
             </div>
             <p className="text-4xl font-extrabold text-base-content mt-2">{summary.pendingDisbursement}</p>
             <p className="text-sm text-base-content/60 font-medium mt-1">Awaiting batch processing</p>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 border border-base-200 shadow-sm overflow-hidden rounded-xl">
        <div className="p-6 border-b border-base-200 flex justify-between items-center bg-base-200/50">
          <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
            <ShieldCheck className="text-success" size={20} />
            Beneficiary Transaction Log
          </h2>
          {summary.pendingDisbursement > 0 && (
            <button 
              onClick={handleProcessPFMS}
              disabled={processingPFMS}
              className="btn btn-warning gap-2"
            >
              {processingPFMS ? <span className="loading loading-spinner loading-sm"></span> : <IndianRupee size={18} />}
              Process PFMS Batch ({summary.pendingDisbursement})
            </button>
          )}
        </div>
        
        {applications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-base-200 text-base-content/70 text-sm">
                  <th>Transaction / App ID</th>
                  <th>Student Name</th>
                  <th>Scheme</th>
                  <th>Status</th>
                  <th>Disbursement Date</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app._id} className="hover">
                    <td>
                        <p className="font-mono text-sm font-semibold text-base-content">{app.applicationId}</p>
                        <p className="text-xs font-mono text-base-content/50 mt-1">Ref: DBT/{app.applicationId.slice(-4)}/2026</p>
                    </td>
                    <td className="font-bold text-base-content">
                      {app.applicantId?.basicDetails?.fullName || "Unknown Student"}
                    </td>
                    <td className="font-medium text-base-content/70">{app.schemeId?.name || "Unknown Scheme"}</td>
                    <td>
                      {app.status === 'FUND_DISBURSED' ? (
                          <div className="badge badge-success text-white font-bold gap-1 p-3">
                            <CheckCircle size={12} /> Disbursed
                          </div>
                      ) : (
                          <div className="badge badge-warning text-warning-content font-bold gap-1 p-3">
                            <Clock size={12} /> Pending PFMS
                          </div>
                      )}
                    </td>
                    <td className="text-base-content/60 font-medium">
                        {app.status === 'FUND_DISBURSED' ? new Date(app.updatedAt).toLocaleDateString() : 'Processing'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-base-content/50">
            <ShieldCheck className="mx-auto mb-4 text-base-content/20" size={48} />
            <h3 className="text-lg font-bold text-base-content/80 mb-1">No Disbursements Yet</h3>
            <p>Approve applications from the Merit List to initiate funds transfer.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FundsDashboard;
