import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, AlertCircle, FileText, CheckCircle, ChevronRight, ArrowLeft } from 'lucide-react';

const OfficerApprovedList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApproved = async () => {
      try {
        const response = await fetch(`/api/officer/applications?status=NODAL_APPROVED`);
        if (!response.ok) throw new Error("Failed to fetch approved applications");
        const data = await response.json();
        setApplications(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchApproved();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-base-content/50">
        <span className="loading loading-spinner loading-lg text-success mb-4"></span>
        <p className="text-lg font-medium">{t('officerDashboard.loading') || "Loading approved applications..."}</p>
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
    <div className="w-full fade-in p-6">
      
      <Link to="/officer" className="btn btn-ghost btn-sm gap-2 mb-6 text-base-content/70">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <header className="mb-8 flex items-center gap-3">
        <div className="p-3 bg-success/20 text-success rounded-xl">
          <CheckCircle size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-base-content">Approved Applications</h1>
          <p className="text-base-content/60 font-medium">List of students whose applications you have verified and approved</p>
        </div>
      </header>

      <div className="card bg-base-100 border border-base-200 shadow-sm overflow-hidden rounded-xl">
        <div className="p-6 border-b border-base-200 flex justify-between items-center bg-base-200/50">
          <h2 className="text-lg font-bold text-base-content flex items-center gap-2">
            <CheckCircle className="text-success" size={20} />
            Successfully Approved
          </h2>
          <div className="badge badge-success badge-outline font-bold p-3">
            {applications.length} Total Approved
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
                  <th>Verified On</th>
                  <th>Status</th>
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
                      <div className="badge badge-success text-white font-bold gap-1 p-3">
                        <CheckCircle size={12} /> Approved
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-base-content/50">
            <AlertCircle className="mx-auto mb-4 text-base-content/20" size={48} />
            <h3 className="text-lg font-bold text-base-content/80 mb-1">No Approved Applications</h3>
            <p>You haven't approved any applications yet today.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default OfficerApprovedList;
