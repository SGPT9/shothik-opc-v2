import crypto from 'crypto';

export type TaxCategory = 'general_male' | 'female_or_senior' | 'specially_abled' | 'freedom_fighter';

export type CityCorporationLocation = 'dhaka_chittagong' | 'other_city_corporation' | 'non_city_corporation';

export type DisbursementChannel = 'bkash_payroll' | 'nagad_payroll' | 'beftn_bank' | 'cash_hand';

export interface EmployeeSalaryProfile {
  employeeId: string;
  name: string;
  banglaName: string;
  designation: string;
  department: string;
  tinNumber?: string;
  taxCategory: TaxCategory;
  location: CityCorporationLocation;
  disbursementChannel: DisbursementChannel;
  accountOrMfsNumber: string;
  basicSalaryBdt: number;
  houseRentBdt: number;
  medicalAllowanceBdt: number;
  conveyanceAllowanceBdt: number;
  specialAllowanceBdt: number;
  grossMonthlySalaryBdt: number;
  pfContributionPercent: number; // typically 10%
  yearsOfService?: number;
}

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
  status: 'draft' | 'approved' | 'disbursed';
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

export class SmePayrollEngine {
  private employees: Map<string, EmployeeSalaryProfile> = new Map();
  private runs: Map<string, PayrollRunRecord> = new Map();

  constructor() {
    this.seedDefaultEmployees();
  }

  /**
   * Calculates progressive personal income tax under Bangladesh Income Tax Act 2023
   */
  public calculatePersonalIncomeTax(
    annualGross: number,
    annualBasic: number,
    category: TaxCategory = 'general_male',
    location: CityCorporationLocation = 'dhaka_chittagong'
  ): {
    annualTaxableIncome: number;
    annualTax: number;
    monthlyTds: number;
    taxSlabsBreakdown: TaxSlabBreakdownItem[];
  } {
    // Under Income Tax Act 2023, standard tax exemptions:
    // House Rent: max exempt is 50% of basic or 300,000 BDT (lesser)
    // Medical Allowance: max exempt is 10% of basic or 120,000 BDT (lesser)
    // Conveyance: max exempt is 30,000 BDT
    // Simplified standard exemption of 1/3 of total salary or 4,50,000 BDT (whichever is lower)
    const standardExemption = Math.min(annualGross * (1 / 3), 450000);
    const annualTaxableIncome = Math.max(0, Math.round(annualGross - standardExemption));

    // Thresholds
    let threshold = 350000;
    if (category === 'female_or_senior') threshold = 400000;
    else if (category === 'specially_abled') threshold = 475000;
    else if (category === 'freedom_fighter') threshold = 500000;

    let remaining = annualTaxableIncome;
    let computedTax = 0;
    const taxSlabsBreakdown: TaxSlabBreakdownItem[] = [];

    // Slab 1: Tax-Exempt Tier (0%)
    const slab1Amount = Math.min(remaining, threshold);
    taxSlabsBreakdown.push({
      slabName: `First ৳${threshold.toLocaleString('en-BD')} (Exempt)`,
      taxableAmountInSlab: slab1Amount,
      ratePercent: 0,
      taxAmount: 0,
    });
    remaining -= slab1Amount;

    // Slab 2: Next ৳100,000 (5%)
    if (remaining > 0) {
      const slab2Amount = Math.min(remaining, 100000);
      const slabTax = (slab2Amount * 5) / 100;
      taxSlabsBreakdown.push({
        slabName: 'Next ৳1,00,000 (5%)',
        taxableAmountInSlab: slab2Amount,
        ratePercent: 5,
        taxAmount: slabTax,
      });
      computedTax += slabTax;
      remaining -= slab2Amount;
    }

    // Slab 3: Next ৳300,000 (10%)
    if (remaining > 0) {
      const slab3Amount = Math.min(remaining, 300000);
      const slabTax = (slab3Amount * 10) / 100;
      taxSlabsBreakdown.push({
        slabName: 'Next ৳3,00,000 (10%)',
        taxableAmountInSlab: slab3Amount,
        ratePercent: 10,
        taxAmount: slabTax,
      });
      computedTax += slabTax;
      remaining -= slab3Amount;
    }

    // Slab 4: Next ৳400,000 (15%)
    if (remaining > 0) {
      const slab4Amount = Math.min(remaining, 400000);
      const slabTax = (slab4Amount * 15) / 100;
      taxSlabsBreakdown.push({
        slabName: 'Next ৳4,00,000 (15%)',
        taxableAmountInSlab: slab4Amount,
        ratePercent: 15,
        taxAmount: slabTax,
      });
      computedTax += slabTax;
      remaining -= slab4Amount;
    }

    // Slab 5: Next ৳500,000 (20%)
    if (remaining > 0) {
      const slab5Amount = Math.min(remaining, 500000);
      const slabTax = (slab5Amount * 20) / 100;
      taxSlabsBreakdown.push({
        slabName: 'Next ৳5,00,000 (20%)',
        taxableAmountInSlab: slab5Amount,
        ratePercent: 20,
        taxAmount: slabTax,
      });
      computedTax += slabTax;
      remaining -= slab5Amount;
    }

    // Slab 6: Balance remaining (25%)
    if (remaining > 0) {
      const slabTax = (remaining * 25) / 100;
      taxSlabsBreakdown.push({
        slabName: 'Remaining Balance (25%)',
        taxableAmountInSlab: remaining,
        ratePercent: 25,
        taxAmount: slabTax,
      });
      computedTax += slabTax;
      remaining = 0;
    }

    // Minimum Tax Rule under NBR guidelines if taxable income exceeds threshold
    let minimumTax = 5000;
    if (location === 'other_city_corporation') minimumTax = 4000;
    else if (location === 'non_city_corporation') minimumTax = 3000;

    let finalAnnualTax = computedTax;
    if (annualTaxableIncome > threshold && finalAnnualTax < minimumTax) {
      finalAnnualTax = minimumTax;
    } else if (annualTaxableIncome <= threshold) {
      finalAnnualTax = 0;
    }

    finalAnnualTax = Math.round(finalAnnualTax);
    const monthlyTds = Math.round(finalAnnualTax / 12);

    return {
      annualTaxableIncome,
      annualTax: finalAnnualTax,
      monthlyTds,
      taxSlabsBreakdown,
    };
  }

