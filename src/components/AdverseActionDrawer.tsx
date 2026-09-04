import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, FileText, Calendar, Copy, Check, Lock, CheckCircle2 } from 'lucide-react';
import { CreditApplication, PolicyEvaluation, RuleEvaluation } from '../types';

interface AdverseActionDrawerProps {
  application: CreditApplication;
  policyEvaluation: PolicyEvaluation;
  isOpen: boolean;
  onClose: () => void;
}

export const AdverseActionDrawer: React.FC<AdverseActionDrawerProps> = ({
  application,
  policyEvaluation,
  isOpen,
  onClose,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const failedRules = policyEvaluation.rules_evaluated.filter((r) => r.result === 'FAIL' || r.result === 'REFER');

  if (!isOpen) return null;

  const deadlineDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const handleCopy = () => {
    const text = `STATEMENT OF CREDIT ADVERSE DETERMINATION & RECOURSE NOTICE
Applicant: ${application.identity.legal_name}
Tax Identifier: ${application.identity.tax_token}
Date of Notice: ${new Date().toISOString().split('T')[0]}
Statutory Recourse Window Closes: ${deadlineDate}

PRINCIPAL DETERMINISTIC REASONS FOR ADVERSE DETERMINATION:
${failedRules.map((r) => `- [${r.rule_id}] ${r.name}: Threshold required ${r.threshold}, actual was ${r.actual} (${r.notes || r.description})`).join('\n')}

EQUAL CREDIT OPPORTUNITY ACT DISCLOSURE:
You have the right to request a statement of specific reasons within 60 days of this notice, and may submit qualifying recourse documentation within the 30-day statutory window.`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <div>
              <h3 className="text-base font-bold text-white">Statement of Adverse Credit Determination</h3>
              <p className="text-xs text-slate-400 font-mono">
                Formal Notice with Statutory 30-Day Recourse Window (PRD Section 3.3)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm cursor-pointer p-1">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs text-slate-300">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 font-mono text-[11px]">
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span className="text-slate-400">Applicant Legal Name:</span>
              <strong className="text-white">{application.identity.legal_name}</strong>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span className="text-slate-400">Tax Identification Token:</span>
              <span className="text-cyan-300">{application.identity.tax_token}</span>
            </div>
            <div className="flex justify-between border-b border-slate-900 pb-1.5">
              <span className="text-slate-400">Date Issued:</span>
              <span className="text-slate-200">{new Date().toISOString().split('T')[0]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Recourse Window Expiration:</span>
              <span className="text-rose-400 font-bold">{deadlineDate} (30 Days)</span>
            </div>
          </div>

          {/* Principal Deterministic Reasons */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">
              Principal Deterministic Policy Criteria Breaches
            </h4>
            <div className="space-y-2">
              {failedRules.map((rule) => (
                <div key={rule.rule_id} className="p-3 bg-slate-950 rounded-lg border border-rose-900/60 space-y-1">
                  <div className="flex items-center justify-between font-mono font-bold">
                    <span className="text-rose-400">[{rule.rule_id}] {rule.name}</span>
                    <span className="text-rose-300 text-[10px] bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                      {rule.result}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Required Policy Benchmark: <span className="text-slate-200">{rule.threshold}</span> | Actual
                    Applicant Metric: <strong className="text-white">{rule.actual}</strong>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1">{rule.notes || rule.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Regulatory Disclosures */}
          <div className="p-4 bg-slate-950/80 rounded-lg border border-slate-800 text-[11px] text-slate-400 leading-relaxed space-y-1.5">
            <span className="font-bold text-slate-200 block">Equal Credit Opportunity Act & Regulatory Recourse</span>
            <p>
              The Federal Equal Credit Opportunity Act prohibits creditors from discriminating against credit applicants
              on the basis of race, color, religion, national origin, sex, marital status, or age. The creditor that
              made this determination is NexLend SME Finance. You are entitled to a statement of specific reasons upon
              request and may submit corrective recourse evidence within 30 days of this notice.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-slate-300 flex items-center gap-1.5 cursor-pointer font-medium"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Copied Statement' : 'Copy Notice Text'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
