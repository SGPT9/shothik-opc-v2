import React, { useState, useEffect } from "react";
import {
  Users,
  DollarSign,
  FileText,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
  Copy,
  Check,
  Printer,
  Download,
  Sparkles,
  X,
  CreditCard,
  Percent,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

interface PayrollTaxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "employee_slips" | "tax_slabs" | "pf_gratuity" | "execute_run";

export type TaxCategory = "general_male" | "female_or_senior" | "specially_abled" | "freedom_fighter";

export type DisbursementChannel = "bkash_payroll" | "nagad_payroll" | "beftn_bank" | "cash_hand";

export interface TaxSlabBreakdownItem {
  slabName: string;
  taxableAmountInSlab: number;
  ratePercent: number;
  taxAmount: number;
}

export interface CalculatedSalaryItem {
  employeeId: string;
  name: string;
  designation: string;
  department: string;
  tinNumber: string;
  grossSalaryBdt: number;
  basicSalaryBdt: number;
  annualTaxableIncomeBdt: number;
  annualTaxLiabilityBdt: number;
  monthlyTaxWithholdingBdt: number;
  employeePfDeductionBdt: number;
  employerPfContributionBdt: number;
  gratuityAccrualBdt: number;
  netPayableSalaryBdt: number;
  disbursementChannel: DisbursementChannel;
  accountOrMfsNumber: string;
  taxSlabs: TaxSlabBreakdownItem[];
}

export interface PayrollRunRecord {
  runId: string;
  monthYear: string;
  totalEmployees: number;
  totalGrossSalariesBdt: number;
  totalNetDisbursedBdt: number;
  totalTaxWithheldBdt: number;
  totalPfTrustAccruedBdt: number;
  totalGratuityReserveBdt: number;
  items: CalculatedSalaryItem[];
  status: "draft" | "approved" | "disbursed";
  disbursedAt?: string;
  verificationHash: string;
  createdAt: string;
}

export interface PayrollSummaryMetrics {
  totalActiveEmployees: number;
  annualGrossPayrollBdt: number;
  annualTaxWithheldBdt: number;
  totalPfTrustFundBdt: number;
  totalGratuityReserveBdt: number;
  totalDisbursedThisMonthBdt: number;
}

const DEFAULT_EMPLOYEES: CalculatedSalaryItem[] = [
  {
    employeeId: "EMP-001",
    name: "Tanvir Hossain",
    designation: "Lead AI System Architect",
    department: "Engineering",
    tinNumber: "789123456789",
    grossSalaryBdt: 130000,
    basicSalaryBdt: 75000,
    annualTaxableIncomeBdt: 1040000,
    annualTaxLiabilityBdt: 71000,
    monthlyTaxWithholdingBdt: 5917,
    employeePfDeductionBdt: 7500,
    employerPfContributionBdt: 7500,
    gratuityAccrualBdt: 6250,
    netPayableSalaryBdt: 116583,
    disbursementChannel: "beftn_bank",
    accountOrMfsNumber: "BRAC-150120499120",
    taxSlabs: [
      { slabName: "First ৳3,50,000 (Exempt)", taxableAmountInSlab: 350000, ratePercent: 0, taxAmount: 0 },
      { slabName: "Next ৳1,00,000 (5%)", taxableAmountInSlab: 100000, ratePercent: 5, taxAmount: 5000 },
      { slabName: "Next ৳3,00,000 (10%)", taxableAmountInSlab: 300000, ratePercent: 10, taxAmount: 30000 },
      { slabName: "Next ৳4,00,000 (15%)", taxableAmountInSlab: 290000, ratePercent: 15, taxAmount: 43500 },
    ],
  },
  {
    employeeId: "EMP-002",
    name: "Nusrat Jahan",
    designation: "Senior Product Designer",
    department: "Product & UX",
    tinNumber: "456123789012",
    grossSalaryBdt: 95000,
    basicSalaryBdt: 55000,
    annualTaxableIncomeBdt: 760000,
    annualTaxLiabilityBdt: 39000,
    monthlyTaxWithholdingBdt: 3250,
    employeePfDeductionBdt: 5500,
    employerPfContributionBdt: 5500,
    gratuityAccrualBdt: 4583,
    netPayableSalaryBdt: 86250,
    disbursementChannel: "bkash_payroll",
    accountOrMfsNumber: "01712345678",
    taxSlabs: [
      { slabName: "First ৳4,00,000 (Female Exempt)", taxableAmountInSlab: 400000, ratePercent: 0, taxAmount: 0 },
      { slabName: "Next ৳1,00,000 (5%)", taxableAmountInSlab: 100000, ratePercent: 5, taxAmount: 5000 },
      { slabName: "Next ৳3,00,000 (10%)", taxableAmountInSlab: 260000, ratePercent: 10, taxAmount: 26000 },
    ],
  },
  {
    employeeId: "EMP-003",
    name: "Rahim Uddin",
    designation: "Logistics Field Operations Lead",
    department: "Operations",
    tinNumber: "321654987012",
    grossSalaryBdt: 42000,
    basicSalaryBdt: 25000,
    annualTaxableIncomeBdt: 336000,
    annualTaxLiabilityBdt: 0,
    monthlyTaxWithholdingBdt: 0,
    employeePfDeductionBdt: 2500,
    employerPfContributionBdt: 2500,
    gratuityAccrualBdt: 2083,
    netPayableSalaryBdt: 39500,
    disbursementChannel: "nagad_payroll",
    accountOrMfsNumber: "01898765432",
    taxSlabs: [
      { slabName: "First ৳3,50,000 (Exempt)", taxableAmountInSlab: 336000, ratePercent: 0, taxAmount: 0 },
    ],
  },
];

const DEFAULT_SUMMARY: PayrollSummaryMetrics = {
  totalActiveEmployees: 3,
  annualGrossPayrollBdt: 3204000,
  annualTaxWithheldBdt: 110004,
  totalPfTrustFundBdt: 372000,
  totalGratuityReserveBdt: 155000,
  totalDisbursedThisMonthBdt: 242333,
};

export const PayrollTaxModal: React.FC<PayrollTaxModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("employee_slips");
  const [employees, setEmployees] = useState<CalculatedSalaryItem[]>(DEFAULT_EMPLOYEES);
  const [summary, setSummary] = useState<PayrollSummaryMetrics | null>(DEFAULT_SUMMARY);
  const [selectedEmployee, setSelectedEmployee] = useState<CalculatedSalaryItem>(DEFAULT_EMPLOYEES[0]);
  const [selectedMonth, setSelectedMonth] = useState("2026-09");
  const [isExecuting, setIsExecuting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    fetchData();
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const sumRes = await fetch("/api/v1/payroll/summary");
      if (sumRes.ok) {
        const sData = await sumRes.json();
        if (sData.ok) setSummary(sData.data);
      }

      const empRes = await fetch("/api/v1/payroll/employees");
      if (empRes.ok) {
        const eData = await empRes.json();
        if (eData.ok && eData.data.length > 0) {
          // If profiles returned, calculate
        }
      }
    } catch {
      // Retain defaults
    }
  };

  const handleRunPayroll = async () => {
    setIsExecuting(true);
    try {
      const res = await fetch("/api/v1/payroll/execute-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthYear: selectedMonth }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          setActiveTab("employee_slips");
        }
      }
    } catch {
      setActiveTab("employee_slips");
    } finally {
      setIsExecuting(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="SME Payroll Tax & Statutory Benefits Engine"
    >
      <div className="relative flex flex-col w-full max-w-6xl h-[90vh] bg-[#0B0F17] border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B] bg-[#0F172A]/70">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-700 shadow-lg shadow-violet-500/20">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  SME Payroll Tax & Statutory Benefits Engine
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full">
                  Income Tax Act 2023 & Labour Act 2006
                </span>
              </div>
              <p className="text-xs text-slate-400">
                স্বয়ংক্রিয় বেতন কর কর্তন (উৎসে কর TDS), প্রভিডেন্ট ফান্ড, গ্র্যাচুইটি ও বিকাশ/ব্যাংক পেরোল ডিসবার্সমেন্ট
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/80 border border-slate-700/60 rounded-md text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> NBR TDS Section 86
              </span>
              <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-900/80 border border-slate-700/60 rounded-md text-violet-300">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" /> RPF Trust Fund
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 py-3 bg-[#0B0F17]/90 border-b border-[#1E293B]">
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Monthly Gross Payroll</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-white">
                ৳{((summary?.annualGrossPayrollBdt ?? 3204000) / 12).toLocaleString("en-BD")}
              </span>
              <span className="text-[11px] text-slate-400">
                ({employees.length} staff)
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Net Disbursed Take-Home</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-emerald-400">
                ৳{(summary?.totalDisbursedThisMonthBdt ?? 242333).toLocaleString("en-BD")}
              </span>
              <span className="text-[11px] text-emerald-500/80">Monthly</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">NBR TDS Tax Withheld</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-rose-400">
                ৳{Math.round((summary?.annualTaxWithheldBdt ?? 110004) / 12).toLocaleString("en-BD")}
              </span>
              <span className="text-[11px] text-rose-400/80">Challan Deposit</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">PF Trust Fund Reserve</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-bold text-violet-400">
                ৳{(summary?.totalPfTrustFundBdt ?? 372000).toLocaleString("en-BD")}
              </span>
              <span className="text-[11px] text-violet-400/80">Cumulative</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2 border-b border-[#1E293B] bg-[#0F172A]/40">
          <button
            onClick={() => setActiveTab("employee_slips")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "employee_slips"
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Employee Salary Slips ({employees.length})
          </button>

          <button
            onClick={() => setActiveTab("tax_slabs")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "tax_slabs"
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Income Tax Act 2023 Slabs
          </button>

          <button
            onClick={() => setActiveTab("pf_gratuity")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "pf_gratuity"
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Provident Fund & Gratuity
          </button>

          <button
            onClick={() => setActiveTab("execute_run")}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === "execute_run"
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/30 shadow-sm"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            Monthly Payroll Run & MFS Batch
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#070A0F]">
          {/* TAB 1: Employee Slips */}
          {activeTab === "employee_slips" && (
            <div className="space-y-3">
              {employees.map((emp) => (
                <div
                  key={emp.employeeId}
                  className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-slate-700 transition-all flex items-center justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400 font-bold text-xs">
                      {emp.employeeId}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">
                          {emp.name}
                        </span>
                        <span className="text-xs text-slate-400">
                          ({emp.designation} • {emp.department})
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        TIN: {emp.tinNumber} • Channel: {emp.disbursementChannel.replace("_", " ").toUpperCase()} ({emp.accountOrMfsNumber})
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Basic: ৳{emp.basicSalaryBdt.toLocaleString("en-BD")} • PF (10%): ৳{emp.employeePfDeductionBdt} • Monthly TDS: ৳{emp.monthlyTaxWithholdingBdt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-sm font-bold text-emerald-400">
                        ৳{emp.netPayableSalaryBdt.toLocaleString("en-BD")}
                      </span>
                      <p className="text-[11px] text-slate-400">
                        Gross: ৳{emp.grossSalaryBdt.toLocaleString("en-BD")}
                      </p>
                      <span className="inline-block mt-1 text-[11px] font-mono text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded">
                        Annual Tax: ৳{emp.annualTaxLiabilityBdt.toLocaleString("en-BD")}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setActiveTab("tax_slabs");
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-all"
                    >
                      Tax Breakdown
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: Tax Slabs */}
          {activeTab === "tax_slabs" && (
            <div className="max-w-4xl mx-auto space-y-5">
              <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-violet-400 text-sm font-bold">
                  <FileText className="w-4 h-4" />
                  Income Tax Act 2023 Progressive Slabs Breakdown for {selectedEmployee.name}
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Gross Annual Salary: ৳{(selectedEmployee.grossSalaryBdt * 12).toLocaleString("en-BD")} | Taxable Income: ৳{selectedEmployee.annualTaxableIncomeBdt.toLocaleString("en-BD")}
                </p>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-300 font-semibold border-b border-slate-700">
                    <tr>
                      <th className="p-3">Statutory Income Slab</th>
                      <th className="p-3 text-right">Taxable Amount (BDT)</th>
                      <th className="p-3 text-right">Tax Rate (%)</th>
                      <th className="p-3 text-right">Computed Tax (BDT)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {selectedEmployee.taxSlabs.map((slab, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="p-3 text-white font-medium">{slab.slabName}</td>
                        <td className="p-3 text-right font-mono">৳{slab.taxableAmountInSlab.toLocaleString("en-BD")}</td>
                        <td className="p-3 text-right font-mono text-violet-400">{slab.ratePercent}%</td>
                        <td className="p-3 text-right font-mono font-bold text-white">৳{slab.taxAmount.toLocaleString("en-BD")}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-900/80 font-bold border-t border-slate-700">
                      <td colSpan={3} className="p-3 text-right text-slate-300">Total Annual Tax Liability:</td>
                      <td className="p-3 text-right font-mono text-rose-400">৳{selectedEmployee.annualTaxLiabilityBdt.toLocaleString("en-BD")}</td>
                    </tr>
                    <tr className="bg-slate-900/80 font-bold">
                      <td colSpan={3} className="p-3 text-right text-slate-300">Monthly TDS Deduction (Salary):</td>
                      <td className="p-3 text-right font-mono text-amber-400">৳{selectedEmployee.monthlyTaxWithholdingBdt.toLocaleString("en-BD")} / mo</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PF & Gratuity */}
          {activeTab === "pf_gratuity" && (
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-violet-400 text-sm font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  Statutory Benefits Ledger (Labour Act 2006)
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  10% matching Provident Fund contribution by employer and monthly Gratuity reserve amortization.
                </p>
              </div>

              <div className="space-y-3">
                {employees.map((emp) => (
                  <div key={emp.employeeId} className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white text-sm">{emp.name}</span>
                      <p className="text-xs text-slate-400 mt-0.5">Basic: ৳{emp.basicSalaryBdt.toLocaleString("en-BD")}</p>
                    </div>

                    <div className="flex items-center gap-6 text-xs font-mono">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Employee PF (10%)</span>
                        <span className="text-violet-400 font-bold">৳{emp.employeePfDeductionBdt}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Employer PF (10%)</span>
                        <span className="text-violet-400 font-bold">৳{emp.employerPfContributionBdt}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Gratuity / Mo</span>
                        <span className="text-emerald-400 font-bold">৳{emp.gratuityAccrualBdt}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Execute Run */}
          {activeTab === "execute_run" && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Select Payroll Month</span>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-white rounded-lg p-2 font-mono"
                  />
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-slate-300">
                  <div className="flex justify-between">
                    <span>Total Eligible Staff:</span>
                    <span className="font-mono text-white font-bold">{employees.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Gross Salaries:</span>
                    <span className="font-mono text-white font-bold">৳{employees.reduce((acc, it) => acc + it.grossSalaryBdt, 0).toLocaleString("en-BD")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Net Disbursed:</span>
                    <span className="font-mono text-emerald-400 font-bold">৳{employees.reduce((acc, it) => acc + it.netPayableSalaryBdt, 0).toLocaleString("en-BD")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total NBR TDS Withholding:</span>
                    <span className="font-mono text-rose-400 font-bold">৳{employees.reduce((acc, it) => acc + it.monthlyTaxWithholdingBdt, 0).toLocaleString("en-BD")}</span>
                  </div>
                </div>

                <button
                  onClick={handleRunPayroll}
                  disabled={isExecuting}
                  className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/20 transition-all text-xs flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  {isExecuting ? "Executing Payroll & MFS Batches..." : `Execute & Disburse ${selectedMonth} Payroll`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayrollTaxModal;
