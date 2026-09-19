import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, Clock } from 'lucide-react';

const ApplicantDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto fade-in">
      <header className="mb-10 flex justify-between items-center border-b border-base-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1 text-primary">Applicant Dashboard</h1>
          <p className="text-base-content/60 font-medium">Welcome! Find and apply for scholarships matching your profile.</p>
        </div>
      </header>

      <h2 className="text-xl font-bold mb-4 fade-in delay-100 text-base-content">Available Schemes (2026-2027)</h2>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {/* Top Class Scholarship Card */}
        <div className="card bg-base-100 shadow-xl border border-base-200 fade-in delay-200">
          <div className="card-body">
            <div className="flex items-start justify-between mb-2">
              <div className="p-3 bg-primary/10 text-primary rounded-xl">
                <GraduationCap size={24} />
              </div>
              <div className="badge badge-success font-bold gap-1 p-3">Active</div>
            </div>
            <h3 className="card-title text-base-content mt-2">Top Class Education Scheme for ST Students</h3>
            <p className="text-base-content/70 text-sm flex-grow">
              Financial assistance for ST students pursuing higher education in premier institutes (IITs, IIMs, NITs) across India.
            </p>
            <div className="card-actions justify-between items-center border-t border-base-200 pt-4 mt-4">
              <div className="flex flex-col">
                <span className="text-xs text-base-content/50 font-bold uppercase tracking-wider">Coverage</span>
                <span className="text-sm font-bold text-primary">Up to ₹2,00,000 / yr</span>
              </div>
              <button
                onClick={() => navigate('/applicant/apply/mock-scheme-id')}
                className="btn btn-primary gap-2"
              >
                Apply Now <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* National Overseas Scholarship Card */}
        <div className="card bg-base-200/50 border border-base-200 fade-in delay-300 opacity-80">
          <div className="card-body">
            <div className="flex items-start justify-between mb-2">
              <div className="p-3 bg-base-300 text-base-content/50 rounded-xl">
                <GraduationCap size={24} />
              </div>
              <div className="badge badge-warning badge-outline font-bold p-3">Opening Soon</div>
            </div>
            <h3 className="card-title text-base-content mt-2">National Overseas Scholarship</h3>
            <p className="text-base-content/60 text-sm flex-grow">
              Financial assistance for ST students to pursue Masters and Ph.D in approved foreign universities.
            </p>
            <div className="card-actions justify-between items-center border-t border-base-200 pt-4 mt-4">
              <div className="flex flex-col">
                <span className="text-xs text-base-content/40 font-bold uppercase tracking-wider">Coverage</span>
                <span className="text-sm font-bold text-base-content/50">Travel & Tuition</span>
              </div>
              <button disabled className="btn btn-disabled">
                Apply Later
              </button>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4 fade-in delay-300 text-base-content">My Applications</h2>
      <div className="card bg-base-100 border-dashed border-2 border-base-300 p-10 text-center fade-in delay-300">
        <Clock className="mx-auto text-base-content/20 mb-4" size={48} />
        <h3 className="text-lg font-bold text-base-content/80 mb-1">No applications submitted</h3>
        <p className="text-sm text-base-content/50 font-medium">When you apply for a scheme, you can track its progress here.</p>
      </div>
    </div>
  );
};

export default ApplicantDashboard;
