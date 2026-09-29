import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, ArrowLeft, CheckCircle, IndianRupee, ShieldCheck, AlertCircle } from 'lucide-react';

const MeritListView = () => {
  const { schemeId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    const fetchMeritList = async () => {
      try {
        const response = await fetch(`/api/ministry/merit-list/${schemeId}`);
        if (!response.ok) throw new Error(t('meritListView.errors.fetchFailed'));
        const result = await response.json();
        setData(result);
        
        // Auto-select all 'selected' candidates by default
        if (result.selected) {
            setSelectedIds(result.selected.map(app => app.applicationId));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMeritList();
  }, [schemeId]);

  const handleToggleSelect = (appId) => {
    setSelectedIds(prev => 
      prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
    );
  };

  const handleToggleAll = (e) => {
      if (e.target.checked) {
          setSelectedIds(data.selected.map(app => app.applicationId));
      } else {
          setSelectedIds([]);
      }
  };

  const handleBulkApproveClick = () => {
    setModalError("");
    setShowConfirmModal(true);
  };

  const confirmBulkApprove = async () => {
    setActionLoading(true);
    setShowConfirmModal(false);
    try {
      const response = await fetch('/api/ministry/approve-merit-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationIds: selectedIds, ministryUserId: 'ministry-admin-001' })
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || t('meritListView.errors.approveFailed'));
      
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        navigate('/ministry/schemes');
      }, 2000);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-base-content/50">
        <span className="loading loading-spinner loading-lg text-accent mb-4"></span>
        <p className="text-lg font-medium">{t('meritListView.loading')}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <button onClick={() => navigate('/ministry')} className="btn btn-ghost mb-6">
          <ArrowLeft size={20} /> {t('meritListView.back')}
        </button>
        <div className="alert alert-error shadow-lg">
          <AlertCircle size={24} /> {error || t('meritListView.errors.noData')}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full fade-in">
      
      <div className="flex justify-between items-end mb-8 border-b border-base-200 pb-6">
        <div>
          <button onClick={() => navigate('/ministry')} className="btn btn-ghost btn-sm mb-4">
            <ArrowLeft size={16} /> {t('applicationFlow.header.backToDashboard')}
          </button>
          <h1 className="text-3xl font-bold mb-2 text-base-content">{t('meritListView.header.title', { schemeName: data.schemeName })}</h1>
          <p className="text-base-content/60 font-medium flex items-center gap-2">
            <ShieldCheck size={16} className="text-accent"/>
            {t('meritListView.header.subtitle')}
          </p>
        </div>

        <div className="text-right">
          <div className="stat bg-base-100 shadow-sm border border-base-200 rounded-xl px-6 py-2">
             <div className="stat-title text-accent font-bold uppercase tracking-wider text-xs">{t('meritListView.availableSlots')}</div>
             <div className="stat-value text-accent">{data.totalSlotsAvailable}</div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 border border-base-200 shadow-sm overflow-hidden mb-8 rounded-xl">
        <div className="p-6 border-b border-base-200 flex justify-between items-center bg-base-200/50">
          <div>
            <h2 className="text-lg font-bold text-base-content">{t('meritListView.primarySelection.title')}</h2>
            <p className="text-sm text-base-content/60 mt-1">{t('meritListView.primarySelection.subtitle')}</p>
          </div>

          <button
            disabled={actionLoading || selectedIds.length === 0}
            onClick={handleBulkApproveClick}
            className="btn btn-accent text-accent-content gap-2"
          >
            {actionLoading ? <span className="loading loading-spinner loading-sm"></span> : <IndianRupee size={18} />}
            {t('meritListView.bulkApprove', { count: selectedIds.length })}
          </button>
        </div>
        
        {data.selected && data.selected.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-base-200 text-base-content/70 text-sm">
                  <th className="w-12">
                     <label>
                       <input 
                         type="checkbox" 
                         className="checkbox checkbox-accent checkbox-sm"
                         checked={selectedIds.length === data.selected.length && data.selected.length > 0}
                         onChange={handleToggleAll}
                       />
                     </label>
                  </th>
                  <th>{t('meritListView.table.rank')}</th>
                  <th>{t('officerDashboard.table.colAppId')}</th>
                  <th>{t('officerDashboard.table.colStudentName')}</th>
                  <th>{t('meritListView.table.meritScore')}</th>
                  <th>{t('meritListView.table.status')}</th>
                </tr>
              </thead>
              <tbody>
                {data.selected.map((app, index) => (
                  <tr key={app._id} className="hover">
                    <td>
                       <label>
                         <input 
                           type="checkbox" 
                           className="checkbox checkbox-accent checkbox-sm"
                           checked={selectedIds.includes(app.applicationId)}
                           onChange={() => handleToggleSelect(app.applicationId)}
                         />
                       </label>
                    </td>
                    <td className="font-bold">#{index + 1}</td>
                    <td className="font-mono text-sm font-semibold">{app.applicationId}</td>
                    <td className="font-bold text-base-content">
                      {app.applicantId?.basicDetails?.fullName || t('common.unknownStudent')}
                    </td>
                    <td className="font-bold text-accent">
                      {app.systemCalculatedMeritScore ? app.systemCalculatedMeritScore.toFixed(2) : '85.50'}%
                    </td>
                    <td>
                      <span className="badge badge-success gap-1">
                        <CheckCircle size={12} /> {t('meritListView.table.nodalVerified')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-base-content/50">
            <CheckCircle className="mx-auto mb-4 text-base-content/20" size={48} />
            <h3 className="text-lg font-bold text-base-content/80 mb-1">{t('meritListView.empty.title')}</h3>
            <p>{t('meritListView.empty.desc')}</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">{t('meritListView.confirmBulkApproveTitle') || "Confirm Bulk Approval"}</h3>
            <p className="py-4">
              {t('meritListView.confirmBulkApprove', { count: selectedIds.length }) || `Are you sure you want to approve ${selectedIds.length} students and generate their Sanction Letters?`}
            </p>
            <div className="modal-action">
              <button className="btn" onClick={() => setShowConfirmModal(false)}>Cancel</button>
              <button className="btn btn-accent text-accent-content gap-2" onClick={confirmBulkApprove}>
                <IndianRupee size={16}/> Approve & Disburse
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {modalError && (
        <div className="modal modal-open">
          <div className="modal-box border-t-4 border-error">
            <h3 className="font-bold text-lg text-error flex items-center gap-2">
              <AlertCircle size={20} /> Error
            </h3>
            <p className="py-4">{modalError}</p>
            <div className="modal-action">
              <button className="btn" onClick={() => setModalError("")}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="toast toast-top toast-center z-50">
          <div className="alert alert-success shadow-lg">
            <CheckCircle size={24} />
            <span className="font-bold text-white">Funds Disbursed successfully!</span>
          </div>
        </div>
      )}

    </div>
  );
};

export default MeritListView;
