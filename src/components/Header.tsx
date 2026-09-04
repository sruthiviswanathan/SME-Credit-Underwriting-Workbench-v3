import React from 'react';
import {
  ShieldCheck,
  Building2,
  UserCheck,
  Layers,
  FileCheck,
  History,
  Activity,
  Sparkles,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentTenant: string;
  setCurrentTenant: (tenant: string) => void;
  onOpenTestRunner: () => void;
  onOpenAuditLogs: () => void;
  activeScenarioCode?: string;
  onOpenScenarioDrawer: () => void;
  geminiConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  setCurrentRole,
  currentTenant,
  setCurrentTenant,
  onOpenTestRunner,
  onOpenAuditLogs,
  activeScenarioCode,
  onOpenScenarioDrawer,
  geminiConnected,
}) => {
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.CREDIT_AUTHORITY:
        return 'bg-purple-950/80 text-purple-300 border-purple-700/60';
      case UserRole.SENIOR_UNDERWRITER:
        return 'bg-blue-950/80 text-blue-300 border-blue-700/60';
      case UserRole.CREDIT_ANALYST:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
      case UserRole.RELATIONSHIP_MANAGER:
        return 'bg-amber-950/80 text-amber-300 border-amber-700/60';
    }
  };

  const getRolePermissionLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.CREDIT_AUTHORITY:
        return 'Full Lending Authority ($5M+) & Policy Overrides';
      case UserRole.SENIOR_UNDERWRITER:
        return 'Credit Approval Authority ($1.5M) & Mitigated Overrides';
      case UserRole.CREDIT_ANALYST:
        return 'Financial Analysis & AI Memo Preparation (No Final Approval)';
      case UserRole.RELATIONSHIP_MANAGER:
        return 'Evidence Ingestion & Borrower Intake Only';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Top Banner / System Telemetry Bar */}
      <div className="bg-slate-900/90 px-4 py-1.5 border-b border-slate-800/80 text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>POLICY ENGINE: v3.4.1 [DETERMINISTIC PRIMACY ACTIVE]</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-slate-400 font-mono">
            <Lock className="w-3 h-3 text-cyan-400" />
            <span>PRE-RETRIEVAL TENANT ISOLATION: ENFORCED</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-slate-400 font-mono">
            <ShieldCheck className="w-3 h-3 text-purple-400" />
            <span>PROMPT INJECTION XML GUARDRAIL: ARMED</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${geminiConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span className="text-slate-400">AI Gateway:</span>
            <span className="font-semibold text-slate-200">
              {geminiConnected ? 'Gemini 3.7 Flash (Active)' : 'Deterministic Core Fallback'}
            </span>
          </div>
          <span className="text-slate-700">|</span>
          <button
            onClick={onOpenTestRunner}
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer transition-colors"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>15 Golden Scenarios Suite</span>
          </button>
        </div>
      </div>

      {/* Main Navigation & Context Switcher Bar */}
      <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & App ID */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center shadow-lg shadow-cyan-900/20 border border-cyan-500/30">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                NexLend SME Finance
                <span className="text-xs px-2 py-0.5 rounded font-normal bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Workbench 1.0-FINAL
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">Evidence-Aware SME Credit Underwriting Intelligence</p>
          </div>
        </div>

        {/* Center: Scenario Quick Jump */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenScenarioDrawer}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 transition-colors shadow-sm cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Scenario:</span>
            <span className="font-mono font-semibold text-cyan-300">
              {activeScenarioCode || 'GS-01 (SME-L001)'}
            </span>
            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Switch</span>
          </button>
        </div>

        {/* Right Controls: Tenant Switcher, Role Selector, Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Tenant Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-xs">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 text-[11px]">Tenant:</span>
            <select
              value={currentTenant}
              onChange={(e) => setCurrentTenant(e.target.value)}
              className="bg-transparent text-slate-200 font-medium outline-none cursor-pointer text-xs"
            >
              <option value="TENANT-BANK-ALPHA" className="bg-slate-900 text-slate-200">
                Apex Commercial Bank (Alpha)
              </option>
              <option value="TENANT-BANK-BETA" className="bg-slate-900 text-slate-200">
                Sterling Trust Bank (Beta - Restricted)
              </option>
            </select>
          </div>

          {/* User Role Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-xs">
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 text-[11px]">RBAC Role:</span>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as UserRole)}
              className={`font-semibold outline-none cursor-pointer text-xs rounded px-1.5 py-0.5 border ${getRoleBadgeColor(
                currentRole
              )}`}
              title={getRolePermissionLabel(currentRole)}
            >
              <option value={UserRole.SENIOR_UNDERWRITER} className="bg-slate-900 text-slate-200">
                Senior Underwriter
              </option>
              <option value={UserRole.CREDIT_AUTHORITY} className="bg-slate-900 text-slate-200">
                Credit Authority
              </option>
              <option value={UserRole.CREDIT_ANALYST} className="bg-slate-900 text-slate-200">
                Credit Analyst
              </option>
              <option value={UserRole.RELATIONSHIP_MANAGER} className="bg-slate-900 text-slate-200">
                Relationship Manager
              </option>
            </select>
          </div>

          {/* Audit Logs Button */}
          <button
            onClick={onOpenAuditLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
            title="View Immutable Audit Trail & Post-Decision Replay"
          >
            <History className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">Audit Trail</span>
          </button>
        </div>
      </div>
    </header>
  );
};
