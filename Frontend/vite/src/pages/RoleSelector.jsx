import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCircle, Building2 } from 'lucide-react';

const RoleSelector = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-base-200">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12 fade-in">
          <div className="mb-6 mx-auto w-20 h-20 border-4 border-base-300 rounded-full flex items-center justify-center text-base-content/50">
             {/* Placeholder for State Emblem */}
             <span className="text-xs font-bold">EMBLEM</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-base-content">
            Government of India
          </h1>
          <h2 className="text-xl md:text-2xl font-semibold mb-4 text-primary">
            Ministry of Tribal Affairs Scholarship Portal
          </h2>
          <p className="text-lg text-base-content/60">
            Select your portal to continue
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => navigate('/applicant')}
            className="card bg-base-100 p-8 flex flex-col items-center text-center fade-in delay-100 hover:bg-base-200 border border-base-300 shadow-sm"
            style={{ transition: 'all 0.2s ease' }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-primary/10 text-primary">
              <UserCircle size={32} />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-base-content">Applicant Portal</h2>
            <p className="text-sm text-base-content/60">
              Apply for scholarships, track status, and upload documents.
            </p>
          </button>

          <button 
            onClick={() => navigate('/officer')}
            className="card bg-base-100 p-8 flex flex-col items-center text-center fade-in delay-200 hover:bg-base-200 border border-base-300 shadow-sm"
            style={{ transition: 'all 0.2s ease' }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-warning/10 text-warning">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-base-content">Nodal Officer</h2>
            <p className="text-sm text-base-content/60">
              Verify applications and review uploaded documents.
            </p>
          </button>

          <button 
            onClick={() => navigate('/ministry')}
            className="card bg-base-100 p-8 flex flex-col items-center text-center fade-in delay-300 hover:bg-base-200 border border-base-300 shadow-sm"
            style={{ transition: 'all 0.2s ease' }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-accent/10 text-accent">
              <Building2 size={32} />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-base-content">Ministry Portal</h2>
            <p className="text-sm text-base-content/60">
              Generate merit lists and bulk approve disbursements.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
