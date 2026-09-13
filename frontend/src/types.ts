export interface RecoveryCandidate {
  id: string;
  case_id: string;
  vendor_id: string;
  part_id?: string;
  vendor_name: string;
  part_number: string;
  condition: string;
  part_cost: number;
  freight_cost: number;
  total_landed_cost: number;
  estimated_eta_hours: number;
  shipping_method: string;
  documentation_status: string;
  doc_notes?: string;
  vendor_reliability_score: number;
  overall_rank: number;
  is_recommended: boolean;
  is_flagged: boolean;
  flag_reason?: string;
  confidence: number;
  carbon_kg?: number;
  recovery_score?: number;
  score_breakdown?: {
    delivery: number;
    reliability: number;
    cost: number;
    compliance: number;
    carbon: number;
  };
}

export interface ToolCallRecord {
  id: string;
  agent: string;
  tool: string;
  args: any;
  result: any;
  duration_ms: number;
  status: string;
  timestamp: string;
}

export interface DecisionTraceStep {
  step: string;
  goal: string;
  observation: string;
  reasoning: string;
  action: string;
  outcome: string;
  timestamp: string;
}

export interface DisruptionRecord {
  id: string;
  type: string;
  target: string;
  description: string;
  timestamp: string;
}

export interface VerificationReport {
  verification_status: 'PASS' | 'FAIL';
  objective: string;
  constraints_passed: string;
  constraint_details?: Record<string, boolean>;
  expected_recovery_time: string;
  deadline: string;
  safety_margin: string;
  margin_hours: number;
  supplier_name: string;
  carrier: string;
  total_landed_cost: number;
  carbon_kg: number;
  verified_at: string;
  digital_certificate_id: string;
}

export interface ShipmentRecord {
  id: string;
  case_id: string;
  supplier_id: string;
  carrier: string;
  origin: string;
  destination: string;
  tracking_awb: string;
  status: string;
  eta_hours: number;
  carbon_kg: number;
  created_at: string;
}

export interface AgentResult {
  id: string;
  case_id: string;
  specialist_name: string;
  status: string;
  confidence: number;
  raw_output: any;
  execution_time_ms: number;
  created_at: string;
}

export interface ValidationResult {
  id: string;
  case_id: string;
  status: string;
  conflicts_detected: any[];
  flagged_candidates: any[];
  valid_candidates: any[];
  risk_level: string;
  confidence: number;
  requires_human_review: boolean;
  reasoning_summary: string;
}

export interface RecoveryAction {
  id: string;
  case_id: string;
  action_type: string;
  reference_number: string;
  title: string;
  details?: any;
  is_demo_action: boolean;
  created_at: string;
}

export interface SquawkCase {
  id: string;
  tail_number?: string;
  aircraft_type?: string;
  defect_description: string;
  raw_intake_payload?: any;
  ata_chapter?: string;
  part_number?: string;
  part_name?: string;
  priority: 'AOG' | 'URGENT' | 'ROUTINE';
  location: string;
  current_stage: string;
  confidence_score: number;
  risk_level: string;
  status: string;
  estimated_recovery_hours?: number;
  deadline_hours?: number;
  max_acceptable_cost?: number;
  carbon_kg?: number;
  replan_count?: number;
  is_malformed: boolean;
  malformed_reason?: string;
  is_demo?: boolean;
  demo_key?: string;
  demo_badge?: string;
  tool_call_history?: ToolCallRecord[];
  decision_trace?: DecisionTraceStep[];
  disruptions_log?: DisruptionRecord[];
  verification_report?: VerificationReport;
  active_plan?: any;
  scoring_weights?: Record<string, number>;
  created_at: string;
  updated_at: string;
  candidates: RecoveryCandidate[];
  agent_results: AgentResult[];
  validation_result?: ValidationResult;
  recovery_actions: RecoveryAction[];
  shipments?: ShipmentRecord[];
}

export interface Vendor {
  id: string;
  name: string;
  location_hub: string;
  cage_code?: string;
  base_rating: number;
  verified_orders_count: number;
  on_time_deliveries: number;
  avg_delay_minutes: number;
  doc_issues_count: number;
  calculated_reliability: number;
  contact_email?: string;
  contact_aog_desk?: string;
}

export interface VendorMemoryStat {
  vendor_id?: string;
  vendor_name: string;
  hub: string;
  orders: number;
  on_time_rate: number;
  avg_delay_min: number;
  doc_defects: number;
  reliability_pct: number;
}

export interface ActivityLog {
  id: string;
  case_id?: string;
  timestamp: string;
  category: string;
  title: string;
  details?: string;
  meta_info?: any;
}

export interface BatchProcessResult {
  batch_id: string;
  total_cases_received: number;
  successfully_processed: number;
  ready_for_approval: number;
  auto_cleared?: number;
  need_more_info?: number;
  escalated_to_humans: number;
  validator_rejections_cheapest?: number;
  documentation_conflicts: number;
  vendor_search_timeouts: number;
  malformed_inputs: number;
  total_runtime_seconds: number;
  total_ai_agent_calls: number;
  total_prompt_tokens?: number;
  total_completion_tokens?: number;
  total_tokens?: number;
  total_cost_usd?: number;
  approximate_cost_usd: number;
  average_cost_per_case_usd?: number;
  success_rate_percent: number;
}
