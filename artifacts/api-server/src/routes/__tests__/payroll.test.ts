import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import app from '../../app.js';
import {
  smePayrollEngine,
  SmePayrollEngine,
} from '../../lib/payroll/sme-payroll-engine.js';

describe('SME Payroll Tax & Statutory Benefits API (/api/v1/payroll/*)', () => {
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    smePayrollEngine.resetStore();
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterEach(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('SmePayrollEngine Unit Logic', () => {
    it('calculates progressive personal income tax under Income Tax Act 2023 with male vs female thresholds', () => {
      const engine = new SmePayrollEngine();

      // Male earning 12,00,000 BDT gross annually
      const maleTax = engine.calculatePersonalIncomeTax(1200000, 600000, 'general_male', 'dhaka_chittagong');
      expect(maleTax.annualTaxableIncome).toBe(800000); // 12,00,000 - 4,00,000 (1/3rd standard deduction)
      expect(maleTax.annualTax).toBeGreaterThan(0);
      expect(maleTax.monthlyTds).toBe(Math.round(maleTax.annualTax / 12));

      // Female earning same amount gets ৳4,00,000 tax-free slab (paying less tax than male)
      const femaleTax = engine.calculatePersonalIncomeTax(1200000, 600000, 'female_or_senior', 'dhaka_chittagong');
      expect(femaleTax.annualTax).toBeLessThan(maleTax.annualTax);
    });

    it('enforces Dhaka City Corporation minimum tax of ৳5,000 when taxable income exceeds threshold', () => {
      const engine = new SmePayrollEngine();
      // Low taxable income just above threshold (e.g. 5,40,000 gross -> 3,60,000 taxable > 3,50,000)
      const tax = engine.calculatePersonalIncomeTax(540000, 300000, 'general_male', 'dhaka_chittagong');
      expect(tax.annualTax).toBe(5000); // minimum tax floor
    });

    it('calculates 10% PF contribution and monthly gratuity accrual', () => {
      const engine = new SmePayrollEngine();
      const calculated = engine.calculateEmployeePayroll({
        employeeId: 'EMP-T1',
        name: 'Arif Hasan',
        banglaName: 'আরিফ হাসান',
        designation: 'Senior Developer',
        department: 'Tech',
        taxCategory: 'general_male',
        location: 'dhaka_chittagong',
        disbursementChannel: 'bkash_payroll',
        accountOrMfsNumber: '01711000000',
        basicSalaryBdt: 60000,
        houseRentBdt: 30000,
        medicalAllowanceBdt: 6000,
        conveyanceAllowanceBdt: 4000,
        specialAllowanceBdt: 0,
        grossMonthlySalaryBdt: 100000,
        pfContributionPercent: 10,
      });

      expect(calculated.employeePfDeductionBdt).toBe(6000); // 10% of 60k
      expect(calculated.employerPfContributionBdt).toBe(6000);
      expect(calculated.gratuityAccrualBdt).toBe(5000); // 60k / 12
      expect(calculated.netPayableSalaryBdt).toBeLessThan(100000);
    });

    it('executes monthly payroll run and generates cryptographically signed run record', () => {
      const engine = new SmePayrollEngine();
      const run = engine.executePayrollRun('2026-09', [
        {
          employeeId: 'EMP-RUN-1',
          name: 'Staff One',
          banglaName: 'স্টাফ ১',
          designation: 'Dev',
          department: 'IT',
          taxCategory: 'general_male',
          location: 'dhaka_chittagong',
          disbursementChannel: 'beftn_bank',
          accountOrMfsNumber: '123456',
          basicSalaryBdt: 50000,
          houseRentBdt: 25000,
          medicalAllowanceBdt: 5000,
          conveyanceAllowanceBdt: 0,
          specialAllowanceBdt: 0,
          grossMonthlySalaryBdt: 80000,
          pfContributionPercent: 10,
        },
      ]);

      expect(run.runId).toContain('PAY-202609-');
      expect(run.totalEmployees).toBe(1);
      expect(run.totalGrossSalariesBdt).toBe(80000);
      expect(run.status).toBe('approved');
      expect(run.verificationHash.length).toBe(64);
    });
  });

  describe('HTTP REST Endpoints', () => {
    it('POST /api/v1/payroll/calculate computes salary breakdown via API', async () => {
      const payload = {
        employeeId: 'EMP-API-1',
        name: 'Farhana Akter',
        banglaName: 'ফারহানা আক্তার',
        designation: 'UX Lead',
        department: 'Design',
        taxCategory: 'female_or_senior',
        location: 'dhaka_chittagong',
        disbursementChannel: 'bkash_payroll',
        accountOrMfsNumber: '01912345678',
        basicSalaryBdt: 50000,
        houseRentBdt: 25000,
        medicalAllowanceBdt: 5000,
        conveyanceAllowanceBdt: 5000,
        specialAllowanceBdt: 0,
        grossMonthlySalaryBdt: 85000,
        pfContributionPercent: 10,
      };

      const res = await fetch(`${baseUrl}/api/v1/payroll/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.data.employeePfDeductionBdt).toBe(5000);
      expect(data.data.netPayableSalaryBdt).toBeDefined();
    });

    it('POST /api/v1/payroll/execute-run runs monthly disbursement', async () => {
      const res = await fetch(`${baseUrl}/api/v1/payroll/execute-run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthYear: '2026-09',
          employees: [
            {
              employeeId: 'EMP-DISB-1',
              name: 'Kabir Ahmed',
              banglaName: 'কবির আহমেদ',
              designation: 'Accountant',
              department: 'Finance',
              taxCategory: 'general_male',
              location: 'dhaka_chittagong',
              disbursementChannel: 'beftn_bank',
              accountOrMfsNumber: '99887766',
              basicSalaryBdt: 40000,
              houseRentBdt: 20000,
              medicalAllowanceBdt: 4000,
              conveyanceAllowanceBdt: 2000,
              specialAllowanceBdt: 0,
              grossMonthlySalaryBdt: 66000,
              pfContributionPercent: 10,
            },
          ],
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.data.totalEmployees).toBe(1);
    });

    it('GET /api/v1/payroll/runs returns historical runs', async () => {
      const res = await fetch(`${baseUrl}/api/v1/payroll/runs`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.data).toBeDefined();
    });

    it('GET /api/v1/payroll/summary returns aggregate payroll liabilities', async () => {
      const res = await fetch(`${baseUrl}/api/v1/payroll/summary`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.ok).toBe(true);
      expect(data.data.annualGrossPayrollBdt).toBeDefined();
    });
  });
});
