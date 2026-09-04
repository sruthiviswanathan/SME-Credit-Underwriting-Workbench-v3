import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileCheck,
  Lock,
  DollarSign,
  Scale,
} from 'lucide-react';
import { CreditApplication, DecisionAction, PolicyStatus, UserRole } from '../types';

interface DecisionModalProps {
  application: CreditApplication;
  isOpen: boolean;
  onClose: () => void;
  onSubmitDecision: (decisionData: {
    action: DecisionAction;
    justification_rationale: string;
    override_reason?: string;
    approved_amount?: number;
    conditions?: string[];
  }) => Promise<void>;
  userRole: UserRole;
  currentUserId: string;
}

export const DecisionModal: React.FC<DecisionModalProps> = ({
  application,
  isOpen,
  onClose,
  onSubmitDecision,
  userRole,
  currentUserId,
}) => {
  const isAuthorized =
    userRole === UserRole.SENIOR_UNDERWRITER || userRole === UserRole.CREDIT_AUTHORITY;

  const policyStatus = application.current_policy_eval?.status || PolicyStatus.PASS;
  const isPolicyFail = policyStatus === PolicyStatus.FAIL;

  const [action, setAction] = useState<DecisionAction>(
    isPolicyFail ? DecisionAction.DECLINED : DecisionAction.APPROVED
  );
  const [approvedAmount, setApprovedAmount] = useState<number>(application.requested_amount);
  const [rationale, setRationale] = useState<string>('');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [conditionsText, setConditionsText] = useState<string>(
    '1. Execution of personal guarantee by majority shareholder.\n2. Quarterly financial reporting covenant (DSCR >= 1.25x).'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!rationale.trim()) {
      setErrorMsg('Mandatory Underwriter Justification Rationale is required.');
      return;
    }

    if (isPolicyFail && action === DecisionAction.APPROVED && !overrideReason.trim()) {
      setErrorMsg('Policy Primacy Rule: Approving a failed policy run requires an explicit Formal Override Rationale.');
      return;
    }

    setIsSubmitting(true);
    try {
      const conditionsList = conditionsText
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await onSubmitDecision({
        action: isPolicyFail && action === DecisionAction.APPROVED ? DecisionAction.OVERRIDDEN : action,
        justification_rationale: rationale,
        override_reason: overrideReason.trim() ? overrideReason : undefined,
        approved_amount: action === DecisionAction.APPROVED || action === DecisionAction.CONDITIONED ? approvedAmount : undefined,
        conditions: conditionsList,
      });

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record decision.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-white">Record Human Credit Decision</h3>
              <p className="text-xs text-slate-400 font-mono">
                {application.identity.legal_name} ({application.application_id})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Authorization Check Banner */}
          {!isAuthorized ? (
            <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-lg text-rose-200 flex items-start gap-3">
              <Lock className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">RBAC Authorization Gate (FR-008):</span> Your active role{' '}
                <code className="text-white font-mono font-bold">[{userRole}]</code> lacks delegated credit approval
                authority. Final credit adjudication requires <code className="text-white font-bold">SENIOR_UNDERWRITER</code>{' '}
                or <code className="text-white font-bold">CREDIT_AUTHORITY</code>.
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Authorized Decider: <strong className="text-white">{currentUserId}</strong> ({userRole})</span>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                Policy Result: {policyStatus}
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-950/80 border border-rose-700 rounded-lg text-rose-200 flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Decision Action Selector */}
            <div>
              <label className="block text-slate-300 font-bold mb-2">Adjudication Action</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { act: DecisionAction.APPROVED, label: 'Approve Facility', color: 'border-emerald-600 bg-emerald-950/40 text-emerald-300' },
                  { act: DecisionAction.CONDITIONED, label: 'Conditioned Approval', color: 'border-blue-600 bg-blue-950/40 text-blue-300' },
                  { act: DecisionAction.DECLINED, label: 'Decline Application', color: 'border-rose-600 bg-rose-950/40 text-rose-300' },
                  { act: DecisionAction.OVERRIDDEN, label: 'Policy Override', color: 'border-amber-600 bg-amber-950/40 text-amber-300' },
                ].map((item) => (
                  <button
                    key={item.act}
                    type="button"
                    onClick={() => setAction(item.act)}
                    disabled={!isAuthorized}
                    className={`p-3 rounded-lg border text-center transition-all cursor-pointer font-bold text-xs ${
                      action === item.act ? `ring-2 ring-cyan-400 ${item.color}` : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Approved Amount */}
            {(action === DecisionAction.APPROVED || action === DecisionAction.CONDITIONED || action === DecisionAction.OVERRIDDEN) && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Approved Facility Amount ($ USD)</label>
                <input
                  type="number"
                  disabled={!isAuthorized}
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono text-sm outline-none"
                />
              </div>
            )}

            {/* Policy Override Rationale (Triggered if Policy is FAIL and approving) */}
            {(isPolicyFail || action === DecisionAction.OVERRIDDEN) && (
              <div className="p-3.5 bg-amber-950/40 border border-amber-800 rounded-lg space-y-2">
                <label className="block text-amber-300 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Mandatory Formal Policy Override Justification (PRD Section 3.2)
                </label>
                <textarea
                  rows={2}
                  disabled={!isAuthorized}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="State specific mitigating factors (e.g., $450k liquid collateral reserves, multi-year supply contracts)..."
                  className="w-full bg-slate-950 border border-amber-900/60 rounded p-2.5 text-slate-200 font-mono text-xs outline-none focus:border-amber-500"
                />
              </div>
            )}

            {/* Mandatory Underwriter Justification */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Mandatory Underwriting Justification Rationale (Saved to Immutable Audit Trail)
              </label>
              <textarea
                rows={3}
                disabled={!isAuthorized}
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                placeholder="State the formal basis for this credit determination, citing evidence items and financial ratios..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 text-xs font-mono outline-none focus:border-cyan-500"
                required
              />
            </div>

            {/* Conditions & Covenants */}
            {(action === DecisionAction.CONDITIONED || action === DecisionAction.APPROVED) && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Facility Conditions & Covenants</label>
                <textarea
                  rows={2}
                  disabled={!isAuthorized}
                  value={conditionsText}
                  onChange={(e) => setConditionsText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 text-xs font-mono outline-none"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isAuthorized || isSubmitting}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-all shadow-md disabled:opacity-50"
              >
                {isSubmitting ? 'Signing Decision...' : 'Record Authorized Decision'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
