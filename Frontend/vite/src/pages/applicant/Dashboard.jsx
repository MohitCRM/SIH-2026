import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { GraduationCap, ArrowRight, Clock } from 'lucide-react';

const ApplicantDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const response = await fetch('/api/applicant/schemes');
        if (response.ok) {
          const data = await response.json();
          setSchemes(data);
        }
      } catch (err) {
        console.error('Failed to fetch schemes', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, []);

  return (
    <div className="w-full px-2 lg:px-4 fade-in pb-10">
      <header className="mb-10 flex justify-between items-center border-b border-base-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1 text-primary">{t('applicantDashboard.header.title')}</h1>
          <p className="text-base-content/60 font-medium">{t('applicantDashboard.header.subtitle')}</p>
        </div>
      </header>

      <h2 className="text-xl font-bold mb-4 fade-in delay-100 text-base-content">{t('applicantDashboard.schemesHeading')}</h2>

      {loading ? (
        <div className="flex justify-center my-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {schemes.map((scheme, index) => (
            <div key={scheme.schemeId || index} className="card bg-base-100 shadow-xl border border-base-200 fade-in" style={{animationDelay: `${index * 100}ms`}}>
              <div className="card-body">
                <div className="flex items-start justify-between mb-2">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl">
                    <GraduationCap size={24} />
                  </div>
                  <div className="badge badge-success font-bold gap-1 p-3">Active</div>
                </div>
                <h3 className="card-title text-base-content mt-2">{scheme.name}</h3>
                <p className="text-base-content/70 text-sm flex-grow">
                  {scheme.description}
                </p>
                <div className="card-actions justify-between items-center border-t border-base-200 pt-4 mt-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-base-content/50 font-bold uppercase tracking-wider">{t('applicantDashboard.coverageLabel')}</span>
                    <span className="text-sm font-bold text-primary">
                      {scheme.eligibilityRules?.maxFamilyIncome ? `Up to ₹${scheme.eligibilityRules.maxFamilyIncome.toLocaleString()} Income` : 'Varies'}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/applicant/apply/${scheme._id || scheme.schemeId}`)}
                    className="btn btn-primary gap-2"
                  >
                    {t('applicantDashboard.topClass.applyNow')} <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {schemes.length === 0 && (
             <div className="col-span-2 card bg-base-100 border-dashed border-2 border-base-300 p-10 text-center">
                <p className="text-base-content/50 font-medium">No active schemes found.</p>
             </div>
          )}
        </div>
      )}

      <h2 className="text-xl font-bold mb-4 fade-in delay-300 text-base-content">{t('applicantDashboard.myApplications.heading')}</h2>
      <div className="card bg-base-100 border-dashed border-2 border-base-300 p-10 text-center fade-in delay-300">
        <Clock className="mx-auto text-base-content/20 mb-4" size={48} />
        <h3 className="text-lg font-bold text-base-content/80 mb-1">{t('applicantDashboard.myApplications.emptyTitle')}</h3>
        <p className="text-sm text-base-content/50 font-medium">{t('applicantDashboard.myApplications.emptyDesc')}</p>
      </div>
    </div>
  );
};

export default ApplicantDashboard;
