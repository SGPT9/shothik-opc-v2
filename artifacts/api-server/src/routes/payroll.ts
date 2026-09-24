import { Router, Request, Response } from 'express';
import {
  smePayrollEngine,
  EmployeeSalaryProfile,
} from '../lib/payroll/sme-payroll-engine.js';

export const payrollRouter = Router();

/**
 * POST /api/v1/payroll/calculate
 * Computes progressive tax (Income Tax Act 2023), PF, and net salary for employee profile
 */
payrollRouter.post('/v1/payroll/calculate', (req: Request, res: Response) => {
  try {
    const profile: EmployeeSalaryProfile = req.body;
    if (!profile || !profile.employeeId || !profile.basicSalaryBdt) {
      return res.status(400).json({
        ok: false,
        error: 'employeeId and basicSalaryBdt are required.',
      });
    }

    const calculated = smePayrollEngine.calculateEmployeePayroll(profile);

    return res.status(200).json({
      ok: true,
      data: calculated,
      message: `Payroll calculation completed for ${profile.name} under Income Tax Act 2023.`,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Failed to calculate employee payroll.',
    });
  }
});

/**
 * POST /api/v1/payroll/execute-run
 * Executes monthly payroll run across registered staff with MFS & bank batches
 */
payrollRouter.post('/v1/payroll/execute-run', (req: Request, res: Response) => {
  try {
    const { monthYear = new Date().toISOString().slice(0, 7), employees } = req.body || {};
    const run = smePayrollEngine.executePayrollRun(monthYear, employees);

    return res.status(200).json({
      ok: true,
      data: run,
      message: `Payroll run #${run.runId} executed for ${monthYear} (${run.totalEmployees} employees).`,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Failed to execute payroll run.',
    });
  }
});

/**
 * GET /api/v1/payroll/runs
 * Lists historical monthly payroll runs
 */
payrollRouter.get('/v1/payroll/runs', (_req: Request, res: Response) => {
  try {
    const runs = smePayrollEngine.listPayrollRuns();
    return res.status(200).json({
      ok: true,
      data: runs,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Failed to retrieve payroll runs.',
    });
  }
});

/**
 * GET /api/v1/payroll/employees
 * Lists all registered employee salary profiles
 */
payrollRouter.get('/v1/payroll/employees', (_req: Request, res: Response) => {
  try {
    const employees = smePayrollEngine.listEmployees();
    return res.status(200).json({
      ok: true,
      data: employees,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Failed to retrieve employee roster.',
    });
  }
});

/**
 * GET /api/v1/payroll/summary
 * Retrieves annual gross payroll, TDS withheld, PF trust fund, and gratuity liability
 */
payrollRouter.get('/v1/payroll/summary', (_req: Request, res: Response) => {
  try {
    const summary = smePayrollEngine.getSummaryMetrics();
    return res.status(200).json({
      ok: true,
      data: summary,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Failed to retrieve payroll summary metrics.',
    });
  }
});

/**
 * GET /api/v1/payroll/certificate/:employeeId
 * Generates NBR Form of Certificate of Tax Deduction at Source from Salary
 */
payrollRouter.get('/v1/payroll/certificate/:employeeId', (req: Request, res: Response) => {
  try {
    const employeeId = String(req.params.employeeId);
    const taxYear = (req.query.taxYear as string) || '2026-2027';
    const certificate = smePayrollEngine.generateWithholdingCertificate(employeeId, taxYear);

    return res.status(200).json({
      ok: true,
      data: certificate,
      message: `NBR Salary Tax Withholding Certificate generated for employee #${employeeId}.`,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Failed to generate NBR tax certificate.',
    });
  }
});