  /**
   * Computes comprehensive salary breakdown for an individual employee
   */
  public calculateEmployeePayroll(profile: EmployeeSalaryProfile): CalculatedSalaryItem {
    const gross =
      profile.grossMonthlySalaryBdt ||
      profile.basicSalaryBdt +
        profile.houseRentBdt +
        profile.medicalAllowanceBdt +
        profile.conveyanceAllowanceBdt +
        profile.specialAllowanceBdt;

    const annualGross = gross * 12;
    const annualBasic = profile.basicSalaryBdt * 12;

    const taxResult = this.calculatePersonalIncomeTax(
      annualGross,
      annualBasic,
      profile.taxCategory,
      profile.location
    );

    // Provident Fund: 10% of basic
    const pfRate = profile.pfContributionPercent || 10;
    const employeePfDeductionBdt = Math.round((profile.basicSalaryBdt * pfRate) / 100);
    const employerPfContributionBdt = employeePfDeductionBdt; // Matching

    // Gratuity Liability Accrual: 30 days basic per year = basic / 12 per month
    const gratuityAccrualBdt = Math.round(profile.basicSalaryBdt / 12);

    // Net Payable: Gross - Monthly TDS - Employee PF
    const netPayableSalaryBdt = Math.round(gross - taxResult.monthlyTds - employeePfDeductionBdt);

    return {
      employeeId: profile.employeeId,
      name: profile.name,
      designation: profile.designation,
      department: profile.department,
      tinNumber: profile.tinNumber || '123456789012',
      grossSalaryBdt: gross,
      basicSalaryBdt: profile.basicSalaryBdt,
      annualTaxableIncomeBdt: taxResult.annualTaxableIncome,
      annualTaxLiabilityBdt: taxResult.annualTax,
      monthlyTaxWithholdingBdt: taxResult.monthlyTds,
      employeePfDeductionBdt,
      employerPfContributionBdt,
      gratuityAccrualBdt,
      netPayableSalaryBdt,
      disbursementChannel: profile.disbursementChannel,
      accountOrMfsNumber: profile.accountOrMfsNumber,
      taxSlabs: taxResult.taxSlabsBreakdown,
    };
  }

