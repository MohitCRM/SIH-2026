import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import OfficerApprovedList from './pages/officer/OfficerApprovedList';
import MinistryLayout from './layouts/MinistryLayout';
import MinistryDashboard from './pages/ministry/MinistryDashboard';
import MeritListView from './pages/ministry/MeritListView';
import CreateScheme from './pages/ministry/CreateScheme';
import ActiveSchemes from './pages/ministry/ActiveSchemes';
import FundsDashboard from './pages/ministry/FundsDashboard';
import VerifySanction from './pages/public/VerifySanction';
import './index.css'; // Make sure global css is imported
import { useTranslation } from 'react-i18next';

// We'll replace these with actual components later

function App() {
  const { i18n } = useTranslation();

  React.useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = i18n.dir();
  }, [i18n, i18n.language]);

  React.useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'appLanguage' && e.newValue) {
        if (i18n.language !== e.newValue) {
          i18n.changeLanguage(e.newValue);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [i18n]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-sanction/:sanctionNumber" element={<VerifySanction />} />

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
           <Route path="approved" element={<OfficerApprovedList />} />
        </Route>
        {/* Ministry Routes */}
        <Route path="/ministry" element={<MinistryLayout />}>
           <Route index element={<MinistryDashboard />} />
           <Route path="schemes" element={<ActiveSchemes />} />
           <Route path="create-scheme" element={<CreateScheme />} />
           <Route path="merit-list/:schemeId" element={<MeritListView />} />
           <Route path="funds" element={<FundsDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
