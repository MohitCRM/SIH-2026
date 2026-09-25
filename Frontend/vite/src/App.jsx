import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Login from './pages/Login';
import Register from './pages/Register';
import ApplicantLayout from './layouts/ApplicantLayout';
import ApplicantDashboard from './pages/applicant/Dashboard';
import ApplicationFlow from './pages/applicant/ApplicationFlow';
import Applications from './pages/applicant/Applications';
import ApplicationView from './pages/applicant/ApplicationView';
import Messages from './pages/applicant/Messages';
import OfficerLayout from './layouts/OfficerLayout';
import OfficerDashboard from './pages/officer/OfficerDashboard';
import OfficerSchemeView from './pages/officer/OfficerSchemeView';
import VerificationView from './pages/officer/VerificationView';
import MinistryLayout from './layouts/MinistryLayout';
import MinistryDashboard from './pages/ministry/MinistryDashboard';
import MeritListView from './pages/ministry/MeritListView';
import './index.css'; // Make sure global css is imported

// We'll replace these with actual components later

function App() {
  const { t } = useTranslation();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Applicant Routes */}
        <Route path="/applicant" element={<ApplicantLayout />}>
          <Route index element={<ApplicantDashboard />} />
          <Route path="apply/:schemeId" element={<ApplicationFlow />} />
          <Route path="drafts" element={<Applications />} />
          <Route path="application/:applicationId" element={<ApplicationView />} />
          <Route path="messages" element={<Messages />} />
        </Route>

        {/* Officer Routes */}
        <Route path="/officer" element={<OfficerLayout />}>
           <Route index element={<OfficerDashboard />} />
           <Route path="scheme/:schemeId" element={<OfficerSchemeView />} />
           <Route path="verify/:applicationId" element={<VerificationView />} />
           <Route path="approved" element={<div className="p-8"><h1 className="text-3xl font-bold">{t('placeholderPages.approvedList')}</h1></div>} />
           <Route path="reports" element={<div className="p-8"><h1 className="text-3xl font-bold">{t('placeholderPages.reports')}</h1></div>} />
        </Route>
        {/* Ministry Routes */}
        <Route path="/ministry" element={<MinistryLayout />}>
           <Route index element={<MinistryDashboard />} />
           <Route path="merit-list/:schemeId" element={<MeritListView />} />
           <Route path="merit-lists" element={<div className="p-8"><h1 className="text-3xl font-bold">{t('placeholderPages.allMeritLists')}</h1></div>} />
           <Route path="funds" element={<div className="p-8"><h1 className="text-3xl font-bold">{t('placeholderPages.fundDisbursementDashboard')}</h1></div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
