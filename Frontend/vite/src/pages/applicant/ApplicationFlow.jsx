import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, ChevronRight, UploadCloud, Loader2, Info } from 'lucide-react';

const MOCK_APPLICANT_ID = "64a7c2f1b2a3d4e5f6a7b8c9"; // Mock user ID
const MOCK_SCHEME_ID = "64a7d3a2b3c4d5e6f7a8b9c0"; // Mock scheme ID

// Canonical English labels sent to the backend / Sanction Letter, independent
// of whichever UI language the applicant filled the form in.
const INSTITUTE_LABELS = {
  iit_bombay: 'Indian Institute of Technology (IIT), Bombay',
  nit_trichy: 'National Institute of Technology (NIT), Trichy',
  iim_ahmedabad: 'Indian Institute of Management (IIM), Ahmedabad'
};
const COURSE_LEVEL_LABELS = {
  graduate: 'Graduate',
  post_graduate: 'Post Graduate'
};

const inputClass = "input input-bordered w-full";
const labelClass = "label text-sm font-bold text-base-content";

const ApplicationFlow = () => {
  const { schemeId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const existingAppId = searchParams.get('applicationId');
  const { t } = useTranslation();
  
  // Get real user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const applicantId = user._id || "64a7c2f1b2a3d4e5f6a7b8c9"; // Fallback
  
  const [currentStage, setCurrentStage] = useState(1);
  const [applicationId, setApplicationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    mobileNumber: '',
    emailAddress: '',
    accountNumber: '',
    ifscCode: '',
    instituteName: '',
    courseLevel: 'graduate',
    courseName: '',
    qualifyingMarksPercentage: ''
  });

  const [mobileVerified, setMobileVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const [files, setFiles] = useState({
    aadhaar: null,
    caste: null,
    domicile: null,
    disability: null,
    income: null,
    passbook: null
  });

  const [dynamicFormData, setDynamicFormData] = useState({});
  const [dynamicFiles, setDynamicFiles] = useState({});
  
  // Mock config representing what the AI generated and saved in Scheme.dynamicFields
  const mockStage4Config = [
    { key: "instituteName", label: "Institute Name", type: "text", required: true },
    { key: "courseName", label: "Course Name", type: "text", required: true },
    { key: "marksheet", label: "Previous Year Marksheet", type: "file", required: true }
  ];

  useEffect(() => {
    if (existingAppId) {
      const fetchApp = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/applicant/application/${existingAppId}`);
          if (!res.ok) throw new Error("Failed to load draft");
          const data = await res.json();
          setApplicationId(data.applicationId);
          
          setFormData(prev => ({
             ...prev,
             accountNumber: data.submittedData?.bankDetails?.accountNumber || '',
             ifscCode: data.submittedData?.bankDetails?.ifscCode || '',
             instituteName: data.submittedData?.instituteName || '',
             courseLevel: data.submittedData?.courseLevel || 'graduate',
             courseName: data.submittedData?.courseName || '',
             qualifyingMarksPercentage: data.submittedData?.qualifyingMarksPercentage || ''
          }));

          const trail = data.auditTrail || [];
          const actions = trail.map(a => a.action);
          if (actions.includes('STAGE_3_SUBMITTED')) setCurrentStage(4);
          else if (actions.includes('STAGE_2_SUBMITTED')) setCurrentStage(3);
          else if (actions.includes('STAGE_1_SUBMITTED')) setCurrentStage(2);
          else setCurrentStage(1);
        } catch (e) {
          console.error(e);
          setError("Failed to load draft application.");
        } finally {
          setLoading(false);
        }
      };
      fetchApp();
    }
  }, [existingAppId]);

  const handleFileChange = (e, fileKey) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [fileKey]: e.target.files[0] });
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDynamicInputChange = (e) => {
    setDynamicFormData({ ...dynamicFormData, [e.target.name]: e.target.value });
  };
  
  const handleDynamicFileChange = (e, fileKey) => {
    if (e.target.files && e.target.files[0]) {
      setDynamicFiles({ ...dynamicFiles, [fileKey]: e.target.files[0] });
    }
  };

  const handleStage1Submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const validSchemeId = (schemeId && schemeId !== "mock-scheme-id") ? schemeId : "64a7d3a2b3c4d5e6f7a8b9c0";
      const response = await fetch('/api/applicant/stage1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantId: applicantId, // Uses dynamic user
          schemeId: validSchemeId,
          aadhaarUrl: "https://mock-s3-url.com/aadhaar.jpg",
          mobileNumber: formData.mobileNumber,
          emailAddress: formData.emailAddress
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t('applicationFlow.errors.verificationFailed'));

      setApplicationId(data.applicationId);
      setCurrentStage(2);
      // Update URL so a refresh stays on the draft
      setSearchParams({ applicationId: data.applicationId });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStage2Submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/applicant/stage2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: applicationId,
          casteCertificateUrl: "https://mock-s3-url.com/caste_cert.pdf",
          domicileCertificateUrl: "https://mock-s3-url.com/domicile_cert.pdf",
          disabilityCertificateUrl: files.disability ? "https://mock-s3-url.com/disability_cert.pdf" : null
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t('applicationFlow.errors.verificationFailed'));

      setCurrentStage(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStage3Submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/applicant/stage3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: applicationId,
          incomeCertificateUrl: "https://mock-s3-url.com/income.pdf",
          passbookUrl: "https://mock-s3-url.com/passbook.pdf",
          isAadhaarLinkedToBank: formData.isAadhaarLinkedToBank
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t('applicationFlow.errors.verificationFailed'));

      setCurrentStage(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStage4Submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const dynamicData = { ...dynamicFormData };
      for (const [key, file] of Object.entries(dynamicFiles)) {
        if (file) {
          dynamicData[key] = `https://mock-s3-url.com/${key}.pdf`;
        }
      }

      const response = await fetch('/api/applicant/stage4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: applicationId,
          dynamicData
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Submission failed');
      
      setCurrentStage(5); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/applicant/final', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: applicationId,
          declarationAccepted: true
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t('applicationFlow.errors.submissionFailed'));
      
      setCurrentStage(6); 

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/applicant/save-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: applicationId
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t('applicationFlow.errors.saveDraftFailed'));
      
      navigate('/applicant/drafts');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepper = () => (
    <ul className="steps w-full mb-10 px-4">
      {[1, 2, 3, 4, 5].map((step) => (
        <li 
          key={step} 
          data-content={currentStage > step ? "✓" : step}
          className={`step ${currentStage >= step ? 'step-primary font-bold' : ''}`}
        >
          {t('applicationFlow.stepper.stage', { step })}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="p-8 flex justify-center fade-in">
      <div className="max-w-4xl w-full">
        <div className="mb-6">
          <button onClick={() => navigate('/applicant')} className="btn btn-ghost btn-sm gap-2">
            ← {t('applicationFlow.header.backToDashboard')}
          </button>
        </div>

        <div className="border-b border-base-200 pb-4 mb-8">
          <h1 className="text-3xl font-bold text-base-content">{t('applicationFlow.header.title')}</h1>
          <p className="text-base-content/60 font-medium">{t('applicantDashboard.topClass.title')}</p>
        </div>
        
        {currentStage < 5 && renderStepper()}

        {error && (
          <div className="alert alert-error mb-6 shadow-sm fade-in">
            <Info size={24} />
            <span>{error}</span>
          </div>
        )}

        <div className="card bg-base-100 shadow-xl border border-base-200 p-10 fade-in">
          {currentStage === 1 && (
            <form onSubmit={handleStage1Submit} className="space-y-8 slide-up">
              <div className="alert alert-info">
                <Info size={24} />
                <span><strong>{t('applicationFlow.stage1.badge')}</strong> {t('applicationFlow.stage1.info')}</span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>{t('applicationFlow.stage1.mobileLabel', 'Mobile Number')} <span className="text-error">*</span></label>
                  <div className="flex gap-2">
                    <input required name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} disabled={mobileVerified} className={inputClass} placeholder="Enter Mobile Number" />
                    {!mobileVerified ? (
                      <button type="button" onClick={() => { 
                        if(formData.mobileNumber) {
                          const otp = prompt("Mock OTP Verification\nAn OTP has been 'sent' to " + formData.mobileNumber + "\n\nEnter 123456 to verify:");
                          if (otp === "123456") setMobileVerified(true);
                          else if (otp !== null) alert("Invalid OTP. Try 123456.");
                        } 
                      }} className="btn btn-outline btn-primary">Verify</button>
                    ) : (
                      <button type="button" className="btn btn-success text-white" disabled>Verified</button>
                    )}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('applicationFlow.stage1.emailLabel', 'Email Address')} <span className="text-error">*</span></label>
                  <div className="flex gap-2">
                    <input required type="email" name="emailAddress" value={formData.emailAddress} onChange={handleInputChange} disabled={emailVerified} className={inputClass} placeholder="Enter Email Address" />
                    {!emailVerified ? (
                      <button type="button" onClick={() => { 
                        if(formData.emailAddress) {
                          const otp = prompt("Mock OTP Verification\nAn OTP has been 'sent' to " + formData.emailAddress + "\n\nEnter 123456 to verify:");
                          if (otp === "123456") setEmailVerified(true);
                          else if (otp !== null) alert("Invalid OTP. Try 123456.");
                        } 
                      }} className="btn btn-outline btn-primary">Verify</button>
                    ) : (
                      <button type="button" className="btn btn-success text-white" disabled>Verified</button>
                    )}
                  </div>
                </div>
              </div>

              {mobileVerified && emailVerified && (
                <div className="grid grid-cols-1 gap-6 slide-up">
                  <div>
                    <label className={labelClass}>{t('applicationFlow.stage1.aadhaarUploadLabel', 'Upload Aadhaar Card (Front & Back)')} <span className="text-error">*</span></label>
                    <div
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${files.aadhaar ? 'border-success bg-success/10' : 'border-base-300 bg-base-200/50 hover:bg-base-200'}`}
                      onClick={() => document.getElementById('aadhaar-upload').click()}
                    >
                      <UploadCloud className={`mx-auto mb-2 ${files.aadhaar ? 'text-success' : 'text-primary'}`} size={24} />
                      <p className={`text-sm font-semibold ${files.aadhaar ? 'text-success' : 'text-base-content'}`}>
                        {files.aadhaar ? files.aadhaar.name : 'Click to upload Aadhaar'}
                      </p>
                      <input type="file" id="aadhaar-upload" className="hidden" onChange={(e) => handleFileChange(e, 'aadhaar')} />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-6 border-t border-base-200">
                <button type="submit" disabled={loading || !mobileVerified || !emailVerified || !files.aadhaar} className="btn btn-primary gap-2 px-8">
                  {loading ? <span className="loading loading-spinner"></span> : t('applicationFlow.saveContinue')} <ChevronRight size={18} />
                </button>
              </div>
            </form>
          )}

          {currentStage === 2 && (
            <form onSubmit={handleStage2Submit} className="space-y-8 slide-up">
              <div className="alert alert-info">
                <Info size={24} />
                <span><strong>{t('applicationFlow.stage2.badge')}</strong> {t('applicationFlow.stage2.info')}</span>
              </div>

              <div>
                <label className={labelClass}>{t('applicationFlow.stage2.casteLabel', 'Caste Certificate (ST/PVTG)')} <span className="text-error">*</span></label>
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${files.caste ? 'border-success bg-success/10' : 'border-base-300 bg-base-200/50 hover:bg-base-200'}`}
                  onClick={() => document.getElementById('caste-upload').click()}
                >
                  <UploadCloud className={`mx-auto mb-2 ${files.caste ? 'text-success' : 'text-primary'}`} size={24} />
                  <p className={`text-sm font-semibold ${files.caste ? 'text-success' : 'text-base-content'}`}>
                    {files.caste ? files.caste.name : 'Select Caste Certificate'}
                  </p>
                  <input type="file" id="caste-upload" className="hidden" onChange={(e) => handleFileChange(e, 'caste')} />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('applicationFlow.stage2.domicileLabel', 'Domicile Certificate')} <span className="text-error">*</span></label>
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${files.domicile ? 'border-success bg-success/10' : 'border-base-300 bg-base-200/50 hover:bg-base-200'}`}
                  onClick={() => document.getElementById('domicile-upload').click()}
                >
                  <UploadCloud className={`mx-auto mb-2 ${files.domicile ? 'text-success' : 'text-primary'}`} size={24} />
                  <p className={`text-sm font-semibold ${files.domicile ? 'text-success' : 'text-base-content'}`}>
                    {files.domicile ? files.domicile.name : 'Select Domicile Certificate'}
                  </p>
                  <input type="file" id="domicile-upload" className="hidden" onChange={(e) => handleFileChange(e, 'domicile')} />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('applicationFlow.stage2.disabilityLabel', 'Disability Certificate (Optional)')}</label>
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${files.disability ? 'border-success bg-success/10' : 'border-base-300 bg-base-200/50 hover:bg-base-200'}`}
                  onClick={() => document.getElementById('disability-upload').click()}
                >
                  <UploadCloud className={`mx-auto mb-2 ${files.disability ? 'text-success' : 'text-primary'}`} size={24} />
                  <p className={`text-sm font-semibold ${files.disability ? 'text-success' : 'text-base-content'}`}>
                    {files.disability ? files.disability.name : 'Select Disability Certificate (If Applicable)'}
                  </p>
                  <input type="file" id="disability-upload" className="hidden" onChange={(e) => handleFileChange(e, 'disability')} />
                </div>
              </div>
              <div className="flex justify-end pt-6 border-t border-base-200">
                <button type="submit" disabled={loading || !files.caste || !files.domicile} className="btn btn-primary gap-2 px-8">
                   {loading ? <span className="loading loading-spinner"></span> : t('applicationFlow.saveContinue')} <ChevronRight size={18} />
                </button>
              </div>
            </form>
          )}

          {currentStage === 3 && (
            <form onSubmit={handleStage3Submit} className="space-y-8 slide-up">
               <div className="alert alert-info">
                <Info size={24} />
                <span><strong>{t('applicationFlow.stage3.badge')}</strong> {t('applicationFlow.stage3.info')}</span>
              </div>

              <div>
                <label className={labelClass}>{t('applicationFlow.stage3.incomeLabel', 'Income Certificate')} <span className="text-error">*</span></label>
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${files.income ? 'border-success bg-success/10' : 'border-base-300 bg-base-200/50 hover:bg-base-200'}`}
                  onClick={() => document.getElementById('income-upload').click()}
                >
                  <UploadCloud className={`mx-auto mb-2 ${files.income ? 'text-success' : 'text-primary'}`} size={24} />
                  <p className={`text-sm font-semibold ${files.income ? 'text-success' : 'text-base-content'}`}>
                    {files.income ? files.income.name : 'Select Income Certificate'}
                  </p>
                  <input type="file" id="income-upload" className="hidden" onChange={(e) => handleFileChange(e, 'income')} />
                </div>
              </div>
              
              <div>
                <label className={labelClass}>{t('applicationFlow.stage3.passbookLabel', 'Bank Passbook / Cancelled Cheque')} <span className="text-error">*</span></label>
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${files.passbook ? 'border-success bg-success/10' : 'border-base-300 bg-base-200/50 hover:bg-base-200'}`}
                  onClick={() => document.getElementById('passbook-upload').click()}
                >
                  <UploadCloud className={`mx-auto mb-2 ${files.passbook ? 'text-success' : 'text-primary'}`} size={24} />
                  <p className={`text-sm font-semibold ${files.passbook ? 'text-success' : 'text-base-content'}`}>
                    {files.passbook ? files.passbook.name : 'Select Bank Passbook'}
                  </p>
                  <input type="file" id="passbook-upload" className="hidden" onChange={(e) => handleFileChange(e, 'passbook')} />
                </div>
              </div>

              <label className="flex items-start gap-3 p-5 border border-base-300 rounded-xl cursor-pointer transition-colors hover:bg-base-200">
                <input type="checkbox" name="isAadhaarLinkedToBank" checked={formData.isAadhaarLinkedToBank || false} onChange={(e) => setFormData({...formData, isAadhaarLinkedToBank: e.target.checked})} className="checkbox checkbox-primary mt-1 flex-shrink-0" />
                <span className="text-sm font-medium text-base-content">
                  {t('applicationFlow.stage3.aadhaarLinked', 'I confirm that this bank account is linked to my Aadhaar number for Direct Benefit Transfer (DBT).')}
                </span>
              </label>

              <div className="flex justify-end pt-6 border-t border-base-200">
                <button type="submit" disabled={loading || !files.income || !files.passbook} className="btn btn-primary gap-2 px-8">
                   {loading ? <span className="loading loading-spinner"></span> : t('applicationFlow.saveContinue')} <ChevronRight size={18} />
                </button>
              </div>
            </form>
          )}

          {currentStage === 4 && (
            <form onSubmit={handleStage4Submit} className="space-y-6 slide-up">
              <div className="alert alert-info">
                <Info size={24} />
                <span><strong>Scheme Specific Details</strong> Please provide the following additional details required by this specific scheme.</span>
              </div>
              
              {mockStage4Config.map(field => (
                <div key={field.key}>
                  <label className={labelClass}>{field.label} {field.required && <span className="text-error">*</span>}</label>
                  
                  {field.type === 'text' && (
                    <input 
                      type="text" 
                      name={field.key} 
                      value={dynamicFormData[field.key] || ''} 
                      onChange={handleDynamicInputChange} 
                      required={field.required} 
                      className={inputClass} 
                      placeholder={`Enter ${field.label}`} 
                    />
                  )}
                  
                  {field.type === 'file' && (
                    <div
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${dynamicFiles[field.key] ? 'border-success bg-success/10' : 'border-base-300 bg-base-200/50 hover:bg-base-200'}`}
                      onClick={() => document.getElementById(`upload-${field.key}`).click()}
                    >
                      <UploadCloud className={`mx-auto mb-2 ${dynamicFiles[field.key] ? 'text-success' : 'text-primary'}`} size={24} />
                      <p className={`text-sm font-semibold ${dynamicFiles[field.key] ? 'text-success' : 'text-base-content'}`}>
                        {dynamicFiles[field.key] ? dynamicFiles[field.key].name : `Select ${field.label}`}
                      </p>
                      <input type="file" id={`upload-${field.key}`} className="hidden" onChange={(e) => handleDynamicFileChange(e, field.key)} required={field.required && !dynamicFiles[field.key]} />
                    </div>
                  )}
                </div>
              ))}

              <div className="flex justify-end pt-6 border-t border-base-200">
                <button type="submit" disabled={loading} className="btn btn-primary gap-2 px-8">
                   {loading ? <span className="loading loading-spinner"></span> : t('applicationFlow.saveContinue')} <ChevronRight size={18} />
                </button>
              </div>
            </form>
          )}

          {currentStage === 5 && (
            <form onSubmit={handleFinalSubmit} className="space-y-8 slide-up">
               <div className="alert alert-info">
                 <Info size={24} />
                 <span><strong>{t('applicationFlow.stage4.badge')}</strong> Review your application and submit.</span>
               </div>
               
               <div className="bg-base-200 rounded-xl p-6 space-y-4 border border-base-300">
                 <div className="flex justify-between border-b border-base-300 pb-3">
                   <span className="text-base-content/60 font-medium">{t('applicationFlow.stage4.applicationIdLabel')}</span>
                   <span className="font-bold text-base-content">{applicationId}</span>
                 </div>
                 {/* Dynamically render the summary of Stage 4 values */}
                 {mockStage4Config.map(field => (
                   <div key={`summary-${field.key}`} className="flex justify-between border-b border-base-300 pb-3">
                     <span className="text-base-content/60 font-medium">{field.label}</span>
                     <span className="font-bold text-right text-base-content">
                        {field.type === 'file' ? (dynamicFiles[field.key] ? 'Document Uploaded' : 'Pending') : dynamicFormData[field.key]}
                     </span>
                   </div>
                 ))}
              </div>

              <label className="flex items-start gap-3 p-5 border border-warning bg-warning/10 rounded-xl cursor-pointer transition-colors hover:bg-warning/20">
                <input type="checkbox" required className="checkbox checkbox-warning mt-1 flex-shrink-0" />
                <span className="text-sm font-medium text-warning-content">
                  {t('applicationFlow.stage4.declaration')}
                </span>
              </label>

              <div className="flex justify-end pt-6 border-t border-base-200 gap-4">
                <button type="button" onClick={handleSaveDraft} disabled={loading} className="btn btn-outline gap-2 px-6">
                   {loading ? <span className="loading loading-spinner"></span> : t('applicationFlow.stage4.saveAsDraft')}
                </button>
                <button type="submit" disabled={loading} className="btn btn-success text-success-content gap-2 px-8">
                   {loading ? <span className="loading loading-spinner"></span> : t('applicationFlow.stage4.finalSubmit')}
                </button>
              </div>
            </form>
          )}

          {currentStage === 6 && (
            <div className="text-center py-16 slide-up">
              <div className="w-24 h-24 bg-success/20 border-4 border-success/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={48} className="text-success" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-base-content">{t('applicationFlow.stage5.title')}</h2>
              <p className="text-base-content/60 mb-8 max-w-md mx-auto font-medium">
                {t('applicationFlow.stage5.body')}
              </p>
              <button onClick={() => navigate('/applicant')} className="btn btn-primary">
                {t('applicationFlow.stage5.returnToDashboard')}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ApplicationFlow;
