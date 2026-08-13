import React, { useState } from "react";
import { GovernmentTradeLicenseService, type DomainCheckResult, type TradeLicenseAppResult } from "@/lib/infrastructure/government-trade-license-service";

export interface TradeLicenseDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TradeLicenseDomainModal: React.FC<TradeLicenseDomainModalProps> = ({ isOpen, onClose }) => {
  const [domainQuery, setDomainQuery] = useState("");
  const [domainResults, setDomainResults] = useState<DomainCheckResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [proprietorName, setProprietorName] = useState("");
  const [nidNumber, setNidNumber] = useState("");
  const [cityCorp, setCityCorp] = useState<"DNCC" | "DSCC" | "CCC" | "RCC">("DNCC");
  const [licenseResult, setLicenseResult] = useState<TradeLicenseAppResult | null>(null);
  const [isSubmittingLicense, setIsSubmittingLicense] = useState(false);

  if (!isOpen) return null;

  const handleDomainCheck = async () => {
    if (!domainQuery.trim()) return;
    setIsChecking(true);
    const results = await GovernmentTradeLicenseService.checkDomainAvailability(domainQuery);
    setDomainResults(results);
    setIsChecking(false);
  };

  const handleTradeLicenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !proprietorName) return;

    setIsSubmittingLicense(true);
    const result = await GovernmentTradeLicenseService.applyForTradeLicense({
      businessName,
      proprietorName,
      nidNumber,
      cityCorporation: cityCorp,
      businessAddress: "Dhaka, Bangladesh",
      businessCategory: "Software & E-Commerce",
    });

    setLicenseResult(result);
    setIsSubmittingLicense(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🌐</span> Custom Domain & E-Trade License Engine
            </h2>
            <p className="text-xs text-slate-400">Register .com.bd domains & apply for City Corporation Trade License</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center">✕</button>
        </div>

        {/* Section 1: Domain Registration Check */}
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
            <span>🔎</span> Check Custom Domain Availability
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. polsiastore"
              value={domainQuery}
              onChange={(e) => setDomainQuery(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleDomainCheck}
              disabled={isChecking}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-4 py-2 rounded-xl transition-colors"
            >
              {isChecking ? "Checking..." : "Search"}
            </button>
          </div>

          {domainResults.length > 0 && (
            <div className="grid grid-cols-2 gap-2 pt-2">
              {domainResults.map((d) => (
                <div key={d.domainName} className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono text-white font-semibold">{d.domainName}</span>
                    <span className="block text-[10px] text-slate-400">৳{d.priceBdt} BDT / yr</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${d.available ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-red-950 text-red-400 border border-red-800"}`}>
                    {d.available ? "Available" : "Taken"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: E-Trade License Application */}
        <form onSubmit={handleTradeLicenseSubmit} className="space-y-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <h3 className="text-sm font-semibold text-purple-400 flex items-center gap-1.5">
            <span>🏛️</span> City Corporation E-Trade License Application
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Business Name</label>
              <input
                type="text"
                placeholder="Polsia Tech OPC"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Proprietor Name</label>
              <input
                type="text"
                placeholder="Tanvir Ahmed"
                value={proprietorName}
                onChange={(e) => setProprietorName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">NID Number</label>
              <input
                type="text"
                placeholder="1990123456789"
                value={nidNumber}
                onChange={(e) => setNidNumber(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">City Corporation</label>
              <select
                value={cityCorp}
                onChange={(e) => setCityCorp(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="DNCC">DNCC (Dhaka North)</option>
                <option value="DSCC">DSCC (Dhaka South)</option>
                <option value="CCC">CCC (Chittagong)</option>
                <option value="RCC">RCC (Rajshahi)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmittingLicense}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs py-2.5 rounded-xl transition-colors"
          >
            {isSubmittingLicense ? "Submitting Application..." : "Submit E-Trade License Application (৳4,500 BDT)"}
          </button>

          {licenseResult && (
            <div className="bg-emerald-950/80 border border-emerald-500/50 p-3.5 rounded-xl text-xs space-y-1">
              <div className="flex items-center justify-between text-emerald-400 font-semibold">
                <span>✅ Application Submitted Successfully!</span>
                <span className="font-mono text-[10px]">{licenseResult.applicationId}</span>
              </div>
              <p className="text-slate-300">
                City Corporation: <strong className="text-white">{licenseResult.cityCorporation}</strong> | Fee: <strong className="text-white">৳{licenseResult.feeBdt} BDT</strong>
              </p>
              <a href={licenseResult.pdfFormUrl} target="_blank" rel="noreferrer" className="inline-block text-purple-400 hover:underline text-[11px] font-mono pt-1">
                📄 Download Official PDF Application Form ↗
              </a>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
