import React, { useState } from "react";
import { FreelancerTaxRemittanceService, type RemittanceCalcResult, type FormCCertificate, type DocxInvoiceExport } from "@/lib/infrastructure/freelancer-tax-remittance-service";

export interface FreelancerTaxRemittanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FreelancerTaxRemittanceModal: React.FC<FreelancerTaxRemittanceModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"calculator" | "formC" | "invoice">("calculator");

  // Form Inputs
  const [grossUsd, setGrossUsd] = useState(2500);
  const [exchangeRate, setExchangeRate] = useState(122.50);
  const [wireProvider, setWireProvider] = useState<"wise" | "payoneer" | "swift">("wise");
  const [category, setCategory] = useState<"it_software_export" | "digital_marketing" | "other_services">("it_software_export");
  const [freelancerName, setFreelancerName] = useState("Tanvir Ahmed");
  const [nidNumber, setNidNumber] = useState("19942691234567890");

  // Client Invoice Inputs
  const [clientName, setClientName] = useState("Acme Corp LLC");
  const [clientCountry, setClientCountry] = useState("United States");
  const [serviceDesc, setServiceDesc] = useState("Full-Stack React & InsForge Backend Software Development");

  // Calculation & Output States
  const [calcResult, setCalcResult] = useState<RemittanceCalcResult | null>(null);
  const [formCCert, setFormCCert] = useState<FormCCertificate | null>(null);
  const [docxInvoice, setDocxInvoice] = useState<DocxInvoiceExport | null>(null);

  if (!isOpen) return null;

  const handleCalculate = () => {
    const result = FreelancerTaxRemittanceService.calculateRemittance({
      grossUsd,
      exchangeRateBdt: exchangeRate,
      wireProvider,
      serviceCategory: category,
      freelancerName,
      passportOrNid: nidNumber,
    });
    setCalcResult(result);
  };

  const handleGenerateFormC = () => {
    const cert = FreelancerTaxRemittanceService.generateFormCCertificate({
      grossUsd,
      exchangeRateBdt: exchangeRate,
      wireProvider,
      serviceCategory: category,
      freelancerName,
      passportOrNid: nidNumber,
    });
    setFormCCert(cert);
    setActiveTab("formC");
  };

  const handleExportDocx = () => {
    const invoice = FreelancerTaxRemittanceService.generateDocxInvoiceTemplate(clientName, clientCountry, serviceDesc, grossUsd);
    setDocxInvoice(invoice);
    setActiveTab("invoice");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>💳</span> Freelancer Form C & NBR Tax Remittance Portal
            </h2>
            <p className="text-xs text-slate-400">Software Export 0% Tax Exemption, Wire Reconciliation & .docx Invoice Generator</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center">✕</button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("calculator")}
            className={`px-4 py-2 rounded-xl transition-colors ${activeTab === "calculator" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
          >
            1. Remittance Calculator
          </button>
          <button
            onClick={() => setActiveTab("formC")}
            className={`px-4 py-2 rounded-xl transition-colors ${activeTab === "formC" ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
          >
            2. Form C Certificate
          </button>
          <button
            onClick={() => setActiveTab("invoice")}
            className={`px-4 py-2 rounded-xl transition-colors ${activeTab === "invoice" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
          >
            3. Client .docx Invoice
          </button>
        </div>

        {/* Tab 1: Remittance Calculator */}
        {activeTab === "calculator" && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-xs bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-slate-400 mb-1">Gross Remittance ($ USD)</label>
                <input
                  type="number"
                  value={grossUsd}
                  onChange={(e) => setGrossUsd(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">USD/BDT Exchange Rate</label>
                <input
                  type="number"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Wire Transfer Gateway</label>
                <select
                  value={wireProvider}
                  onChange={(e) => setWireProvider(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="wise">Wise Bank Transfer ($12 Fee)</option>
                  <option value="payoneer">Payoneer Direct Wire ($15 Fee)</option>
                  <option value="swift">SWIFT International Wire ($25 Fee)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-slate-400 mb-1">Freelancer Full Name</label>
                <input
                  type="text"
                  value={freelancerName}
                  onChange={(e) => setFreelancerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">NID / Passport Number</label>
                <input
                  type="text"
                  value={nidNumber}
                  onChange={(e) => setNidNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCalculate}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-xl text-xs transition-colors"
              >
                Calculate Remittance & NBR Tax Status ➔
              </button>
              <button
                onClick={handleGenerateFormC}
                className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-medium py-2.5 rounded-xl text-xs transition-colors"
              >
                Generate Form C Certificate 📜
              </button>
            </div>

            {/* Calculation Output Card */}
            {calcResult && (
              <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/40 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-emerald-400 text-sm">💰 Remittance Breakdown Summary</span>
                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-500 px-2.5 py-0.5 rounded-full font-bold">
                    {calcResult.nbrSroReference}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-slate-300">
                  <p>Gross Wire Amount: <strong className="text-white font-mono">${calcResult.grossUsd} USD</strong></p>
                  <p>Gross Amount in BDT: <strong className="text-white font-mono">৳{calcResult.grossAmountBdt.toLocaleString()} BDT</strong></p>
                  <p>Wire Gateway Fee: <strong className="text-amber-400 font-mono">-${calcResult.wireFeeUsd} USD (৳{calcResult.wireFeeBdt.toLocaleString()} BDT)</strong></p>
                  <p>NBR TDS Tax Deduction: <strong className="text-emerald-400 font-mono">৳{calcResult.tdsDeductedBdt} BDT ({calcResult.taxRatePercent}%)</strong></p>
                  <p className="col-span-2 text-sm pt-1">Net Bank Deposit (DBBL/BRAC): <strong className="text-emerald-300 font-mono font-bold text-base">৳{calcResult.netPayoutBdt.toLocaleString()} BDT</strong></p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Bangladesh Bank Form C Certificate */}
        {activeTab === "formC" && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-purple-400">Bangladesh Bank Form C Encashment Certificate</h3>
            {!formCCert ? (
              <div className="text-center py-8 text-slate-400 text-xs bg-slate-950/40 rounded-2xl border border-slate-800">
                Click <strong>"Generate Form C Certificate"</strong> under Tab 1 to issue your encashment clearance.
              </div>
            ) : (
              <div className="bg-slate-950 p-5 rounded-2xl border border-purple-500/40 space-y-3 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-purple-400 text-sm">📜 Official Form C Reference: {formCCert.certificateId}</span>
                  <span className="bg-purple-950 text-purple-300 px-2.5 py-0.5 rounded-full font-mono text-[10px]">BB-CLEARED</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-slate-300">
                  <p>Freelancer Name: <strong className="text-white">{formCCert.freelancerName}</strong></p>
                  <p>NID/Passport: <strong className="text-white font-mono">{formCCert.passportOrNid}</strong></p>
                  <p>Encashment Bank: <strong className="text-white">{formCCert.issuingBank}</strong></p>
                  <p>Encashment Amount: <strong className="text-emerald-400 font-mono font-bold">৳{formCCert.remittanceAmountBdt.toLocaleString()} BDT</strong></p>
                  <p>Source Transfer: <strong className="text-white">{formCCert.remittanceSource}</strong></p>
                  <p>BB Clearance Code: <strong className="text-purple-300 font-mono">{formCCert.bangladeshBankCode}</strong></p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Word .docx Client Invoice Generator */}
        {activeTab === "invoice" && (
          <div className="space-y-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800 text-xs">
            <h3 className="text-sm font-semibold text-blue-400">Foreign Client Invoice Generator (.docx Export)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Client Business Name</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Client Country</label>
                <input
                  type="text"
                  value={clientCountry}
                  onChange={(e) => setClientCountry(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-slate-400 mb-1">Service Description</label>
                <input
                  type="text"
                  value={serviceDesc}
                  onChange={(e) => setServiceDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <button
              onClick={handleExportDocx}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs py-2.5 rounded-xl transition-colors"
            >
              📄 Generate & Download Client Word .docx Invoice
            </button>

            {docxInvoice && (
              <div className="bg-slate-900 p-4 rounded-xl border border-blue-500/40 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{docxInvoice.fileName}</p>
                  <p className="text-slate-400 text-[11px]">Invoice Total: ${docxInvoice.amountUsd} USD</p>
                </div>
                <a
                  href={docxInvoice.docxBlobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg font-medium text-xs"
                >
                  Download .docx ⬇️
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
