import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  Clock,
  CheckCircle,
  Copy,
  ExternalLink,
  Upload,
  AlertTriangle,
  FileCheck2,
  Lock,
  Search,
  Database,
  ArrowRight,
  Eye,
  Plus,
} from 'lucide-react';
import { CreditApplication, DocumentType, EvidenceItem, UserRole } from '../types';

interface EvidenceWorkbenchProps {
  application: CreditApplication;
  evidenceItems: EvidenceItem[];
  onUploadEvidence: (payload: {
    doc_type: DocumentType;
    file_name: string;
    raw_payload: string;
    extracted_metrics?: Record<string, number>;
  }) => Promise<void>;
  userRole: UserRole;
  selectedEvidenceId?: string;
  onSelectEvidence?: (id: string) => void;
}

export const EvidenceWorkbench: React.FC<EvidenceWorkbenchProps> = ({
  application,
  evidenceItems,
  onUploadEvidence,
  userRole,
  selectedEvidenceId,
  onSelectEvidence,
}) => {
  const [activeDocId, setActiveDocId] = useState<string>(
    selectedEvidenceId || (evidenceItems[0] ? evidenceItems[0].evidence_id : '')
  );
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadDocType, setUploadDocType] = useState<DocumentType>(DocumentType.BANK_STATEMENT);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadPayload, setUploadPayload] = useState('');
  const [uploadMetricName, setUploadMetricName] = useState('M_BANK_INFLOW_12M');
  const [uploadMetricValue, setUploadMetricValue] = useState('500000');
  const [isUploading, setIsUploading] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const activeDoc = evidenceItems.find((e) => e.evidence_id === activeDocId) || evidenceItems[0];

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleFormUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadPayload.trim()) return;

    setIsUploading(true);
    try {
      const extracted: Record<string, number> = {};
      if (uploadMetricName && uploadMetricValue) {
        extracted[uploadMetricName] = parseFloat(uploadMetricValue);
      }

      await onUploadEvidence({
        doc_type: uploadDocType,
        file_name: uploadFileName.trim() || `${uploadDocType.toLowerCase()}_sample.pdf`,
        raw_payload: uploadPayload,
        extracted_metrics: extracted,
      });

      setShowUploadModal(false);
      setUploadPayload('');
      setUploadFileName('');
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const getDocTypeIcon = (type: DocumentType) => {
    switch (type) {
      case DocumentType.BANK_STATEMENT:
        return '🏦';
      case DocumentType.TAX_GST_FILING:
        return '📑';
      case DocumentType.AUDITED_FINANCIALS:
        return '📊';
      case DocumentType.BUREAU_REPORT:
        return '🛡️';
      case DocumentType.BORROWER_COMMENTARY:
        return '📝';
    }
  };

  return (
    <div className="space-y-6">
      {/* Evidence & Reconciliation Header */}
      <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Evidence Vault & Cryptographic Provenance
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Immutable multi-source evidence repository with SHA-256 checksums, freshness tracking, and token extraction.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-cyan-900/20 flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Ingest Raw Document</span>
        </button>
      </div>

      {/* Entity Resolution Crosswalk Matrix (PRD Section 6) */}
      <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white tracking-tight uppercase">
              Entity Resolution & Identity Crosswalk Matrix
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
            Match Confidence: {(application.identity.identity_match_score * 100).toFixed(0)}%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-sans">LOS Intake Record</span>
            <p className="font-bold text-slate-200 mt-1">{application.identity.legal_name}</p>
            <div className="mt-2 text-[11px] text-slate-400 space-y-0.5">
              <div>Tax ID: <span className="text-cyan-300">{application.identity.tax_token}</span></div>
              <div>Reg No: {application.identity.registration_no}</div>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-sans">Official Tax / GST Portal</span>
            <p className="font-bold text-slate-200 mt-1">
              {application.identity.has_mismatch_flag
                ? 'Nexus Global Holdings LLC (Mismatch)'
                : application.identity.legal_name}
            </p>
            <div className="mt-2 text-[11px] text-slate-400 space-y-0.5">
              <div>
                Tax ID:{' '}
                <span
                  className={
                    application.identity.has_mismatch_flag ? 'text-rose-400 font-bold' : 'text-cyan-300'
                  }
                >
                  {application.identity.has_mismatch_flag ? 'TAX-US-77119999 (DELTA)' : application.identity.tax_token}
                </span>
              </div>
              <div>Status: Certified Active</div>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px] uppercase font-sans">Commercial Credit Bureau</span>
            <p className="font-bold text-slate-200 mt-1">{application.identity.legal_name}</p>
            <div className="mt-2 text-[11px] text-slate-400 space-y-0.5">
              <div>Registry: {application.identity.jurisdiction}</div>
              <div>Guarantors: {application.identity.guarantors.length} Verified</div>
            </div>
          </div>
        </div>
      </div>

      {/* Split-Screen Evidence Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Documents List (4 Columns) */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider px-1">
            Ingested Evidence Items ({evidenceItems.length})
          </h3>

          <div className="space-y-2.5">
            {evidenceItems.map((doc) => {
              const isSelected = activeDoc?.evidence_id === doc.evidence_id;
              return (
                <div
                  key={doc.evidence_id}
                  onClick={() => {
                    setActiveDocId(doc.evidence_id);
                    if (onSelectEvidence) onSelectEvidence(doc.evidence_id);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500/80 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-500/30'
                      : 'bg-slate-900 hover:bg-slate-850 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{getDocTypeIcon(doc.doc_type)}</span>
                      <div>
                        <h4 className="text-xs font-bold text-white truncate max-w-[220px]">
                          {doc.file_name}
                        </h4>
                        <span className="text-[10px] font-mono text-cyan-400">{doc.doc_type}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {doc.evidence_id}
                    </span>
                  </div>

                  {/* Hash & Freshness row */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                      <Lock className="w-3 h-3 text-slate-500" />
                      <span className="truncate">{doc.sha256_hash.slice(0, 16)}...</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span className={doc.freshness_days > 60 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                        {doc.freshness_days}d Freshness
                      </span>
                      {doc.freshness_days > 60 && (
                        <span className="text-[9px] bg-rose-950 text-rose-300 px-1 rounded border border-rose-800">
                          STALE
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Split-Screen Inspector & Document Payload Viewer (7 Columns) */}
        <div className="lg:col-span-7">
          {activeDoc ? (
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl flex flex-col h-full">
              {/* Document Inspector Header */}
              <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getDocTypeIcon(activeDoc.doc_type)}</span>
                    <h3 className="text-sm font-bold text-white">{activeDoc.file_name}</h3>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Source: {activeDoc.source_authority} | Confidence: {(activeDoc.confidence_score * 100).toFixed(0)}%
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyHash(activeDoc.sha256_hash)}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-xs font-mono text-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Copy SHA-256 Cryptographic Checksum"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedHash === activeDoc.sha256_hash ? 'Copied!' : 'Copy SHA-256'}</span>
                  </button>
                </div>
              </div>

              {/* Checksum & Metadata Bar */}
              <div className="bg-slate-950/60 px-5 py-2.5 border-b border-slate-800/80 text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-cyan-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SHA-256:</span>
                  <span className="text-slate-200 select-all">{activeDoc.sha256_hash}</span>
                </div>
                <div className="text-slate-500">Ingested: {new Date(activeDoc.ingested_at).toLocaleDateString()}</div>
              </div>

              {/* Document Text / Token Highlight Pane */}
              <div className="p-5 flex-1 bg-slate-950/40 overflow-y-auto max-h-[480px]">
                <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider">Raw Ingested Text Payload</span>
                  <span className="text-[11px] text-slate-500 font-mono">Parser Mode: Canonical Token Extractor</span>
                </div>

                <pre className="font-mono text-xs text-slate-200 bg-slate-950 p-4 rounded-lg border border-slate-800 whitespace-pre-wrap leading-relaxed">
                  {activeDoc.raw_payload}
                </pre>

                {/* Extracted Highlight Tokens */}
                {activeDoc.highlight_tokens && activeDoc.highlight_tokens.length > 0 && (
                  <div className="mt-4 p-3.5 bg-slate-900/90 rounded-lg border border-slate-800">
                    <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      Extracted Financial Tokens (Verified Grounding)
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                      {activeDoc.highlight_tokens.map((tok, i) => (
                        <div key={i} className="bg-slate-950 p-2 rounded border border-slate-800">
                          <span className="text-[10px] text-slate-400 block">{tok.label}</span>
                          <span className="font-bold text-emerald-400">{tok.value}</span>
                          <span className="text-[9px] text-slate-500 block">{tok.position}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8 bg-slate-900 rounded-xl border border-slate-800 text-slate-500 text-xs">
              Select a document from the vault to inspect provenance and text tokens.
            </div>
          )}
        </div>
      </div>

      {/* Ingestion Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Ingest Raw Evidence Document</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormUpload} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Document Type</label>
                  <select
                    value={uploadDocType}
                    onChange={(e) => setUploadDocType(e.target.value as DocumentType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none"
                  >
                    <option value={DocumentType.BANK_STATEMENT}>Bank Statement</option>
                    <option value={DocumentType.TAX_GST_FILING}>Tax / GST Filing</option>
                    <option value={DocumentType.AUDITED_FINANCIALS}>Audited Financials (GAAP)</option>
                    <option value={DocumentType.BUREAU_REPORT}>Credit Bureau Report</option>
                    <option value={DocumentType.BORROWER_COMMENTARY}>Borrower Commentary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">File Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Q2_Bank_Statement.pdf"
                    value={uploadFileName}
                    onChange={(e) => setUploadFileName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Raw Document Text Payload (SHA-256 will be calculated automatically)
                </label>
                <textarea
                  rows={5}
                  placeholder="Paste raw text payload from bank statements, audited P&L, or tax returns..."
                  value={uploadPayload}
                  onChange={(e) => setUploadPayload(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 font-mono text-xs outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Metric Tag (Optional)</label>
                  <select
                    value={uploadMetricName}
                    onChange={(e) => setUploadMetricName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-mono text-xs outline-none"
                  >
                    <option value="M_BANK_INFLOW_12M">M_BANK_INFLOW_12M (Bank Credits)</option>
                    <option value="M_GST_TURNOVER_12M">M_GST_TURNOVER_12M (Tax Sales)</option>
                    <option value="M_REC_REVENUE_FY">M_REC_REVENUE_FY (Audited Revenue)</option>
                    <option value="M_DSCR_CALC">M_DSCR_CALC (Coverage Ratio)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-[11px] mb-1">Extracted Value ($ or Ratio)</label>
                  <input
                    type="number"
                    step="any"
                    value={uploadMetricValue}
                    onChange={(e) => setUploadMetricValue(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-slate-200 font-mono text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !uploadPayload.trim()}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? 'Computing Checksum...' : 'Ingest & Compute SHA-256'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
