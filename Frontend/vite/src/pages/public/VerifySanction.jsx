import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, ShieldCheck, Printer, AlertCircle, Award, Landmark, Calendar, Banknote } from 'lucide-react';

const VerifySanction = () => {
  const { sanctionNumber } = useParams();
  const [letter, setLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLetter = async () => {
      try {
        const decodedNumber = decodeURIComponent(sanctionNumber);
        const response = await fetch(`/api/ministry/verify-sanction/${encodeURIComponent(decodedNumber)}`);
        if (!response.ok) {
          throw new Error("Invalid or forged sanction letter.");
        }
        const data = await response.json();
        setLetter(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLetter();
  }, [sanctionNumber]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary mb-4"></span>
        <p className="text-lg font-medium text-base-content/60">Verifying Digital Sanction Letter...</p>
      </div>
    );
  }

  if (error || !letter) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-base-100 shadow-2xl rounded-2xl p-8 text-center border-t-8 border-error">
          <div className="mx-auto w-20 h-20 bg-error/10 text-error flex items-center justify-center rounded-full mb-6">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-4">Verification Failed</h2>
          <p className="text-base-content/70 mb-8">{error || "This document could not be verified in the MoTA database."}</p>
          <Link to="/" className="btn btn-primary w-full">Return Home</Link>
        </div>
      </div>
    );
  }

  const { financialBreakdown } = letter;

  return (
    <div className="min-h-screen bg-base-200 py-12 px-4 print:p-0 print:bg-white fade-in">
      
      <div className="max-w-4xl mx-auto flex justify-end mb-4 print:hidden">
        <button onClick={() => window.print()} className="btn btn-primary shadow-lg gap-2">
          <Printer size={18} /> Print Official Letter
        </button>
      </div>

      <div className="max-w-4xl mx-auto bg-base-100 shadow-2xl rounded-xl overflow-hidden print:shadow-none print:w-full print:rounded-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] border border-base-300">
        
        {/* Header Section */}
        <div className="border-b-4 border-primary p-8 md:p-12 pb-8">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-6">
              {/* National Emblem Placeholder */}
              <div className="w-20 h-24 bg-base-200 border border-base-300 rounded flex items-center justify-center opacity-80">
                <Landmark size={40} className="text-base-content/30" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-base-content uppercase tracking-wider font-serif">Government of India</h1>
                <h2 className="text-xl font-bold text-primary mt-1">Ministry of Tribal Affairs (MoTA)</h2>
                <p className="text-base-content/60 mt-1 font-medium">Shastri Bhawan, New Delhi - 110001</p>
              </div>
            </div>
            
            <div className="text-right flex flex-col items-end">
               <div className="badge badge-success gap-2 p-4 text-sm font-bold shadow-sm mb-4">
                 <ShieldCheck size={16} /> Digitally Verified
               </div>
               {letter.qrCodeUrl && (
                 <img src={letter.qrCodeUrl} alt="Verification QR Code" className="w-28 h-28 border-4 border-base-100 shadow-sm rounded-lg" />
               )}
            </div>
          </div>
        </div>

        {/* Body Section */}
        <div className="p-8 md:p-12 pt-8 font-serif leading-relaxed text-base-content/90">
          
          <div className="flex justify-between items-end mb-10 border-b border-base-200 pb-4">
             <div>
               <p className="text-sm uppercase tracking-wide font-bold text-base-content/50 mb-1">Sanction Letter Number</p>
               <p className="text-lg font-mono font-bold">{letter.sanctionNumber}</p>
             </div>
             <div className="text-right">
               <p className="text-sm uppercase tracking-wide font-bold text-base-content/50 mb-1">Date of Issue</p>
               <p className="text-lg font-bold flex items-center gap-2 justify-end"><Calendar size={18} className="text-primary"/> {new Date(letter.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
             </div>
          </div>

          <h3 className="text-2xl font-bold mb-6 text-center underline decoration-primary decoration-2 underline-offset-8">OFFICIAL SANCTION LETTER</h3>

          <p className="mb-6 text-lg">
            This is to certify that <strong className="text-xl">{letter.studentName}</strong> has been selected for the award of the <strong className="text-primary">{letter.schemeName}</strong> for the academic year <strong>{letter.academicYear}</strong>.
          </p>

          <p className="mb-8 text-lg">
            Based on the rigorous verification of credentials and merit rank, the Ministry is pleased to sanction a total financial assistance of <strong className="text-2xl text-accent">₹{financialBreakdown.totalSanctionedAmount.toLocaleString('en-IN')}</strong> to be disbursed for the applicant's studies at <strong>{letter.instituteName}</strong>.
          </p>

          <div className="bg-base-200/50 rounded-xl p-6 mb-8 border border-base-300 shadow-inner">
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-base-300 pb-2"><Banknote className="text-accent" /> Financial Breakdown</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base">
              <div className="flex justify-between border-b border-base-300 pb-1">
                <span className="text-base-content/70">Tuition Fees:</span>
                <span className="font-bold">₹{financialBreakdown.tuitionFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-b border-base-300 pb-1">
                <span className="text-base-content/70">Living Expenses:</span>
                <span className="font-bold">₹{financialBreakdown.livingExpensesAllowance.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-b border-base-300 pb-1">
                <span className="text-base-content/70">Books & Stationery:</span>
                <span className="font-bold">₹{financialBreakdown.booksAndStationeryAllowance.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-b border-base-300 pb-1">
                <span className="text-base-content/70">Computer Hardware:</span>
                <span className="font-bold">₹{financialBreakdown.computerHardwareAllowance.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t-2 border-base-300 flex justify-between items-center text-xl font-bold">
               <span>Total Sanctioned Amount:</span>
               <span className="text-accent">₹{financialBreakdown.totalSanctionedAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <h4 className="font-bold text-base-content/60 uppercase text-xs tracking-wider mb-2">Disbursement Method</h4>
              <p className="font-medium text-lg">{letter.disbursementAccount?.paymentMode}</p>
              <p className="text-base-content/70 text-sm mt-1">Aadhaar: <span className="font-mono bg-base-200 px-2 py-1 rounded">{letter.disbursementAccount?.beneficiaryAadhaar}</span></p>
            </div>
            {letter.disbursementAccount?.transactionRefNo && (
              <div className="md:text-right">
                <h4 className="font-bold text-base-content/60 uppercase text-xs tracking-wider mb-2">DBT Transaction Reference</h4>
                <p className="font-mono text-lg font-bold text-success bg-success/10 inline-block px-3 py-1 rounded border border-success/20">{letter.disbursementAccount.transactionRefNo}</p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-end mt-20 pt-8 border-t-2 border-base-300">
             <div>
                <p className="text-sm text-base-content/50 italic mb-2">This is a system-generated document.<br/>Scan the QR code to verify authenticity directly on the MoTA Portal.</p>
             </div>
             <div className="text-center">
                <div className="w-48 border-b border-base-content/30 mb-2"></div>
                <p className="font-bold uppercase text-sm tracking-wide">Authorized Signatory</p>
                <p className="text-xs text-base-content/60">Ministry of Tribal Affairs</p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VerifySanction;
