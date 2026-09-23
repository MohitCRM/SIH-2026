import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, AlertCircle, FileText, CheckCircle, ChevronRight, Users, GraduationCap } from 'lucide-react';

const OfficerDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const response = await fetch('/api/officer/schemes');
        if (!response.ok) throw new Error("Failed to fetch assigned schemes");
        const data = await response.json();
        setSchemes(data);
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
        <span className="loading loading-spinner loading-lg text-warning mb-4"></span>
        <p className="text-lg font-medium">{t('officerDashboard.loading') || "Loading schemes..."}</p>
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
    <div className="max-w-7xl mx-auto fade-in">
      
      <header className="mb-10 flex justify-between items-end border-b border-base-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-base-content">{t('officerDashboard.header.title') || "Officer Dashboard"}</h1>
          <p className="text-base-content/60 font-medium">{t('officerDashboard.header.subtitle') || "Select a scheme to verify applications"}</p>
        </div>
        <div className="badge badge-primary badge-lg gap-2 p-4 font-bold shadow-sm">
          <CheckCircle size={16} /> 0 Approved Today
        </div>
      </header>

      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <FileText className="text-primary" size={24} /> 
        Assigned Schemes
      </h2>

      {schemes.length === 0 ? (
         <div className="card bg-base-100 border-dashed border-2 border-base-300 p-16 text-center fade-in">
           <AlertCircle className="mx-auto text-base-content/20 mb-4" size={48} />
           <h3 className="text-lg font-bold text-base-content/80 mb-1">No Schemes Assigned</h3>
           <p className="text-sm text-base-content/50 font-medium">You have not been assigned to verify any schemes yet.</p>
         </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemes.map(scheme => (
            <div key={scheme._id} className="card bg-base-100 shadow-md border border-base-200 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="card-body">
                <div className="flex items-start justify-between mb-2">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl">
                    <GraduationCap size={24} />
                  </div>
                  <div className={`badge ${scheme.status === 'ACTIVE' ? 'badge-success' : 'badge-neutral'} font-bold`}>
                    {scheme.status}
                  </div>
                </div>
                
                <h3 className="card-title text-base-content mt-2 text-lg line-clamp-2 leading-tight min-h-[3rem]">{scheme.name}</h3>
                
                <p className="text-base-content/60 text-sm mt-2 line-clamp-3 mb-4">
                  {scheme.description || "Review and verify student applications for this scheme."}
                </p>
                
                <div className="card-actions justify-end mt-auto pt-4 border-t border-base-200">
                  <button 
                    onClick={() => navigate(`/officer/scheme/${scheme._id}`)}
                    className="btn btn-primary w-full gap-2"
                  >
                    View Applications <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OfficerDashboard;
