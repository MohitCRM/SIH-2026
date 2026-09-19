import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoleSelector from './pages/RoleSelector';
import ApplicantLayout from './layouts/ApplicantLayout';
import ApplicantDashboard from './pages/applicant/Dashboard';
import ApplicationFlow from './pages/applicant/ApplicationFlow';
import Applications from './pages/applicant/Applications';
import ApplicationView from './pages/applicant/ApplicationView';
import OfficerLayout from './layouts/OfficerLayout';
import OfficerDashboard from './pages/officer/OfficerDashboard';
import VerificationView from './pages/officer/VerificationView';
import MinistryLayout from './layouts/MinistryLayout';
import MinistryDashboard from './pages/ministry/MinistryDashboard';
import MeritListView from './pages/ministry/MeritListView';
import './index.css'; // Make sure global css is imported

// We'll replace these with actual components later

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoleSelector />} />

        {/* Applicant Routes */}
        <Route path="/applicant" element={<ApplicantLayout />}>
          <Route index element={<ApplicantDashboard />} />
          <Route path="apply/:schemeId" element={<ApplicationFlow />} />
          <Route path="drafts" element={<Applications />} />
          <Route path="application/:applicationId" element={<ApplicationView />} />
          <Route path="messages" element={<div className="p-8"><h1 className="text-3xl font-bold">Messages</h1></div>} />
        </Route>

        {/* Officer Routes */}
        <Route path="/officer" element={<OfficerLayout />}>
           <Route index element={<OfficerDashboard />} />
           <Route path="verify/:applicationId" element={<VerificationView />} />
           <Route path="approved" element={<div className="p-8"><h1 className="text-3xl font-bold">Approved List</h1></div>} />
           <Route path="reports" element={<div className="p-8"><h1 className="text-3xl font-bold">Reports</h1></div>} />
        </Route>
        {/* Ministry Routes */}
        <Route path="/ministry" element={<MinistryLayout />}>
           <Route index element={<MinistryDashboard />} />
           <Route path="merit-list/:schemeId" element={<MeritListView />} />
           <Route path="merit-lists" element={<div className="p-8"><h1 className="text-3xl font-bold">All Merit Lists</h1></div>} />
           <Route path="funds" element={<div className="p-8"><h1 className="text-3xl font-bold">Fund Disbursement Dashboard</h1></div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
