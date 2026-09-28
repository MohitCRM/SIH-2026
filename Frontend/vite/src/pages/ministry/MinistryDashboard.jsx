import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IndianRupee, Users, TrendingUp, ChevronRight, AlertCircle, Bot, FileWarning, Fingerprint, ShieldCheck } from 'lucide-react';

const MinistryDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const analytics = {
    macro: {
      aiRate: 87.4,
      dbtRate: 94.2,
      totalDisbursed: "₹44.8 Cr",
      dropOffRate: 12.1
    },
    funnel: {
      totalSubmitted: 45210,
      pendingAI: 2145,
      pendingManual: 8400,
      deficient: 1820,
      readyForMerit: 32845
    },
    quotas: {
      female: { filled: 4400, total: 5000, pct: 88 },
      pvtg: { filled: 840, total: 2000, pct: 42 },
      divyangjan: { filled: 950, total: 1000, pct: 95 }
    },
    schemes: [
      { id: "64a7d3a2b3c4d5e6f7a8b9c0", nameKey: 'Top Class Education for ST Students', pendingLists: 1, totalDisbursed: '₹14.2 Cr' },
      { id: 'nos', nameKey: 'National Overseas Scholarship (NOS)', pendingLists: 0, totalDisbursed: '₹8.5 Cr' },
      { id: 'nfst', nameKey: 'National Fellowship for ST (NFST)', pendingLists: 0, totalDisbursed: '₹22.1 Cr' }
    ]
  };

  const { macro, funnel, quotas, schemes } = analytics;

  return (
    <div className="w-full fade-in space-y-10 pb-20 px-2 lg:px-4">
      
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-base-content">Ministry Intelligence Dashboard</h1>
          <p className="text-base-content/60 font-medium">Real-time monitoring of scheme performance, AI verification, and demographics.</p>
        </div>
        <button className="btn btn-primary shadow-lg shadow-primary/30" onClick={() => navigate('/ministry/create-scheme')}>
          + Create New Scheme
        </button>
      </header>

      {/* 1. Macro Analytics & AI Efficiency */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="stat shadow-sm border border-base-200 bg-base-100 rounded-2xl">
          <div className="stat-figure text-primary bg-primary/10 p-3 rounded-xl">
            <Bot size={28}/>
          </div>
          <div className="stat-title font-bold uppercase tracking-wider text-xs">AI Auto-Verification</div>
          <div className="stat-value text-primary text-4xl mt-1">{macro.aiRate}%</div>
          <div className="stat-desc text-base-content/60 font-medium mt-1">Docs verified without human input</div>
        </div>

        <div className="stat shadow-sm border border-base-200 bg-base-100 rounded-2xl">
          <div className="stat-figure text-success bg-success/10 p-3 rounded-xl">
            <ShieldCheck size={28}/>
          </div>
          <div className="stat-title font-bold uppercase tracking-wider text-xs">DBT Readiness Score</div>
          <div className="stat-value text-success text-4xl mt-1">{macro.dbtRate}%</div>
          <div className="stat-desc text-base-content/60 font-medium mt-1">Approved profiles Aadhaar-linked</div>
        </div>

        <div className="stat shadow-sm border border-base-200 bg-base-100 rounded-2xl">
          <div className="stat-figure text-warning bg-warning/10 p-3 rounded-xl">
            <IndianRupee size={28}/>
          </div>
          <div className="stat-title font-bold uppercase tracking-wider text-xs">Total Funds Disbursed</div>
          <div className="stat-value text-warning text-4xl mt-1">{macro.totalDisbursed}</div>
          <div className="stat-desc text-base-content/60 font-medium mt-1">Across all active schemes</div>
        </div>

        <div className="stat shadow-sm border border-base-200 bg-base-100 rounded-2xl">
          <div className="stat-figure text-error bg-error/10 p-3 rounded-xl">
            <FileWarning size={28}/>
          </div>
          <div className="stat-title font-bold uppercase tracking-wider text-xs">Form Drop-off Rate</div>
          <div className="stat-value text-error text-4xl mt-1">{macro.dropOffRate}%</div>
          <div className="stat-desc text-base-content/60 font-medium mt-1">Most drop-offs at Stage 3 (Income)</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 2. Application Funnel Tracker */}
        <div className="card bg-base-100 border border-base-200 shadow-sm rounded-2xl">
          <div className="p-6 border-b border-base-200">
            <h2 className="text-xl font-bold">Live Application Funnel</h2>
            <p className="text-sm text-base-content/60">Real-time status of all incoming applications.</p>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-sm">Total Applications Submitted</span>
                <span className="font-bold text-sm">{funnel.totalSubmitted}</span>
              </div>
              <progress className="progress progress-primary w-full" value="100" max="100"></progress>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-sm">Pending AI OCR Verification</span>
                <span className="font-bold text-sm">{funnel.pendingAI}</span>
              </div>
              <progress className="progress progress-info w-full" value={(funnel.pendingAI / funnel.totalSubmitted) * 100} max="100"></progress>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-sm">Pending Manual Nodal Scrutiny</span>
                <span className="font-bold text-sm">{funnel.pendingManual}</span>
              </div>
              <progress className="progress progress-warning w-full" value={(funnel.pendingManual / funnel.totalSubmitted) * 100} max="100"></progress>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-sm text-error">Deficient (Returned to Student)</span>
                <span className="font-bold text-sm text-error">{funnel.deficient}</span>
              </div>
              <progress className="progress progress-error w-full" value={(funnel.deficient / funnel.totalSubmitted) * 100} max="100"></progress>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-sm text-success">Ready for Merit List / Approved</span>
                <span className="font-bold text-sm text-success">{funnel.readyForMerit}</span>
              </div>
              <progress className="progress progress-success w-full" value={(funnel.readyForMerit / funnel.totalSubmitted) * 100} max="100"></progress>
            </div>
          </div>
        </div>

        {/* 3. Sub-Quota & Socio-Economic Tracker */}
        <div className="space-y-8">
          
          <div className="card bg-base-100 border border-base-200 shadow-sm rounded-2xl">
            <div className="p-6 border-b border-base-200">
              <h2 className="text-xl font-bold">Vulnerable Group Fulfillment (Quotas)</h2>
              <p className="text-sm text-base-content/60">Tracking reserved slots across active schemes.</p>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="radial-progress text-primary mb-2" style={{"--value":quotas.female.pct, "--size": "4.5rem", "--thickness": "6px"}} role="progressbar">{quotas.female.pct}%</div>
                <h3 className="font-bold text-sm">Female ST</h3>
                <p className="text-xs text-base-content/60 mt-1">{quotas.female.filled} / {quotas.female.total} filled</p>
              </div>
              <div>
                <div className="radial-progress text-warning mb-2" style={{"--value":quotas.pvtg.pct, "--size": "4.5rem", "--thickness": "6px"}} role="progressbar">{quotas.pvtg.pct}%</div>
                <h3 className="font-bold text-sm">PVTG</h3>
                <p className="text-xs text-base-content/60 mt-1">{quotas.pvtg.filled} / {quotas.pvtg.total} filled</p>
              </div>
              <div>
                <div className="radial-progress text-secondary mb-2" style={{"--value":quotas.divyangjan.pct, "--size": "4.5rem", "--thickness": "6px"}} role="progressbar">{quotas.divyangjan.pct}%</div>
                <h3 className="font-bold text-sm">Divyangjan</h3>
                <p className="text-xs text-base-content/60 mt-1">{quotas.divyangjan.filled} / {quotas.divyangjan.total} filled</p>
              </div>
            </div>
            {quotas.pvtg.pct < 50 && (
              <div className="px-6 pb-6 text-sm text-warning font-medium">
                <AlertCircle size={16} className="inline mr-1 relative -top-[1px]"/> PVTG quota is severely underutilized. Consider targeted awareness campaigns.
              </div>
            )}
          </div>

          <div className="card bg-base-100 border border-base-200 shadow-sm rounded-2xl">
            <div className="p-6 border-b border-base-200">
              <h2 className="text-xl font-bold">Socio-Economic Impact</h2>
              <p className="text-sm text-base-content/60">Family Income bracket of selected applicants.</p>
            </div>
            <div className="p-6 space-y-4">
               <div>
                  <div className="flex justify-between text-xs font-bold mb-1"><span className="uppercase text-base-content/60">₹0 - ₹1 Lakh / yr</span><span>45%</span></div>
                  <progress className="progress progress-success w-full h-3" value="45" max="100"></progress>
               </div>
               <div>
                  <div className="flex justify-between text-xs font-bold mb-1"><span className="uppercase text-base-content/60">₹1 Lakh - ₹2.5 Lakhs / yr</span><span>35%</span></div>
                  <progress className="progress progress-info w-full h-3" value="35" max="100"></progress>
               </div>
               <div>
                  <div className="flex justify-between text-xs font-bold mb-1"><span className="uppercase text-base-content/60">₹2.5 Lakhs - ₹8 Lakhs / yr</span><span>20%</span></div>
                  <progress className="progress progress-warning w-full h-3" value="20" max="100"></progress>
               </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Active Schemes Action Table */}
      <div className="card bg-base-100 border border-base-200 shadow-sm overflow-hidden rounded-2xl mt-8">
        <div className="p-6 border-b border-base-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-base-content">Active Schemes Management</h2>
            <p className="text-sm text-base-content/60 mt-1">Generate merit lists and disburse funds.</p>
          </div>
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

export default MinistryDashboard;
