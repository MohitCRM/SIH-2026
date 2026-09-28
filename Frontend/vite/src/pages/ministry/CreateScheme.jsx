import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadCloud, CheckCircle2, ChevronRight, Loader2, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateScheme = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [file, setFile] = useState(null);
  const [loadingExtract, setLoadingExtract] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [loadingSave, setLoadingSave] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleExtract = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoadingExtract(true);
    setError(null);
    try {
      // Simulate file upload and AI extraction
      const response = await fetch('/api/ministry/schemes/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentUrl: `https://mock-s3-url.com/${file.name}`
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Extraction failed');
      
      setExtractedData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingExtract(false);
    }
  };

  const handleSaveScheme = async () => {
    setLoadingSave(true);
    setError(null);
    try {
      const response = await fetch('/api/ministry/schemes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(extractedData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save scheme');
      
      setSuccess(true);
      setTimeout(() => navigate('/ministry'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto slide-up">
      <h1 className="text-3xl font-bold mb-6 text-base-content">AI Scheme Generator</h1>
      
      {error && (
        <div className="alert alert-error mb-6">
          <Info size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success mb-6">
          <CheckCircle2 size={20} />
          <span>Scheme successfully created! Redirecting...</span>
        </div>
      )}

      {!extractedData ? (
        <div className="bg-base-100 rounded-2xl shadow-xl border border-base-200 p-8">
          <h2 className="text-xl font-bold mb-4">1. Upload Scheme Guidelines PDF</h2>
          <p className="text-base-content/60 mb-6">Our AI Agent will parse the document, extract eligibility rules, and automatically generate the unique dynamic fields required for the application form.</p>
          
          <div
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${file ? 'border-primary bg-primary/10' : 'border-base-300 bg-base-200/50 hover:bg-base-200'}`}
            onClick={() => document.getElementById('guideline-upload').click()}
          >
            <UploadCloud className={`mx-auto mb-4 ${file ? 'text-primary' : 'text-base-content/40'}`} size={48} />
            <h3 className="text-lg font-bold mb-2">{file ? file.name : 'Click to browse or drag PDF here'}</h3>
            <p className="text-sm text-base-content/60">PDF documents only</p>
            <input type="file" id="guideline-upload" accept=".pdf" className="hidden" onChange={handleFileChange} />
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              className="btn btn-primary px-8" 
              disabled={!file || loadingExtract} 
              onClick={handleExtract}
            >
              {loadingExtract ? (
                <><Loader2 className="animate-spin" size={20} /> Analyzing with AI...</>
              ) : (
                <>Generate Scheme <ChevronRight size={20} /></>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-base-100 rounded-2xl shadow-xl border border-base-200 p-8 slide-up">
            <h2 className="text-2xl font-bold mb-6 text-primary border-b border-base-200 pb-4">
              2. Review AI Extracted Scheme
            </h2>
            
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-sm font-bold text-base-content/60 uppercase tracking-wider mb-2">Scheme Name</h3>
                <input 
                  type="text" 
                  className="input input-bordered w-full font-semibold" 
                  value={extractedData.name} 
                  onChange={(e) => setExtractedData({...extractedData, name: e.target.value})}
                />
              </div>
              <div>
                <h3 className="text-sm font-bold text-base-content/60 uppercase tracking-wider mb-2">Max Family Income Limit</h3>
                <input 
                  type="number" 
                  className="input input-bordered w-full" 
                  value={extractedData.eligibilityRules.maxFamilyIncome || ''} 
                  onChange={(e) => setExtractedData({
                    ...extractedData, 
                    eligibilityRules: { ...extractedData.eligibilityRules, maxFamilyIncome: parseInt(e.target.value) }
                  })}
                />
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="badge badge-primary">Unique AI Discovery</span>
                Generated Dynamic Fields (Stage 4)
              </h3>
              <div className="bg-base-200 rounded-xl p-4 border border-base-300">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Field Label</th>
                      <th>Type</th>
                      <th>Required</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedData.dynamicFields.map((field, idx) => (
                      <tr key={idx}>
                        <td className="font-medium">{field.label}</td>
                        <td><span className="badge badge-ghost">{field.type}</span></td>
                        <td>{field.required ? <span className="text-error font-bold">Yes</span> : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-base-content/60 mt-2">These fields will be dynamically injected into Stage 4 of the applicant's flow when they apply for this scheme.</p>
            </div>

            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-base-200">
              <button className="btn btn-outline" onClick={() => setExtractedData(null)} disabled={loadingSave}>
                Back
              </button>
              <button className="btn btn-success text-success-content px-8 gap-2" onClick={handleSaveScheme} disabled={loadingSave}>
                {loadingSave ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                Confirm & Create Scheme
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateScheme;
