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

export interface ResourceItemStatus {
  status: string;
  details: string;
  ready: boolean;
}

export interface ResourceCheck {
  technicians: ResourceItemStatus;
  facility: ResourceItemStatus;
  parts: ResourceItemStatus;
  bottleneck_summary: string;
  readiness_score: number;
}

export interface RecoveryOptionItem {
  option_id: string;
  title: string;
  strategy: string;
  expected_operational_impact: string;
  dependencies: string[];
  estimated_recovery_window: string;
  estimated_recovery_hours: number;
  confidence: number;
  confidence_reason?: string;
  risks: string[];
  total_cost: number;
  is_recommended: boolean;
  human_approval_required: boolean;
}

export interface WhyRecommendation {
  evidence_considered: string[];
  not_considered_unavailable: string[];
}

export interface TimelineEvent {
  time: string;
  title: string;
  desc: string;
  actor: string;
  status: string;
}

export interface IncidentIntelligence {
  summary: string;
  category: string;
  severity: string;
  operational_impact: string;
  confidence: number;
  confidence_reason: string;
  evidence: string[];
  missing_information: string[];
  contributing_factors: string[];
  dependencies: string[];
  resource_check: ResourceCheck;
  recovery_options: RecoveryOptionItem[];
  why_recommendation: WhyRecommendation;
  timeline: TimelineEvent[];
  human_verification_required: boolean;
  ai_failed?: boolean;
  ai_failure_reason?: string | null;
}

export interface RecoveryActionItem {
  id: string;
  step_number: number;
  title: string;
  description: string;
  assigned_role: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Blocked';
  updated_at: string;
}

export interface RecoveryUpdate {
  id: string;
  case_id: string;
  incident_id?: string;
  source: 'VAKH_INTAKE' | 'SQUAWK_AI' | 'TECHNICIAN' | 'OPERATIONS' | 'VAKH' | 'SQUAWK';
  message: string;
  author: string;
  status?: string;
  action_id?: string;
  action_status?: string;
  vakh_sync_status: 'SYNCED' | 'PENDING' | 'LOCAL_FALLBACK';
  vakh_update_id?: string;
  created_at: string;
}

export interface IncidentResolution {
  id: string;
  case_id: string;
  incident_id?: string;
  actual_resolution: string;
  actual_recovery_time_hours: number;
  parts_used: string[];
  root_cause: string;
  delay_minutes: number;
  maintenance_team?: string;
  additional_observations?: string;
  lessons_learned?: string;
  vakh_resolution_id?: string;
  resolved_by?: string;
  created_at: string;
}

export interface VakhIntakePayload {
  aircraft_registration: string;
  aircraft_type: string;
  operator: string;
  airport: string;
  flight_number?: string;
  defect_category: string;
  defect_description: string;
  reported_symptoms?: string;
  operational_impact?: string;
  departure_time?: string;
  estimated_time_available_hours?: number;
  mel_cdl_info?: string;
  required_maintenance_team?: string;
  required_parts?: string;
  reporter_name: string;
  contact_information: string;
  vakh_submission_id?: string;
  vakh_record_url?: string;
}

export interface VakhWorkspaceData {
  workspace_id: string;
  vakh_submission_id?: string;
  vakh_record_url: string;
  vakh_form_key: string;
  last_synced_at: string;
  incident: {
    incident_id: string;
    aircraft: string;
    aircraft_type: string;
    location: string;
    flight_number?: string;
    defect: string;
    defect_category?: string;
    severity?: string;
    urgency?: string;
    status: string;
    confidence_score?: number;
    hours_remaining?: number;
  };
  recovery: {
    current_status: string;
    assigned_team?: string;
    required_part?: string;
    recommended_vendor?: string;
    estimated_recovery_hours?: number;
    recovery_actions: RecoveryActionItem[];
  };
  updates: RecoveryUpdate[];
  resolution?: IncidentResolution | null;
  views: {
    active_view: string;
    available_views: string[];
  };
}

export interface HistoricalCase {
  id?: string;
  case_id?: string;
  tail_number: string;
  aircraft_type: string;
  defect_category: string;
  defect_description?: string;
  part_number?: string;
  severity?: string;
  operator?: string;
  airport?: string;
  location?: string;
  status?: string;
  recovery_plan_summary?: string;
  vakh_submission_id?: string;
  vakh_record_url?: string;
  created_at?: string;
  resolved_at?: string;
  resolution?: {
    actual_resolution: string;
    actual_recovery_time_hours: number;
    parts_used: string[];
    root_cause: string;
    delay_minutes: number;
    lessons_learned?: string;
    maintenance_team?: string;
    resolved_by?: string;
    vakh_resolution_id?: string;
  } | null;
}

export interface HistoricalLearningResponse {
  total_resolved_incidents: number;
  average_recovery_time_hours: number;
  total_delay_minutes_logged: number;
  defect_categories_distribution: Record<string, number>;
  historical_cases: HistoricalCase[];
  learning_system_status?: {
    vendor_memory_connected?: boolean;
    airworthiness_rules_verified?: boolean;
    historical_retrieval_active?: boolean;
    description?: string;
    mechanism?: string;
    active?: boolean;
    note?: string;
  };
}

export interface AogTimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  source: 'VAKH' | 'SQUAWK' | 'TECHNICIAN' | 'LOGISTICS';
  stage: string;
  badge_color?: string;
}

export interface AogTimelineResponse {
  case_id: string;
  tail_number: string;
  vakh_submission_id?: string;
  vakh_record_url?: string;
  total_events: number;
  timeline: AogTimelineEvent[];
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
  incident_intelligence?: IncidentIntelligence;
  scoring_weights?: Record<string, number>;
  created_at: string;
  updated_at: string;
  candidates: RecoveryCandidate[];
  agent_results: AgentResult[];
  validation_result?: ValidationResult;
  recovery_actions: RecoveryAction[];
  shipments?: ShipmentRecord[];
  
  // Vakh Integration Fields
  vakh_submission_id?: string;
  vakh_record_url?: string;
  vakh_form_id?: string;
  vakh_synced_at?: string;
  operator?: string;
  airport?: string;
  flight_number?: string;
  defect_category?: string;
  severity?: string;
  urgency?: string;
  reported_symptoms?: string;
  operational_impact?: string;
  mel_cdl_info?: string;
  required_maintenance_team?: string;
  reporter_name?: string;
  reporter_contact?: string;
  recovery_actions_list?: RecoveryActionItem[];
  resolved_at?: string;
  resolution?: IncidentResolution;
  recovery_updates?: RecoveryUpdate[];
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
