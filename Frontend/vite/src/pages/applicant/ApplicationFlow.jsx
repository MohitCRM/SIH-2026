import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  const { t } = useTranslation();
  const [currentStage, setCurrentStage] = useState(1);
  const [applicationId, setApplicationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    aadhaarNumber: '',
    accountNumber: '',
    ifscCode: '',
    instituteName: '',
    courseLevel: 'graduate',
    courseName: '',
    qualifyingMarksPercentage: ''
  });

  const [files, setFiles] = useState({
    passbook: null,
    caste: null,
    income: null,
    marksheet: null,
    bonafide: null,
    fee: null
  });

  const handleFileChange = (e, fileKey) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [fileKey]: e.target.files[0] });
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStage1Submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/applicant/stage1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicantId: MOCK_APPLICANT_ID,
          schemeId: MOCK_SCHEME_ID,
          aadhaarNumber: formData.aadhaarNumber,
          bankDetails: {
            accountNumber: formData.accountNumber,
            ifscCode: formData.ifscCode
          },
          passbookUrl: "https://mock-s3-url.com/passbook.jpg" 
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t('applicationFlow.errors.verificationFailed'));

      setApplicationId(data.applicationId);
      setCurrentStage(2);
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
          stCertificateUrl: "https://mock-s3-url.com/st_cert.pdf",
          incomeCertificateUrl: "https://mock-s3-url.com/income.pdf"
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
          instituteName: INSTITUTE_LABELS[formData.instituteName] || formData.instituteName,
          courseLevel: COURSE_LEVEL_LABELS[formData.courseLevel] || formData.courseLevel,
          courseName: formData.courseName,
          qualifyingMarksPercentage: parseFloat(formData.qualifyingMarksPercentage),
          qualifyingMarksheetUrl: "https://mock-s3-url.com/marksheet.pdf",
          bonafideCertificateUrl: "https://mock-s3-url.com/bonafide.pdf",
          feeReceiptUrl: "https://mock-s3-url.com/fee.pdf"
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

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/applicant/stage4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: applicationId,
          declarationAccepted: true
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t('applicationFlow.errors.submissionFailed'));
      
      setCurrentStage(5); 
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
      {[1, 2, 3, 4].map((step) => (
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

              <div>
                <label className={labelClass}>{t('applicationFlow.stage1.aadhaarLabel')} <span className="text-error">*</span></label>
                <input required name="aadhaarNumber" value={formData.aadhaarNumber} onChange={handleInputChange} className={inputClass} placeholder={t('applicationFlow.stage1.aadhaarPlaceholder')} pattern="[0-9]{12}" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>{t('applicationFlow.stage1.accountLabel')} <span className="text-error">*</span></label>
                  <input required name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} className={inputClass} placeholder={t('applicationFlow.stage1.accountPlaceholder')} />
                </div>
                <div>
                  <label className={labelClass}>{t('applicationFlow.stage1.ifscLabel')} <span className="text-error">*</span></label>
                  <input required name="ifscCode" value={formData.ifscCode} onChange={handleInputChange} className={inputClass} placeholder={t('applicationFlow.stage1.ifscPlaceholder')} />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('applicationFlow.stage1.passbookLabel')} <span className="text-error">*</span></label>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${files.passbook ? 'border-success bg-success/10' : 'border-base-300 bg-base-200/50 hover:bg-base-200'}`}
                  onClick={() => document.getElementById('passbook-upload').click()}
                >
                  <UploadCloud className={`mx-auto mb-3 ${files.passbook ? 'text-success' : 'text-primary'}`} size={32} />
                  <p className={`text-sm font-semibold ${files.passbook ? 'text-success' : 'text-base-content'}`}>
                    {files.passbook ? files.passbook.name : t('applicationFlow.stage1.uploadPrompt')}
                  </p>
                  {!files.passbook && <p className="text-xs text-base-content/50 mt-1">{t('applicationFlow.stage1.supportedFormats')}</p>}
                  <input type="file" id="passbook-upload" className="hidden" onChange={(e) => handleFileChange(e, 'passbook')} />
                </div>
              </div>
              <div className="flex justify-end pt-6 border-t border-base-200">
                <button type="submit" disabled={loading} className="btn btn-primary gap-2 px-8">
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
                <label className={labelClass}>{t('applicationFlow.stage2.casteLabel')} <span className="text-error">*</span></label>
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${files.caste ? 'border-success bg-success/10' : 'border-base-300 bg-base-200/50 hover:bg-base-200'}`}
                  onClick={() => document.getElementById('caste-upload').click()}
                >
                  <UploadCloud className={`mx-auto mb-2 ${files.caste ? 'text-success' : 'text-primary'}`} size={24} />
                  <p className={`text-sm font-semibold ${files.caste ? 'text-success' : 'text-base-content'}`}>
                    {files.caste ? files.caste.name : t('applicationFlow.stage2.selectDocument')}
                  </p>
                  <input type="file" id="caste-upload" className="hidden" onChange={(e) => handleFileChange(e, 'caste')} />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t('applicationFlow.stage2.incomeLabel')} <span className="text-error">*</span></label>
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${files.income ? 'border-success bg-success/10' : 'border-base-300 bg-base-200/50 hover:bg-base-200'}`}
                  onClick={() => document.getElementById('income-upload').click()}
                >
                  <UploadCloud className={`mx-auto mb-2 ${files.income ? 'text-success' : 'text-primary'}`} size={24} />
                  <p className={`text-sm font-semibold ${files.income ? 'text-success' : 'text-base-content'}`}>
                    {files.income ? files.income.name : t('applicationFlow.stage2.selectDocument')}
                  </p>
                  {!files.income && <p className="text-xs text-base-content/50 mt-1">{t('applicationFlow.stage2.incomeNote')}</p>}
                  <input type="file" id="income-upload" className="hidden" onChange={(e) => handleFileChange(e, 'income')} />
                </div>
              </div>
              <div className="flex justify-end pt-6 border-t border-base-200">
                <button type="submit" disabled={loading} className="btn btn-primary gap-2 px-8">
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
                <label className={labelClass}>{t('applicationFlow.stage3.instituteLabel')} <span className="text-error">*</span></label>
                <select name="instituteName" value={formData.instituteName} onChange={handleInputChange} required className="select select-bordered w-full">
                  <option value="" disabled>{t('applicationFlow.stage3.selectInstitute')}</option>
                  <option value="iit_bombay">{t('institutes.iit_bombay')}</option>
                  <option value="nit_trichy">{t('institutes.nit_trichy')}</option>
                  <option value="iim_ahmedabad">{t('institutes.iim_ahmedabad')}</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>{t('applicationFlow.stage3.courseLevelLabel')} <span className="text-error">*</span></label>
                  <select name="courseLevel" value={formData.courseLevel} onChange={handleInputChange} className="select select-bordered w-full">
                    <option value="graduate">{t('courseLevels.graduate')}</option>
                    <option value="post_graduate">{t('courseLevels.post_graduate')}</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t('applicationFlow.stage3.courseNameLabel')} <span className="text-error">*</span></label>
                  <input required name="courseName" value={formData.courseName} onChange={handleInputChange} className={inputClass} placeholder={t('applicationFlow.stage3.courseNamePlaceholder')} />
                </div>
              </div>
               <div>
                  <label className={labelClass}>{t('applicationFlow.stage3.marksLabel')} <span className="text-error">*</span></label>
                  <input required type="number" step="0.1" name="qualifyingMarksPercentage" value={formData.qualifyingMarksPercentage} onChange={handleInputChange} className={inputClass} placeholder={t('applicationFlow.stage3.marksPlaceholder')} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div 
                  className={`border border-base-300 rounded-xl p-4 text-center cursor-pointer transition-colors shadow-sm ${files.marksheet ? 'border-success bg-success/10' : 'bg-base-200/50 hover:bg-base-200'}`}
                  onClick={() => document.getElementById('marksheet-upload').click()}
                >
                   <p className={`text-sm font-semibold mb-2 ${files.marksheet ? 'text-success' : 'text-base-content'}`}>
                     {files.marksheet ? files.marksheet.name : t('applicationFlow.stage3.marksheetLabel')}
                   </p>
                   <UploadCloud className={`mx-auto ${files.marksheet ? 'text-success' : 'text-primary'}`} size={20} />
                   <input type="file" id="marksheet-upload" className="hidden" onChange={(e) => handleFileChange(e, 'marksheet')} />
                </div>
                <div 
                  className={`border border-base-300 rounded-xl p-4 text-center cursor-pointer transition-colors shadow-sm ${files.bonafide ? 'border-success bg-success/10' : 'bg-base-200/50 hover:bg-base-200'}`}
                  onClick={() => document.getElementById('bonafide-upload').click()}
                >
                   <p className={`text-sm font-semibold mb-2 ${files.bonafide ? 'text-success' : 'text-base-content'}`}>
                     {files.bonafide ? files.bonafide.name : t('applicationFlow.stage3.bonafideLabel')}
                   </p>
                   <UploadCloud className={`mx-auto ${files.bonafide ? 'text-success' : 'text-primary'}`} size={20} />
                   <input type="file" id="bonafide-upload" className="hidden" onChange={(e) => handleFileChange(e, 'bonafide')} />
                </div>
                 <div 
                   className={`border border-base-300 rounded-xl p-4 text-center cursor-pointer transition-colors shadow-sm ${files.fee ? 'border-success bg-success/10' : 'bg-base-200/50 hover:bg-base-200'}`}
                   onClick={() => document.getElementById('fee-upload').click()}
                 >
                   <p className={`text-sm font-semibold mb-2 ${files.fee ? 'text-success' : 'text-base-content'}`}>
                     {files.fee ? files.fee.name : t('applicationFlow.stage3.feeLabel')}
                   </p>
                   <UploadCloud className={`mx-auto ${files.fee ? 'text-success' : 'text-primary'}`} size={20} />
                   <input type="file" id="fee-upload" className="hidden" onChange={(e) => handleFileChange(e, 'fee')} />
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-base-200">
                <button type="submit" disabled={loading} className="btn btn-primary gap-2 px-8">
                   {loading ? <span className="loading loading-spinner"></span> : t('applicationFlow.saveContinue')} <ChevronRight size={18} />
                </button>
              </div>
            </form>
          )}

          {currentStage === 4 && (
            <form onSubmit={handleFinalSubmit} className="space-y-8 slide-up">
               <div className="alert alert-info">
                <Info size={24} />
                <span><strong>{t('applicationFlow.stage4.badge')}</strong> {t('applicationFlow.stage4.info')}</span>
              </div>

              <div className="bg-base-200 rounded-xl p-6 space-y-4 border border-base-300">
                 <div className="flex justify-between border-b border-base-300 pb-3">
                   <span className="text-base-content/60 font-medium">{t('applicationFlow.stage4.applicationIdLabel')}</span>
                   <span className="font-bold text-base-content">{applicationId}</span>
                 </div>
                 <div className="flex justify-between border-b border-base-300 pb-3">
                   <span className="text-base-content/60 font-medium">{t('applicationFlow.stage4.instituteLabel')}</span>
                   <span className="font-bold text-right text-base-content">{formData.instituteName ? t(`institutes.${formData.instituteName}`) : ''}</span>
                 </div>
                 <div className="flex justify-between border-b border-base-300 pb-3">
                   <span className="text-base-content/60 font-medium">{t('applicationFlow.stage4.courseLabel')}</span>
                   <span className="font-bold text-right text-base-content">{t(`courseLevels.${formData.courseLevel}`)} - {formData.courseName}</span>
                 </div>
                 <div className="flex justify-between pb-1 pt-1">
                   <span className="text-base-content/60 font-medium">{t('applicationFlow.stage4.meritScoreLabel')}</span>
                   <span className="font-bold text-success text-lg">{formData.qualifyingMarksPercentage}%</span>
                 </div>
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

          {currentStage === 5 && (
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
