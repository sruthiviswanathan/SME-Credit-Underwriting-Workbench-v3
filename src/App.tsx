import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Building2,
  FileText,
  Database,
  Network,
  Sparkles,
  History,
  Activity,
  Layers,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import {
  ContextPacket,
  CreditApplication,
  DecisionAction,
  DocumentType,
  EvidenceItem,
  FinancialMeasure,
  GoldenScenario,
  PolicyEvaluation,
  PolicyStatus,
  UserRole,
} from './types';
import { Header } from './components/Header';
import { ExecutiveSummary } from './components/ExecutiveSummary';
import { EvidenceWorkbench } from './components/EvidenceWorkbench';
import { AIMemoWorkspace } from './components/AIMemoWorkspace';
import { KnowledgeGraphViewer } from './components/KnowledgeGraphViewer';
import { DecisionModal } from './components/DecisionModal';
import { AuditTrailModal } from './components/AuditTrailModal';
import { AdverseActionDrawer } from './components/AdverseActionDrawer';
import { GoldenScenariosRunner } from './components/GoldenScenariosRunner';

export function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<'summary' | 'evidence' | 'memo' | 'graph'>('summary');
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.SENIOR_UNDERWRITER);
  const [currentTenant, setCurrentTenant] = useState<string>('TENANT-BANK-ALPHA');
  const [currentUserId, setCurrentUserId] = useState<string>('USR-UNDERWRITER-01');

  // Data State
  const [scenarios, setScenarios] = useState<GoldenScenario[]>([]);
  const [applications, setApplications] = useState<CreditApplication[]>([]);
  const [activeAppId, setActiveAppId] = useState<string>('SME-L001');
  const [activeApplication, setActiveApplication] = useState<CreditApplication | null>(null);
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [measures, setMeasures] = useState<FinancialMeasure[]>([]);
  const [policyEval, setPolicyEval] = useState<PolicyEvaluation | null>(null);
  const [contextPacket, setContextPacket] = useState<ContextPacket | undefined>(undefined);
  const [draftMemo, setDraftMemo] = useState<string>('');

  // Modals & Drawers
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isAdverseDrawerOpen, setIsAdverseDrawerOpen] = useState(false);
  const [isTestRunnerOpen, setIsTestRunnerOpen] = useState(false);
  const [isScenarioDrawerOpen, setIsScenarioDrawerOpen] = useState(false);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | undefined>(undefined);

  // Status & Telemetry
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingMemo, setIsGeneratingMemo] = useState(false);
  const [geminiConnected, setGeminiConnected] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(
    null
  );

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial Load: Fetch Scenarios & Applications
  useEffect(() => {
    fetchInitialData();
  }, [currentTenant]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // Check health
      const healthRes = await fetch('/api/health');
      if (healthRes.ok) {
        const hData = await healthRes.json();
        setGeminiConnected(hData.gemini_available);
      }

      // Fetch Scenarios
      const scenRes = await fetch('/api/scenarios');
      if (scenRes.ok) {
        const sData = await scenRes.json();
        setScenarios(sData);
      }

      // Fetch Applications for tenant
      const appRes = await fetch(`/api/applications?tenant_id=${currentTenant}`);
      if (appRes.ok) {
        const aData = await appRes.json();
        setApplications(aData);
        if (aData.length > 0) {
          loadApplication(aData[0].application_id);
        }
      }
    } catch (err) {
      console.error('Failed to load initial data', err);
      showToast('Error connecting to Underwriting Engine API', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Load Specific Application Details
  const loadApplication = async (appId: string) => {
    try {
      const res = await fetch(`/api/applications/${appId}?tenant_id=${currentTenant}`);
      if (!res.ok) {
        const errData = await res.json();
        showToast(errData.error || 'Failed to load application', 'error');
        return;
      }
      const data = await res.json();
      setActiveApplication(data.application);
      setActiveAppId(data.application.application_id);
      setEvidenceItems(data.evidence || []);
      setMeasures(data.measures || []);
      setPolicyEval(data.application.current_policy_eval || null);
      setDraftMemo(data.application.underwriter_memo || '');
    } catch (err) {
      console.error('Error loading application', err);
      showToast('Failed to load application details', 'error');
    }
  };

  // Evaluate Deterministic Policy
  const handleEvaluatePolicy = async () => {
    if (!activeAppId) return;
    try {
      const res = await fetch(`/api/policy/evaluate/${activeAppId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenant_id: currentTenant }),
      });
      if (res.ok) {
        const data = await res.json();
        setPolicyEval(data.policy_evaluation);
        showToast(`Policy Evaluated: ${data.policy_evaluation.status}`, 'success');
        // reload application
        loadApplication(activeAppId);
      }
    } catch (err) {
      console.error('Policy evaluation failed', err);
      showToast('Policy evaluation failed', 'error');
    }
  };

  // Generate AI Underwriting Memo (Server-Side LLM Call)
  const handleGenerateMemo = async () => {
    if (!activeAppId) return;
    setIsGeneratingMemo(true);
    try {
      const res = await fetch(`/api/ai/generate-memo/${activeAppId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': currentTenant,
          'x-user-role': currentRole,
          'x-user-id': currentUserId,
        },
        body: JSON.stringify({ tenant_id: currentTenant, user_role: currentRole }),
      });
      if (res.ok) {
        const data = await res.json();
        const memoContent =
          data.draft_memorandum || data.narrative_memo || data.draft_memo || data.draftMemo || '';
        setDraftMemo(memoContent);
        setContextPacket(data.context_packet);
        setActiveApplication((prev) =>
          prev ? { ...prev, underwriter_memo: memoContent, status: 'MEMO_DRAFTED' } : prev
        );
        showToast('AI Draft Memo generated successfully with source citations', 'success');
      } else {
        const errData = await res.json();
        showToast(errData.error || 'AI generation failed', 'error');
      }
    } catch (err) {
      console.error('AI memo generation failed', err);
      showToast('AI memo generation failed', 'error');
    } finally {
      setIsGeneratingMemo(false);
    }
  };

  // Upload Evidence Document
  const handleUploadEvidence = async (payload: {
    doc_type: DocumentType;
    file_name: string;
    raw_payload: string;
    extracted_metrics?: Record<string, number>;
  }) => {
    if (!activeAppId) return;
    const res = await fetch('/api/evidence/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application_id: activeAppId,
        tenant_id: currentTenant,
        user_id: currentUserId,
        user_role: currentRole,
        ...payload,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      showToast(`Evidence Ingested & SHA-256 Checksum Computed`, 'success');
      await loadApplication(activeAppId);
    } else {
      const err = await res.json();
      throw new Error(err.error || 'Evidence upload failed');
    }
  };

  // Submit Final Credit Decision (RBAC-enforced)
  const handleSubmitDecision = async (decisionData: {
    action: DecisionAction;
    justification_rationale: string;
    override_reason?: string;
    approved_amount?: number;
    conditions?: string[];
  }) => {
    if (!activeAppId) return;
    const res = await fetch('/api/decisions/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application_id: activeAppId,
        tenant_id: currentTenant,
        user_id: currentUserId,
        user_role: currentRole,
        ...decisionData,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      showToast(`Credit Decision Recorded: ${decisionData.action}`, 'success');
      await loadApplication(activeAppId);
    } else {
      const err = await res.json();
      throw new Error(err.error || 'Decision submission failed');
    }
  };

  // Switch Scenario via Runner / Drawer
  const handleSelectScenario = (sc: GoldenScenario) => {
    setActiveAppId(sc.application_id);
    loadApplication(sc.application_id);
    showToast(`Loaded Scenario: ${sc.id} - ${sc.title}`, 'info');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border transition-all animate-bounce ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950 border-emerald-700 text-emerald-200'
              : toastMessage.type === 'error'
              ? 'bg-rose-950 border-rose-700 text-rose-200'
              : 'bg-slate-900 border-slate-700 text-cyan-200'
          }`}
        >
          {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toastMessage.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
          {toastMessage.type === 'info' && <ShieldCheck className="w-4 h-4 text-cyan-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Primary Header */}
      <Header
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        currentTenant={currentTenant}
        setCurrentTenant={setCurrentTenant}
        onOpenTestRunner={() => setIsTestRunnerOpen(true)}
        onOpenAuditLogs={() => setIsAuditModalOpen(true)}
        activeScenarioCode={scenarios.find((s) => s.application_id === activeAppId)?.id}
        onOpenScenarioDrawer={() => setIsScenarioDrawerOpen(true)}
        geminiConnected={geminiConnected}
      />

      {/* Main App Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'summary'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>1. Executive Summary & Policy</span>
            </button>

            <button
              onClick={() => setActiveTab('evidence')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'evidence'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>2. Evidence Vault ({evidenceItems.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('memo')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'memo'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>3. AI Memo Workspace</span>
              {activeApplication?.has_prompt_injection && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('graph')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'graph'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Network className="w-4 h-4" />
              <span>4. Knowledge Graph</span>
            </button>
          </div>

          {/* Quick Engine Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleEvaluatePolicy}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Re-run Deterministic Policy Rules"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-Evaluate Policy</span>
            </button>
          </div>
        </div>

        {/* Dynamic Tab Views */}
        {isLoading || !activeApplication || !policyEval ? (
          <div className="h-96 flex flex-col items-center justify-center space-y-4 bg-slate-900/40 rounded-xl border border-slate-800 text-slate-400">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-xs font-mono">Loading SME Credit Dossier & Deterministic Policy Core...</p>
          </div>
        ) : (
          <div>
            {activeTab === 'summary' && (
              <ExecutiveSummary
                application={activeApplication}
                measures={measures}
                policyEvaluation={policyEval}
                onOpenDecisionModal={() => setIsDecisionModalOpen(true)}
                onOpenAdverseNotice={() => setIsAdverseDrawerOpen(true)}
                userRole={currentRole}
              />
            )}

            {activeTab === 'evidence' && (
              <EvidenceWorkbench
                application={activeApplication}
                evidenceItems={evidenceItems}
                onUploadEvidence={handleUploadEvidence}
                userRole={currentRole}
                selectedEvidenceId={selectedEvidenceId}
                onSelectEvidence={setSelectedEvidenceId}
              />
            )}

            {activeTab === 'memo' && (
              <AIMemoWorkspace
                application={activeApplication}
                contextPacket={contextPacket}
                onGenerateMemo={handleGenerateMemo}
                isGeneratingMemo={isGeneratingMemo}
                draftMemo={draftMemo}
                setDraftMemo={setDraftMemo}
                onSelectEvidence={(id) => {
                  setSelectedEvidenceId(id);
                  setActiveTab('evidence');
                }}
                userRole={currentRole}
                geminiConnected={geminiConnected}
              />
            )}

            {activeTab === 'graph' && <KnowledgeGraphViewer applicationId={activeApplication.application_id} />}
          </div>
        )}
      </main>

      {/* Scenario Switcher Drawer */}
      {isScenarioDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-xl w-full shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Select Application Dossier</h3>
              </div>
              <button
                onClick={() => setIsScenarioDrawerOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto text-xs">
              {scenarios.map((sc) => {
                const isSelected = sc.application_id === activeAppId;
                return (
                  <div
                    key={sc.id}
                    onClick={() => {
                      handleSelectScenario(sc);
                      setIsScenarioDrawerOpen(false);
                    }}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-850 border-cyan-500 text-white'
                        : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-cyan-400">{sc.id}</span>
                      <span className="text-[11px] text-slate-500">{sc.category}</span>
                    </div>
                    <div className="font-bold text-slate-100 mt-1">{sc.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{sc.stress_condition}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Decision Adjudication Modal */}
      {activeApplication && (
        <DecisionModal
          application={activeApplication}
          isOpen={isDecisionModalOpen}
          onClose={() => setIsDecisionModalOpen(false)}
          onSubmitDecision={handleSubmitDecision}
          userRole={currentRole}
          currentUserId={currentUserId}
        />
      )}

      {/* Immutable Audit Trail Modal */}
      {activeApplication && (
        <AuditTrailModal
          applicationId={activeApplication.application_id}
          isOpen={isAuditModalOpen}
          onClose={() => setIsAuditModalOpen(false)}
        />
      )}

      {/* Adverse Determination Notice Drawer */}
      {activeApplication && policyEval && (
        <AdverseActionDrawer
          application={activeApplication}
          policyEvaluation={policyEval}
          isOpen={isAdverseDrawerOpen}
          onClose={() => setIsAdverseDrawerOpen(false)}
        />
      )}

      {/* 15 Golden Scenarios Test Suite Runner */}
      <GoldenScenariosRunner
        scenarios={scenarios}
        isOpen={isTestRunnerOpen}
        onClose={() => setIsTestRunnerOpen(false)}
        onSelectScenario={handleSelectScenario}
        activeScenarioId={scenarios.find((s) => s.application_id === activeAppId)?.id}
      />
    </div>
  );
}
export default App;