  /**
   * Executes a monthly payroll run across all registered staff
   */
  public executePayrollRun(monthYear: string, employeeList?: EmployeeSalaryProfile[]): PayrollRunRecord {
    const list = employeeList || Array.from(this.employees.values());
    const items: CalculatedSalaryItem[] = list.map((emp) => this.calculateEmployeePayroll(emp));

    const totalGrossSalariesBdt = items.reduce((acc, it) => acc + it.grossSalaryBdt, 0);
    const totalNetDisbursedBdt = items.reduce((acc, it) => acc + it.netPayableSalaryBdt, 0);
    const totalTaxWithheldBdt = items.reduce((acc, it) => acc + it.monthlyTaxWithholdingBdt, 0);
    const totalPfTrustAccruedBdt = items.reduce(
      (acc, it) => acc + it.employeePfDeductionBdt + it.employerPfContributionBdt,
      0
    );
    const totalGratuityReserveBdt = items.reduce((acc, it) => acc + it.gratuityAccrualBdt, 0);

    const runId = `PAY-${monthYear.replace('-', '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const verificationHash = crypto
      .createHash('sha256')
      .update(`${runId}:${monthYear}:${totalGrossSalariesBdt}:${totalNetDisbursedBdt}`)
      .digest('hex');

    const record: PayrollRunRecord = {
      runId,
      monthYear,
      totalEmployees: items.length,
      totalGrossSalariesBdt,
      totalNetDisbursedBdt,
      totalTaxWithheldBdt,
      totalPfTrustAccruedBdt,
      totalGratuityReserveBdt,
      items,
      status: 'approved',
      disbursedAt: new Date().toISOString(),
      verificationHash,
      createdAt: new Date().toISOString(),
    };

    this.runs.set(runId, record);
    return record;
  }

  /**
   * Generates NBR Form of Certificate of Tax Deduction at Source from Salary
   */
  public generateWithholdingCertificate(employeeId: string, taxYear: string = '2026-2027'): any {
    const employee = this.employees.get(employeeId);
    if (!employee) {
      throw new Error(`Employee #${employeeId} not found.`);
    }

    const calculated = this.calculateEmployeePayroll(employee);

