import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, AlertCircle, FileText } from 'lucide-react';

const ActiveSchemes = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const response = await fetch('/api/ministry/dashboard');
        if (!response.ok) throw new Error("Failed to fetch active schemes");
        const data = await response.json();
        setSchemes(data.schemes || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-base-content/50">
        <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
        <p className="text-lg font-medium">Loading active schemes...</p>
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
    <div className="w-full fade-in space-y-10 pb-20 px-2 lg:px-4">
      <header className="flex justify-between items-center border-b border-base-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-base-content">Scheme Management</h1>
          <p className="text-base-content/60 font-medium">Manage active schemes, generate merit lists, and disburse funds.</p>
        </div>
        <button className="btn btn-primary shadow-lg shadow-primary/30" onClick={() => navigate('/ministry/create-scheme')}>
          + Create New Scheme
        </button>
      </header>

      <div className="card bg-base-100 border border-base-200 shadow-sm overflow-hidden rounded-2xl">
        <div className="p-6 border-b border-base-200 flex justify-between items-center bg-base-200/30">
          <h2 className="text-xl font-bold text-base-content flex items-center gap-2">
            <FileText size={24} className="text-primary" /> Active Schemes
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-base-200 text-base-content/70 text-sm">
                <th>Scheme Name</th>
                <th>Total Disbursed</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {schemes.map(scheme => (
                <tr key={scheme.id} className="hover">
                  <td className="font-bold text-base-content">{scheme.nameKey}</td>
                  <td className="font-mono text-sm font-semibold">{scheme.totalDisbursed}</td>
                  <td>
                    {scheme.pendingLists > 0 ? (
                      <span className="badge badge-warning gap-1 p-3 text-warning-content font-bold">
                        <AlertCircle size={14}/> Merit List Pending
                      </span>
                    ) : (
                      <span className="badge badge-success gap-1 p-3 text-success-content font-bold">
                        Up to Date
                      </span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => navigate(`/ministry/merit-list/${scheme.id}`)}
                      className="btn btn-neutral btn-sm gap-2"
                    >
                      View Merit List <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActiveSchemes;
