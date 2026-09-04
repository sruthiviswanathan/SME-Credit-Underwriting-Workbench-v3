/**
 * SME Credit Underwriting Intelligence Workbench
 * Canonical TypeScript Data Types & Domain Models
 */

export enum UserRole {
  RELATIONSHIP_MANAGER = "RELATIONSHIP_MANAGER",
  CREDIT_ANALYST = "CREDIT_ANALYST",
  SENIOR_UNDERWRITER = "SENIOR_UNDERWRITER",
  CREDIT_AUTHORITY = "CREDIT_AUTHORITY",
}

export enum PolicyStatus {
  PASS = "PASS",
  FAIL = "FAIL",
  REFER = "REFER",
}

export enum DecisionAction {
  APPROVED = "APPROVED",
  DECLINED = "DECLINED",
  CONDITIONED = "CONDITIONED",
  OVERRIDDEN = "OVERRIDDEN",
}

export enum DocumentType {
  BANK_STATEMENT = "BANK_STATEMENT",
  TAX_GST_FILING = "TAX_GST_FILING",
  AUDITED_FINANCIALS = "AUDITED_FINANCIALS",
  BUREAU_REPORT = "BUREAU_REPORT",
  BORROWER_COMMENTARY = "BORROWER_COMMENTARY",
}

export interface EvidenceItem {
  evidence_id: string;
  tenant_id: string;
  application_id: string;
  doc_type: DocumentType;
  file_name: string;
  raw_payload: string;
  sha256_hash: string;
  ingested_at: string;
  freshness_days: number;
  is_stale: boolean;
  source_authority: string;
  confidence_score: number;
  highlight_tokens?: { label: string; value: string | number; position: string }[];
}

export interface FinancialMeasure {
  metric_id: string;
  label: string;
  value: number;
  currency: string;
  source_type: DocumentType;
  evidence_id: string;
  as_of_date: string;
  is_verified: boolean;
  explanation: string;
}

export interface RuleEvaluation {
  rule_id: string;
  name: string;
  description: string;
  threshold: number | string;
  actual: number | string;
  result: "PASS" | "FAIL" | "REFER";
  severity: "CRITICAL" | "MODERATE" | "ADVISORY";
  is_overridable: boolean;
  notes?: string;
}

export interface PolicyEvaluation {
  evaluation_id: string;
  tenant_id: string;
  application_id: string;
  engine_version: string;
  status: PolicyStatus;
  rules_evaluated: RuleEvaluation[];
  evaluated_at: string;
  dscr_calculated?: number;
  revenue_vs_inflow_divergence_pct?: number;
  summary_rationale: string;
}

export interface AuditRecord {
  audit_id: string;
  tenant_id: string;
  application_id: string;
  user_id: string;
  user_role: UserRole;
  action: string;
  details: Record<string, any>;
  timestamp: string;
  sha256_verification?: string;
}

export interface HumanDecisionRecord {
  decision_id: string;
  application_id: string;
  tenant_id: string;
  human_decider: string;
  user_role: UserRole;
  recorded_action: DecisionAction;
  policy_evaluation_id: string;
  approved_facility_amount?: number;
  conditions?: string[];
  justification_rationale: string;
  override_reason?: string;
  adverse_reasons?: string[];
  timestamp: string;
  recourse_deadline?: string;
}

export interface IdentityProfile {
  tax_token: string;
  registration_no: string;
  legal_name: string;
  entity_type: "CORPORATION" | "LLC" | "SOLE_TRADER" | "PARTNERSHIP";
  industry: string;
  incorporation_year: number;
  jurisdiction: string;
  identity_match_score: number;
  has_mismatch_flag: boolean;
  mismatch_details?: string;
  guarantors: {
    name: string;
    tax_token: string;
    relationship: string;
    net_worth: number;
    credit_score: number;
    has_default: boolean;
  }[];
}

export interface CreditApplication {
  application_id: string;
  tenant_id: string;
  tenant_name: string;
  borrower_name: string;
  identity: IdentityProfile;
  requested_amount: number;
  facility_type: "TERM_LOAN" | "REVOLVING_LOC" | "TRADE_FINANCE" | "EQUIPMENT_LEASE";
  tenor_months: number;
  interest_rate_target: number;
  status: "INGESTED" | "EVALUATED" | "MEMO_DRAFTED" | "DECIDED";
  created_at: string;
  assigned_analyst: string;
  assigned_underwriter: string;
  evidence_ids: string[];
  current_policy_eval?: PolicyEvaluation;
  latest_decision?: HumanDecisionRecord;
  has_prompt_injection: boolean;
  injection_details?: string;
  is_restricted_eval?: boolean;
  underwriter_memo?: string;
}

export interface UntrustedChunk {
  chunk_id: string;
  source_file: string;
  content: string;
  original_raw?: string;
  has_injection_pattern: boolean;
}

export interface ContextPacket {
  context_packet_id: string;
  application_id: string;
  tenant_id: string;
  timestamp: string;
  authoritative_policy: {
    engine_version: string;
    evaluation_id: string;
    status: PolicyStatus;
    rules_evaluated: RuleEvaluation[];
  };
  verified_financial_measures: {
    M_BANK_INFLOW_12M: number | null;
    M_GST_TURNOVER_12M: number | null;
    M_REC_REVENUE_FY: number | null;
    M_DSCR_CALC: number | null;
    [key: string]: number | null;
  };
  entity_resolution: {
    tax_token: string;
    legal_name: string;
    has_mismatch: boolean;
  };
  untrusted_document_chunks: UntrustedChunk[];
  retrieval_metrics: {
    graph_nodes_traversed: number;
    vector_chunks_matched: number;
    tenant_filter_enforced: boolean;
    latency_ms: number;
  };
}

export interface GraphNode {
  id: string;
  label: string;
  type: "PARTY" | "APPLICATION" | "MEASURE" | "EVIDENCE" | "POLICY" | "GUARANTOR" | "BUREAU";
  properties: Record<string, any>;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  properties?: Record<string, any>;
}

export interface GoldenScenario {
  id: string;
  code: string;
  title: string;
  category: string;
  stress_condition: string;
  application_id: string;
  tenant_id: string;
  expected_policy_status: PolicyStatus;
  key_assertion: string;
  description: string;
  tags: string[];
}