    return {
      certificateNumber: `NBR-TDS-SAL-${taxYear}-${employee.employeeId}`,
      taxYear,
      employerName: 'Shothik Tech & Enterprise Solutions Ltd.',
      employerBin: '001234567-0101',
      employerTin: '112233445566',
      employeeName: employee.name,
      employeeBanglaName: employee.banglaName,
      employeeDesignation: employee.designation,
      employeeTin: employee.tinNumber || '987654321012',
      annualGrossSalaryBdt: calculated.grossSalaryBdt * 12,
      annualTaxableIncomeBdt: calculated.annualTaxableIncomeBdt,
      totalTdsDeductedBdt: calculated.annualTaxLiabilityBdt,
      challanVerificationCode: `TR-CHALLAN-NBR-${Date.now().toString().slice(-8)}`,
      issueDate: new Date().toISOString().split('T')[0],
      statutoryDeclarationBangla: `এতদ্বারা প্রত্যয়ন করা যাইতেছে যে, আয়কর আইন ২০২৩-এর ধারা ৮৬ অনুযায়ী উপরোল্লিখিত করদাতার বেতন হইতে উৎসে কর বাবদ মোট ৳${calculated.annualTaxLiabilityBdt.toLocaleString('en-BD')} টাকা বিধি মোতাবেক কর্তনপূর্বক সরকারি ট্রেজারিতে জমা প্রদান করা হইয়াছে।`,
    };
  }

  /**
   * Aggregates organization payroll & statutory reserve liabilities
   */
  public getSummaryMetrics(): PayrollSummaryMetrics {
    let totalGrossMonthly = 0;
    let totalNetMonthly = 0;
    let totalTdsMonthly = 0;
    let totalPfMonthly = 0;
    let totalGratuityMonthly = 0;

    for (const emp of this.employees.values()) {
      const calc = this.calculateEmployeePayroll(emp);
      totalGrossMonthly += calc.grossSalaryBdt;
      totalNetMonthly += calc.netPayableSalaryBdt;
      totalTdsMonthly += calc.monthlyTaxWithholdingBdt;
      totalPfMonthly += calc.employeePfDeductionBdt + calc.employerPfContributionBdt;
      totalGratuityMonthly += calc.gratuityAccrualBdt;
    }

    return {
      totalActiveEmployees: this.employees.size,
      annualGrossPayrollBdt: totalGrossMonthly * 12,
      annualTaxWithheldBdt: totalTdsMonthly * 12,
      totalPfTrustFundBdt: totalPfMonthly * 12, // Cumulative yearly projection
      totalGratuityReserveBdt: totalGratuityMonthly * 12,
      totalDisbursedThisMonthBdt: totalNetMonthly,
    };
  }

  public listEmployees(): EmployeeSalaryProfile[] {
    return Array.from(this.employees.values());
  }

  public getEmployeeById(id: string): EmployeeSalaryProfile | undefined {
    return this.employees.get(id);
  }

  public listPayrollRuns(): PayrollRunRecord[] {
    return Array.from(this.runs.values());
  }

  public resetStore(): void {
    this.employees.clear();
    this.runs.clear();
  }

  private seedDefaultEmployees(): void {
    const emp1: EmployeeSalaryProfile = {
      employeeId: 'EMP-001',
      name: 'Tanvir Hossain',
      banglaName: 'তানভীর হোসেন',
      designation: 'Lead AI System Architect',
      department: 'Engineering',
      tinNumber: '789123456789',
      taxCategory: 'general_male',
      location: 'dhaka_chittagong',
      disbursementChannel: 'beftn_bank',
      accountOrMfsNumber: 'BRAC-150120499120',
      basicSalaryBdt: 75000,
      houseRentBdt: 37500,
      medicalAllowanceBdt: 7500,
      conveyanceAllowanceBdt: 5000,
      specialAllowanceBdt: 5000,
      grossMonthlySalaryBdt: 130000,
      pfContributionPercent: 10,
      yearsOfService: 3,
    };

    const emp2: EmployeeSalaryProfile = {
      employeeId: 'EMP-002',
      name: 'Nusrat Jahan',
      banglaName: 'নুসরাত জাহান',
      designation: 'Senior Product Designer',
      department: 'Product & UX',
      tinNumber: '456123789012',
      taxCategory: 'female_or_senior',
      location: 'dhaka_chittagong',
      disbursementChannel: 'bkash_payroll',
      accountOrMfsNumber: '01712345678',
      basicSalaryBdt: 55000,
      houseRentBdt: 27500,
      medicalAllowanceBdt: 5500,
      conveyanceAllowanceBdt: 4000,
      specialAllowanceBdt: 3000,
      grossMonthlySalaryBdt: 95000,
      pfContributionPercent: 10,
      yearsOfService: 2,
    };

    const emp3: EmployeeSalaryProfile = {
      employeeId: 'EMP-003',
      name: 'Rahim Uddin',
      banglaName: 'রহিম উদ্দিন',
      designation: 'Logistics Field Operations Lead',
      department: 'Operations',
      tinNumber: '321654987012',
      taxCategory: 'general_male',
      location: 'other_city_corporation',
      disbursementChannel: 'nagad_payroll',
      accountOrMfsNumber: '01898765432',
      basicSalaryBdt: 25000,
      houseRentBdt: 12500,
      medicalAllowanceBdt: 2500,
      conveyanceAllowanceBdt: 2000,
      specialAllowanceBdt: 0,
      grossMonthlySalaryBdt: 42000,
      pfContributionPercent: 10,
      yearsOfService: 1,
    };

    this.employees.set(emp1.employeeId, emp1);
    this.employees.set(emp2.employeeId, emp2);
    this.employees.set(emp3.employeeId, emp3);

    this.executePayrollRun('2026-08', [emp1, emp2, emp3]);
  }
}

export const smePayrollEngine = new SmePayrollEngine();
