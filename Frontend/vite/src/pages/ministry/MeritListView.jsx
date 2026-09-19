import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, CheckCircle, IndianRupee, ShieldCheck, AlertCircle } from 'lucide-react';

const MeritListView = () => {
  const { schemeId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    const fetchMeritList = async () => {
      try {
        const response = await fetch(`/api/ministry/merit-list/${schemeId}`);
        if (!response.ok) throw new Error('Failed to fetch merit list. Scheme might not exist or no applications available.');
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

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one application to approve.");
      return;
    }

    if (!window.confirm(`Are you sure you want to approve ${selectedIds.length} applications and generate their sanction letters? This action will disburse funds via DBT.`)) {
        return;
    }
    
    setActionLoading(true);
    try {
      const response = await fetch('/api/ministry/approve-merit-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationIds: selectedIds, ministryUserId: 'ministry-admin-001' })
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to approve applications');
      
      alert(result.message);
      navigate('/ministry');
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-base-content/50">
        <span className="loading loading-spinner loading-lg text-accent mb-4"></span>
        <p className="text-lg font-medium">Compiling Merit List...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <button onClick={() => navigate('/ministry')} className="btn btn-ghost mb-6">
          <ArrowLeft size={20} /> Back
        </button>
        <div className="alert alert-error shadow-lg">
          <AlertCircle size={24} /> {error || "No data available."}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto fade-in">
      
      <div className="flex justify-between items-end mb-8 border-b border-base-200 pb-6">
        <div>
          <button onClick={() => navigate('/ministry')} className="btn btn-ghost btn-sm mb-4">
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold mb-2 text-base-content">Merit List: {data.schemeName}</h1>
          <p className="text-base-content/60 font-medium flex items-center gap-2">
            <ShieldCheck size={16} className="text-accent"/>
            Displaying applications pre-verified and approved by State Nodal Officers.
          </p>
        </div>
        
        <div className="text-right">
          <div className="stat bg-base-100 shadow-sm border border-base-200 rounded-xl px-6 py-2">
             <div className="stat-title text-accent font-bold uppercase tracking-wider text-xs">Available Slots</div>
             <div className="stat-value text-accent">{data.totalSlotsAvailable}</div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 border border-base-200 shadow-sm overflow-hidden mb-8 rounded-xl">
        <div className="p-6 border-b border-base-200 flex justify-between items-center bg-base-200/50">
          <div>
            <h2 className="text-lg font-bold text-base-content">Primary Selection List</h2>
            <p className="text-sm text-base-content/60 mt-1">Ranked by System Calculated Merit Score</p>
          </div>
          
          <button 
            disabled={actionLoading || selectedIds.length === 0}
            onClick={handleBulkApprove}
            className="btn btn-accent text-accent-content gap-2"
          >
            {actionLoading ? <span className="loading loading-spinner loading-sm"></span> : <IndianRupee size={18} />} 
            Bulk Approve & Disburse ({selectedIds.length})
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
                  <th>Rank</th>
                  <th>App ID</th>
                  <th>Student Name</th>
                  <th>Merit Score</th>
                  <th>Status</th>
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
                      {app.applicantId?.basicDetails?.fullName || 'Unknown Student'}
                    </td>
                    <td className="font-bold text-accent">
                      {app.systemCalculatedMeritScore ? app.systemCalculatedMeritScore.toFixed(2) : '85.50'}%
                    </td>
                    <td>
                      <span className="badge badge-success gap-1">
                        <CheckCircle size={12} /> Nodal Verified
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
            <h3 className="text-lg font-bold text-base-content/80 mb-1">No Pending Approvals</h3>
            <p>There are no Nodal Approved applications waiting for Ministry sanction for this scheme.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default MeritListView;
