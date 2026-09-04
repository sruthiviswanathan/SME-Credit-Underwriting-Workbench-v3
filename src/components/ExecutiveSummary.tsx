import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  DollarSign,
  FileSpreadsheet,
  Receipt,
  Scale,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  User,
  Building,
  Fingerprint,
  FileText,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';
import {
  CreditApplication,
  FinancialMeasure,
  PolicyEvaluation,
  PolicyStatus,
  RuleEvaluation,
  UserRole,
} from '../types';

interface ExecutiveSummaryProps {
  application: CreditApplication;
  measures: FinancialMeasure[];
  policyEvaluation: PolicyEvaluation;
  onOpenDecisionModal: () => void;
  onOpenAdverseNotice: () => void;
  userRole: UserRole;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  application,
  measures,
  policyEvaluation,
  onOpenDecisionModal,
  onOpenAdverseNotice,
  userRole,
}) => {
  const isDeciderRole =
    userRole === UserRole.SENIOR_UNDERWRITER || userRole === UserRole.CREDIT_AUTHORITY;

  const getMetric = (metricId: string): number | null => {
    const found = measures.find((m) => m.metric_id === metricId);
    return found ? found.value : null;
  };

  const recRevenue = getMetric('M_REC_REVENUE_FY');
  const bankInflow = getMetric('M_BANK_INFLOW_12M');
  const gstTurnover = getMetric('M_GST_TURNOVER_12M');
  const dscr = getMetric('M_DSCR_CALC') || policyEvaluation.dscr_calculated || 1.5;

  const divergencePct =
    recRevenue && bankInflow && recRevenue > 0
      ? Math.round(((bankInflow - recRevenue) / recRevenue) * 100)
      : 0;

  const isDivergenceHigh = divergencePct > 50;

  const getStatusBadge = (status: PolicyStatus) => {
    switch (status) {
      case PolicyStatus.PASS:
        return {
          bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-emerald-900/30',
          icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
          title: 'POLICY PASS',
          subtitle: '100% Deterministic Rule Compliance',
        };
      case PolicyStatus.FAIL:
        return {
          bg: 'bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-rose-900/30',
          icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
          title: 'POLICY FAIL',
          subtitle: 'Critical Policy Criteria Breached',
        };
      case PolicyStatus.REFER:
        return {
          bg: 'bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-amber-900/30',
          icon: <AlertCircle className="w-5 h-5 text-amber-400" />,
          title: 'POLICY REFER',
          subtitle: 'Secondary Reconciliation / Exception Triggered',
        };
    }
  };

  const badge = getStatusBadge(policyEvaluation.status);

  return (
    <div className="space-y-6">
      {/* Top Banner: Identity & Deterministic Policy Primacy Header */}
      <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Borrower Profile */}
          <div className="space-y-2">
            <div className="flex items-center flex-wrap gap-2.5">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {application.identity.legal_name}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-slate-800 text-slate-300 border border-slate-700">
                {application.application_id}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-950 text-blue-300 border border-blue-800">
                {application.identity.entity_type}
              </span>
              {application.identity.has_mismatch_flag && (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-rose-950 text-rose-300 border border-rose-700 animate-pulse flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  IDENTITY MISMATCH HALT
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-1.5">
                <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
                <span>Tax Token:</span>
                <span className="text-slate-200">{application.identity.tax_token}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>Registration:</span>
                <span className="text-slate-200">{application.identity.registration_no}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Industry:</span>
                <span className="text-slate-200">{application.identity.industry}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Jurisdiction:</span>
                <span className="text-slate-200">{application.identity.jurisdiction}</span>
              </div>
            </div>
          </div>

          {/* Prominent Deterministic Policy Badge */}
          <div className="flex items-center gap-4">
            <div
              className={`px-5 py-3 rounded-xl border shadow-lg flex items-center gap-3.5 ${badge.bg}`}
            >
              <div className="p-2 rounded-lg bg-black/30 border border-white/10">{badge.icon}</div>
              <div>
                <div className="text-sm font-black tracking-wider flex items-center gap-2">
                  <span>{badge.title}</span>
                  <span className="text-[10px] font-mono font-normal opacity-80 px-1.5 py-0.2 rounded bg-black/40">
                    Engine {policyEvaluation.engine_version}
                  </span>
                </div>
                <div className="text-xs opacity-90 font-medium">{badge.subtitle}</div>
              </div>
            </div>

            {/* Quick Action Decision Button */}
            <div className="flex flex-col gap-2">
              <button
                onClick={onOpenDecisionModal}
                disabled={!isDeciderRole}
                className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${
                  isDeciderRole
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-blue-900/30'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
                title={
                  isDeciderRole
                    ? 'Record authorized credit decision'
                    : 'Decision restricted to Senior Underwriter or Credit Authority'
                }
              >
                <span>Record Credit Decision</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              {policyEvaluation.status !== PolicyStatus.PASS && (
                <button
                  onClick={onOpenAdverseNotice}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-[11px] font-medium transition-colors cursor-pointer text-center"
                >
                  Draft Adverse Notice (30d Recourse)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Identity Mismatch Warning Box if triggered */}
        {application.identity.has_mismatch_flag && (
          <div className="mt-4 p-3.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Entity Resolution Gate Alert:</span> Cross-source identity
              discrepancy detected! Silent merging is strictly forbidden by policy. Automatic
              underwriting is halted until manual identity crosswalk adjudication is confirmed.
              <p className="mt-1 text-rose-300/90 font-mono text-[11px]">
                {application.identity.mismatch_details ||
                  'Tax token or Registration number delta across LOS and official GST filing.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Facility Details & Underwriting Parameters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-400">Requested Amount</span>
          <p className="text-base font-bold text-white mt-0.5">
            ${application.requested_amount.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500">Commercial Credit Facility</span>
        </div>
        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-400">Facility Structure</span>
          <p className="text-base font-bold text-cyan-300 mt-0.5">
            {application.facility_type.replace(/_/g, ' ')}
          </p>
          <span className="text-[11px] text-slate-500">Tenor: {application.tenor_months} Months</span>
        </div>
        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-400">Target Pricing</span>
          <p className="text-base font-bold text-emerald-400 mt-0.5">
            {application.interest_rate_target.toFixed(2)}% p.a.
          </p>
          <span className="text-[11px] text-slate-500">Risk-Adjusted Spread</span>
        </div>
        <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
          <span className="text-slate-400">Assigned Team</span>
          <p className="text-sm font-semibold text-slate-200 mt-0.5 truncate">
            {application.assigned_underwriter}
          </p>
          <span className="text-[11px] text-slate-500 truncate">Analyst: {application.assigned_analyst}</span>
        </div>
      </div>

      {/* Semantic Segregation Layer (PRD Section 5 - Non-Equivalence Guardrails) */}
      <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white tracking-tight uppercase">
              Semantic Segregation Layer & Non-Equivalence Guardrails
            </h3>
          </div>
          <div className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-cyan-300 border border-slate-700 flex items-center gap-1.5">
            <span>Bank Inflow ≠ GST Turnover ≠ Recognized Revenue</span>
          </div>
        </div>

        {/* 4 Core Financial Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Recognized Revenue */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-semibold text-slate-300">
                <FileSpreadsheet className="w-3.5 h-3.5 text-blue-400" />
                Recognized Revenue (FY)
              </span>
              <span className="text-[10px] font-mono text-blue-400 bg-blue-950 px-1.5 py-0.5 rounded">
                M_REC_REVENUE_FY
              </span>
            </div>
            <div className="text-xl font-extrabold text-white mt-2">
              ${(recRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Audited accrual sales from GAAP P&L statement. Sole allowable basis for debt service ratios.
            </p>
            <div className="mt-2 text-[10px] text-slate-500 font-mono flex items-center gap-1">
              <span>Source: Audited Financials [Doc-Audit]</span>
            </div>
          </div>

          {/* 2. Bank Inflow */}
          <div
            className={`bg-slate-950 p-4 rounded-lg border transition-colors ${
              isDivergenceHigh ? 'border-amber-700/80 bg-amber-950/20' : 'border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-semibold text-slate-300">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                12M Total Bank Inflows
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">
                M_BANK_INFLOW_12M
              </span>
            </div>
            <div className="text-xl font-extrabold text-white mt-2">
              ${(bankInflow || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Gross operational clearing cash credits. Includes potential non-revenue advances or transfers.
            </p>
            <div className="mt-2 text-[10px] text-slate-500 font-mono flex items-center gap-1">
              <span>Source: 12M Bank Statement [Doc-Bank]</span>
            </div>
          </div>

          {/* 3. GST Tax Turnover */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-semibold text-slate-300">
                <Receipt className="w-3.5 h-3.5 text-purple-400" />
                12M GST/Tax Turnover
              </span>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-950 px-1.5 py-0.5 rounded">
                M_GST_TURNOVER_12M
              </span>
            </div>
            <div className="text-xl font-extrabold text-white mt-2">
              ${(gstTurnover || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              Official quarterly tax filing receipts. Used for regulatory tax reconciliation validation.
            </p>
            <div className="mt-2 text-[10px] text-slate-500 font-mono flex items-center gap-1">
              <span>Source: Certified Tax Filings [Doc-Tax]</span>
            </div>
          </div>

          {/* 4. DSCR Ratio */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="flex items-center gap-1 font-semibold text-slate-300">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                Calculated DSCR Coverage
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded">
                M_DSCR_CALC
              </span>
            </div>
            <div className="text-xl font-extrabold text-white mt-2 flex items-baseline gap-2">
              <span>{dscr.toFixed(2)}x</span>
              <span
                className={`text-xs px-2 py-0.5 rounded font-mono ${
                  dscr >= 1.25
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                }`}
              >
                {dscr >= 1.25 ? 'PASS (>= 1.25x)' : 'FAIL (< 1.25x)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              EBITDA / Total Debt Service obligations. Evaluated deterministically by policy engine.
            </p>
            <div className="mt-2 text-[10px] text-slate-500 font-mono">
              <span>Benchmark: Minimum 1.25x threshold</span>
            </div>
          </div>
        </div>

        {/* Reconciliation Divergence Callout */}
        {isDivergenceHigh && (
          <div className="p-3.5 rounded-lg bg-amber-950/50 border border-amber-800 text-amber-200 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Cash Inflow Divergence Warning (+{divergencePct}%):</span> Bank
              inflows exceed audited revenue by more than 50%. The semantic segregation layer strictly
              prohibits using cash inflows in place of accrual revenue for DSCR calculation, preventing
              false risk ratings. This triggers a mandatory Policy REFER reconciliation check.
            </div>
          </div>
        )}
      </div>

      {/* Deterministic Policy Engine Evaluation Breakdown */}
      <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight uppercase">
              Deterministic Policy Engine Evaluation (v3.4.1)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Eval ID: {policyEvaluation.evaluation_id}
          </span>
        </div>

        {/* Rules Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/50">
                <th className="py-2.5 px-3">Rule ID</th>
                <th className="py-2.5 px-3">Rule Name & Objective</th>
                <th className="py-2.5 px-3 text-center">Result</th>
                <th className="py-2.5 px-3">Policy Threshold</th>
                <th className="py-2.5 px-3">Actual Value</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Overrideable?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {policyEvaluation.rules_evaluated.map((rule) => {
                const isPass = rule.result === 'PASS';
                const isFail = rule.result === 'FAIL';
                return (
                  <tr key={rule.rule_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-cyan-400">{rule.rule_id}</td>
                    <td className="py-3 px-3 font-sans text-slate-200 font-medium">
                      <div>{rule.name}</div>
                      <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                        {rule.description}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          isPass
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : isFail
                            ? 'bg-rose-950 text-rose-300 border border-rose-700'
                            : 'bg-amber-950 text-amber-300 border border-amber-700'
                        }`}
                      >
                        {isPass ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ) : isFail ? (
                          <XCircle className="w-3 h-3 text-rose-400" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-amber-400" />
                        )}
                        {rule.result}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{rule.threshold}</td>
                    <td className="py-3 px-3 font-bold text-white">{rule.actual}</td>
                    <td className="py-3 px-3 font-sans">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          rule.severity === 'CRITICAL'
                            ? 'bg-rose-950 text-rose-400 border border-rose-900'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {rule.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-sans text-slate-400">
                      {rule.is_overridable ? (
                        <span className="text-amber-400 font-medium">Yes (SU/CAUTH)</span>
                      ) : (
                        <span className="text-slate-500">No (Hard Floor)</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
