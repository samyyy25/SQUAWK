import React, { useState } from 'react';
import { 
  ArrowLeft, 
  RotateCw,
  Sparkles,
  ExternalLink,
  Kanban,
  MessageSquare,
  CheckCircle2,
  Clock,
  Wrench,
  AlertTriangle,
  ShieldCheck,
  Check
} from 'lucide-react';
import { SquawkCase, RecoveryCandidate, RecoveryActionItem } from '../types';
import { api } from '../api';
import { WorkflowTimeline } from './WorkflowTimeline';
import { AgentStatusCards } from './AgentStatusCards';
import { ValidatorComparison } from './ValidatorComparison';
import { RecommendationCard } from './RecommendationCard';
import { HumanApprovalPanel } from './HumanApprovalPanel';
import { LiveAgentTimeline } from './LiveAgentTimeline';
import { DecisionTrace } from './DecisionTrace';
import { DisruptionSimulator } from './DisruptionSimulator';
import { VerificationPanel } from './VerificationPanel';
import { FlightRecoveryMap } from './FlightRecoveryMap';
import { IncidentIntelligencePanel } from './IncidentIntelligencePanel';
import { VakhWorkspaceModal } from './VakhWorkspaceModal';
import { ResolutionModal } from './ResolutionModal';

interface CaseDetailProps {
  caseData: SquawkCase;
  onBack: () => void;
  onRefreshCase: () => void;
}

export const CaseDetail: React.FC<CaseDetailProps> = ({
  caseData,
  onBack,
  onRefreshCase
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<RecoveryCandidate | null>(
    caseData.candidates.find(c => c.is_recommended) || caseData.candidates[0] || null
  );

  const [approverName, setApproverName] = useState('Lead Engineer (MCC Delhi)');
  const [approverLicense, setApproverLicense] = useState('A&P-884920');
  const [approvalNotes, setApprovalNotes] = useState('Authorized recommended rotable procurement route.');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Vakh Workspace & Resolution Modal States
  const [showVakhWorkspace, setShowVakhWorkspace] = useState(false);
  const [showResolutionModal, setShowResolutionModal] = useState(false);

  // Outcome submission modal for completed cases
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [actualDeliveryHours, setActualDeliveryHours] = useState(4.5);
  const [actualCost, setActualCost] = useState(14700);
  const [docAccepted, setDocAccepted] = useState(true);
  const [vendorRating, setVendorRating] = useState(5);
  const [outcomeNotes, setOutcomeNotes] = useState('Flawless delivery, 8130-3 tag verified on arrival at DEL.');

  const handleApprove = async () => {
    setIsProcessingAction(true);
    try {
      await api.approveCase(caseData.id, {
        selected_candidate_id: selectedCandidate?.id,
        decision: 'APPROVED',
        approver_name: approverName,
        approver_license: approverLicense,
        notes: approvalNotes || 'Approved recommended rotable procurement route.'
      });
      setIsProcessingAction(false);
      onRefreshCase();
    } catch (err: any) {
      alert('Approval error: ' + err.message);
      setIsProcessingAction(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Please state rejection justification for maintenance audit log:');
    if (!reason) return;
    setIsProcessingAction(true);
    try {
      await api.rejectCase(caseData.id, {
        decision: 'REJECTED',
        approver_name: approverName,
        approver_license: approverLicense,
        notes: reason
      });
      setIsProcessingAction(false);
      onRefreshCase();
    } catch (err: any) {
      alert('Rejection error: ' + err.message);
      setIsProcessingAction(false);
    }
  };

  const handleRequestInfo = async () => {
    const query = prompt('Enter technical inquiry for engineering / vendor desk:');
    if (!query) return;
    setIsProcessingAction(true);
    try {
      await api.requestInfoCase(caseData.id, {
        decision: 'REQUEST_MORE_INFO',
        approver_name: approverName,
        approver_license: approverLicense,
        notes: query
      });
      setIsProcessingAction(false);
      onRefreshCase();
    } catch (err: any) {
      alert('Error requesting info: ' + err.message);
      setIsProcessingAction(false);
    }
  };

  const handleActionStatusToggle = async (actionId: string, newStatus: string) => {
    try {
      await api.updateRecoveryActionStatus(caseData.id, actionId, newStatus);
      onRefreshCase();
    } catch (err: any) {
      alert('Error updating action status: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleOutcomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;
    try {
      await api.submitOutcome(caseData.id, {
        vendor_id: selectedCandidate.vendor_id,
        predicted_eta_hours: selectedCandidate.estimated_eta_hours,
        actual_delivery_hours: actualDeliveryHours,
        predicted_cost: selectedCandidate.total_landed_cost,
        actual_cost: actualCost,
        documentation_accepted: docAccepted,
        recovery_successful: true,
        vendor_performance_rating: vendorRating,
        operator_notes: outcomeNotes
      });
      setShowOutcomeModal(false);
      onRefreshCase();
    } catch (err: any) {
      alert('Error submitting outcome: ' + err.message);
    }
  };

  const recommendedCandidate = selectedCandidate || caseData.candidates.find(c => c.is_recommended) || caseData.candidates[0];
  const recoveryActions: RecoveryActionItem[] = caseData.recovery_actions_list || [];

  return (
    <div className="space-y-4 max-w-7xl mx-auto text-[#252820]">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(217,166,46,0.3)] pb-3">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onBack}
            className="px-3 py-1.5 rounded bg-[rgba(38,42,34,0.7)] hover:bg-[rgba(52,58,46,0.9)] text-[#F7F1E4] border border-[rgba(255,210,100,0.3)] transition flex items-center space-x-1.5 text-xs font-mono font-semibold cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#F0C75E]" />
            <span>BACK TO OVERVIEW</span>
          </button>

          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-lg font-bold text-[#252820] font-mono">{caseData.tail_number || 'VT-SQK'}</h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[rgba(217,166,46,0.18)] text-[#A87813] border border-[rgba(217,166,46,0.35)] font-bold">
                {caseData.id}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider bg-[#C85B43]/15 text-[#C85B43] border border-[#C85B43]/30">
                🔴 {caseData.priority || 'AOG'}
              </span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                caseData.status === 'Resolved'
                  ? 'bg-[#78966A]/20 text-[#4E6B42] border-[#78966A]/50'
                  : caseData.status === 'Approved' 
                  ? 'bg-[rgba(217,166,46,0.2)] text-[#A87813] border-[#D9A62E]' 
                  : 'bg-[#C85B43]/15 text-[#C85B43] border-[#C85B43]/30'
              }`}>
                {caseData.status}
              </span>
            </div>
            <p className="text-xs text-[#4A483E] mt-1 font-mono font-medium">{caseData.defect_description}</p>
          </div>
        </div>

        {/* Action button bar: Vakh Record, Update, Resolve */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
          {/* Vakh Record Button */}
          <button
            onClick={() => setShowVakhWorkspace(true)}
            className="px-3 py-1.5 rounded bg-gradient-to-r from-[#D9A62E] to-[#F0C75E] hover:from-[#F0C75E] hover:to-[#D9A62E] text-[#252820] border border-[#F0C75E] text-xs font-mono font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-md"
          >
            <Kanban className="w-3.5 h-3.5 text-[#252820]" />
            <span>OPEN VAKH RECORD</span>
          </button>

          {/* Update Operational Record Button */}
          <button
            onClick={() => setShowVakhWorkspace(true)}
            className="px-3 py-1.5 rounded bg-[rgba(38,42,34,0.7)] hover:bg-[rgba(52,58,46,0.9)] text-[#F7F1E4] border border-[rgba(255,210,100,0.3)] text-xs font-mono font-semibold transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#F0C75E]" />
            <span>UPDATE OPERATIONAL RECORD</span>
          </button>

          {/* Resolve Incident Button */}
          {caseData.status !== 'Resolved' ? (
            <button
              onClick={() => setShowResolutionModal(true)}
              className="px-3 py-1.5 rounded bg-[#78966A] hover:bg-[#68855B] text-white text-xs font-mono font-bold border border-[#78966A] transition flex items-center space-x-1.5 cursor-pointer shadow-md"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>RESOLVE INCIDENT</span>
            </button>
          ) : (
            <span className="px-2.5 py-1 rounded bg-[#78966A]/20 text-[#4E6B42] border border-[#78966A]/50 text-xs font-mono font-bold flex items-center space-x-1">
              <Check className="w-3.5 h-3.5" />
              <span>RESOLVED & ARCHIVED</span>
            </span>
          )}

          {caseData.status === 'Approved' && (
            <button 
              onClick={() => setShowOutcomeModal(true)}
              className="bg-[rgba(217,166,46,0.18)] hover:bg-[rgba(217,166,46,0.3)] text-[#A87813] text-xs font-mono font-bold px-3 py-1.5 rounded border border-[#D9A62E] transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>GATE OUTCOME</span>
            </button>
          )}

          <button 
            onClick={onRefreshCase}
            className="p-1.5 rounded bg-[rgba(38,42,34,0.7)] hover:bg-[rgba(52,58,46,0.9)] border border-[rgba(255,210,100,0.3)] text-[#D8D0BD] hover:text-white transition cursor-pointer"
            title="Refresh Case"
          >
            <RotateCw className="w-4 h-4 text-[#F0C75E]" />
          </button>
        </div>
      </div>

      {/* Case Overview Metadata Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(255,244,214,0.65)] rounded-xl p-3.5 text-xs font-mono shadow-md text-[#252820]">
        <div>
          <span className="text-[10px] text-[#8C8472] font-bold uppercase tracking-wider block">AIRCRAFT TYPE</span>
          <div className="text-[#252820] font-bold mt-0.5">{caseData.aircraft_type || 'Boeing 737-800'}</div>
        </div>
        <div>
          <span className="text-[10px] text-[#8C8472] font-bold uppercase tracking-wider block">STATION AIRPORT</span>
          <div className="text-[#252820] font-bold mt-0.5">{caseData.airport || caseData.location || 'DEL'}</div>
        </div>
        <div>
          <span className="text-[10px] text-[#8C8472] font-bold uppercase tracking-wider block">REQUIRED PART</span>
          <div className="text-[#252820] font-bold mt-0.5">{caseData.part_number || 'HP-2048'}</div>
        </div>
        <div>
          <span className="text-[10px] text-[#8C8472] font-bold uppercase tracking-wider block">ATA CHAPTER</span>
          <div className="text-[#4A483E] font-medium mt-0.5">{caseData.ata_chapter || '29 - Hydraulic Power'}</div>
        </div>
        <div>
          <span className="text-[10px] text-[#8C8472] font-bold uppercase tracking-wider block">VAKH SUBMISSION ID</span>
          <div className="text-[#A87813] font-bold mt-0.5 truncate" title={caseData.vakh_submission_id || 'vakh_sub_active'}>
            {caseData.vakh_submission_id || 'vakh_sub_active'}
          </div>
        </div>
        <div>
          <span className="text-[10px] text-[#8C8472] font-bold uppercase tracking-wider block">SAFETY STATUS</span>
          <div className="font-bold text-[#C85B43] mt-0.5">
            {caseData.status === 'Resolved' ? 'RELEASED TO OPS' : 'HUMAN REVIEW REQ'}
          </div>
        </div>
      </div>

      {/* RECOVERY PLAN: INTERACTIVE 8-STEP AVIATION MAINTENANCE PROTOCOL */}
      {recoveryActions.length > 0 && (
        <div className="p-4 rounded-xl bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(255,244,214,0.65)] space-y-3 font-mono shadow-md text-[#252820]">
          <div className="flex items-center justify-between border-b border-[rgba(217,166,46,0.3)] pb-2">
            <div className="flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-[#A87813]" />
              <h2 className="text-xs font-bold text-[#252820] uppercase tracking-wider">
                MANDATORY 8-STEP AOG RECOVERY PLAN (AMM / PART 145)
              </h2>
              <span className="text-[10px] px-2 py-0.2 rounded bg-[rgba(217,166,46,0.15)] text-[#A87813] border border-[#D9A62E]/50 font-bold">
                Vakh Synchronized Actions
              </span>
            </div>
            <div className="text-xs text-[#4A483E] font-sans">
              <span className="font-mono text-[#547348] font-bold">
                {recoveryActions.filter(a => a.status === 'Completed').length}/8 COMPLETED
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {recoveryActions.map(action => (
              <div 
                key={action.id}
                className={`p-2.5 rounded border transition space-y-1.5 shadow-sm ${
                  action.status === 'Completed'
                    ? 'bg-[#78966A]/15 border-[#78966A]/40'
                    : action.status === 'In Progress'
                    ? 'bg-[rgba(217,166,46,0.18)] border-[#D9A62E]'
                    : action.status === 'Blocked'
                    ? 'bg-[#C85B43]/15 border-[#C85B43]/40'
                    : 'bg-[rgba(255,248,235,0.7)] border-[rgba(217,166,46,0.25)]'
                }`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold text-[#4A483E]">STEP {action.step_number}</span>
                  <select
                    value={action.status}
                    onChange={(e) => handleActionStatusToggle(action.id, e.target.value)}
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold border focus:outline-none cursor-pointer ${
                      action.status === 'Completed'
                        ? 'bg-[#78966A]/20 text-[#4E6B42] border-[#78966A]/50'
                        : action.status === 'In Progress'
                        ? 'bg-[rgba(217,166,46,0.2)] text-[#A87813] border-[#D9A62E]'
                        : action.status === 'Blocked'
                        ? 'bg-[#C85B43]/20 text-[#C85B43] border-[#C85B43]/50'
                        : 'bg-white/80 text-[#4A483E] border-[rgba(217,166,46,0.3)]'
                    }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Blocked">Blocked</option>
                  </select>
                </div>

                <div className="text-xs font-bold text-[#252820] leading-tight">
                  {action.title}
                </div>

                <p className="text-[11px] text-[#4A483E] font-sans line-clamp-2">
                  {action.description}
                </p>

                <div className="text-[10px] text-[#8C8472] font-mono pt-1 border-t border-[rgba(217,166,46,0.2)]">
                  Lead: {action.assigned_role}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SQUAWK INCIDENT INTELLIGENCE & RECOVERY ORCHESTRATION PANEL */}
      <IncidentIntelligencePanel 
        caseData={caseData} 
        onRefresh={onRefreshCase} 
      />

      {/* TASK 3: END-TO-END VISUAL RECOVERY TIMELINE */}
      <WorkflowTimeline caseData={caseData} />

      {/* PARALLEL SPECIALIST AGENT STATUS CARDS */}
      <AgentStatusCards caseData={caseData} />

      {/* TACTICAL FLIGHT & RECOVERY MAP */}
      <FlightRecoveryMap 
        caseData={caseData}
        isDisrupted={caseData.status.includes('Disrupted') || caseData.current_stage === 'DISRUPTED'}
        isVerified={caseData.status.includes('Verified') || caseData.current_stage === 'VERIFIED'}
        replanCount={caseData.replan_count || 0}
      />

      {/* Controlled Disruption Simulator */}
      <DisruptionSimulator 
        caseId={caseData.id}
        isDisrupted={caseData.status.includes('Disrupted') || caseData.current_stage === 'DISRUPTED'}
        replanCount={caseData.replan_count || 0}
        onDisruptionTriggered={onRefreshCase}
        onReplanTriggered={onRefreshCase}
      />

      {/* Final Verification Certificate */}
      {caseData.verification_report && (
        <VerificationPanel 
          report={caseData.verification_report}
          onVerifyNow={async () => {
            await api.verifyRecovery(caseData.id);
            onRefreshCase();
          }}
        />
      )}

      {/* TASK 4: STRONG VALIDATOR COMPARISON TABLE & EXPLAINABILITY */}
      <ValidatorComparison 
        candidates={caseData.candidates}
        validationResult={caseData.validation_result}
        selectedCandidate={selectedCandidate}
        onSelectCandidate={setSelectedCandidate}
      />

      {/* TASK 9: WHY SQUAWK RECOMMENDS THIS */}
      {recommendedCandidate && (
        <RecommendationCard candidate={recommendedCandidate} />
      )}

      {/* Live Agent Timeline & Auditable Decision Trace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {caseData.tool_call_history && caseData.tool_call_history.length > 0 && (
          <LiveAgentTimeline toolCalls={caseData.tool_call_history} />
        )}
        {caseData.decision_trace && caseData.decision_trace.length > 0 && (
          <DecisionTrace trace={caseData.decision_trace} />
        )}
      </div>

      {/* TASK 5: CERTIFIED HUMAN APPROVAL GATE */}
      <HumanApprovalPanel 
        caseData={caseData}
        selectedCandidate={selectedCandidate}
        approverName={approverName}
        setApproverName={setApproverName}
        approverLicense={approverLicense}
        setApproverLicense={setApproverLicense}
        approvalNotes={approvalNotes}
        setApprovalNotes={setApprovalNotes}
        isProcessingAction={isProcessingAction}
        onApprove={handleApprove}
        onReject={handleReject}
        onRequestInfo={handleRequestInfo}
      />

      {/* Vakh Operational Workspace Modal */}
      <VakhWorkspaceModal
        isOpen={showVakhWorkspace}
        onClose={() => setShowVakhWorkspace(false)}
        squawkCase={caseData}
        onOpenResolutionModal={() => setShowResolutionModal(true)}
        onUpdateCase={() => onRefreshCase()}
      />

      {/* Resolution Modal */}
      <ResolutionModal
        isOpen={showResolutionModal}
        onClose={() => setShowResolutionModal(false)}
        squawkCase={caseData}
        onResolved={() => onRefreshCase()}
      />

      {/* Outcome Submission Modal for Vendor Memory feedback */}
      {showOutcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[rgba(26,29,23,0.96)] backdrop-blur-2xl border border-[rgba(255,210,100,0.3)] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-[#F7F1E4] font-mono">
            <h3 className="text-base font-bold text-[#F7F1E4] flex items-center space-x-2 font-sans">
              <Sparkles className="w-5 h-5 text-[#F0C75E]" />
              <span>RECORD VERIFIED GATE OUTCOME</span>
            </h3>
            <p className="text-xs text-[#D8D0BD] font-sans">
              Updates supplier memory model with physical turnaround performance.
            </p>

            <form onSubmit={handleOutcomeSubmit} className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[#A8A28E] block mb-1 text-[10px] font-bold uppercase">ACTUAL DELIVERY HOURS</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={actualDeliveryHours} 
                    onChange={e => setActualDeliveryHours(parseFloat(e.target.value))}
                    className="w-full bg-[rgba(18,20,15,0.8)] border border-[rgba(255,210,100,0.25)] rounded-lg p-2 text-[#F7F1E4] font-mono focus:outline-none focus:border-[#D9A62E]"
                  />
                </div>
                <div>
                  <label className="text-[#A8A28E] block mb-1 text-[10px] font-bold uppercase">ACTUAL LANDED COST ($)</label>
                  <input 
                    type="number" 
                    value={actualCost} 
                    onChange={e => setActualCost(parseFloat(e.target.value))}
                    className="w-full bg-[rgba(18,20,15,0.8)] border border-[rgba(255,210,100,0.25)] rounded-lg p-2 text-[#F7F1E4] font-mono focus:outline-none focus:border-[#D9A62E]"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <input 
                  type="checkbox" 
                  id="docAcceptedCheck"
                  checked={docAccepted} 
                  onChange={e => setDocAccepted(e.target.checked)}
                  className="rounded border-[rgba(255,210,100,0.3)] bg-[rgba(18,20,15,0.8)] accent-[#D9A62E]"
                />
                <label htmlFor="docAcceptedCheck" className="text-[#D8D0BD] font-sans text-xs">
                  FAA 8130-3 / EASA Form 1 documentation verified and accepted
                </label>
              </div>

              <div>
                <label className="text-[#A8A28E] text-[10px] block mb-1 font-bold uppercase">TECHOPS GATE NOTES</label>
                <input 
                  type="text" 
                  value={outcomeNotes} 
                  onChange={e => setOutcomeNotes(e.target.value)}
                  className="w-full bg-[rgba(18,20,15,0.8)] border border-[rgba(255,210,100,0.25)] rounded-lg p-2 text-xs text-[#F7F1E4] font-mono focus:outline-none focus:border-[#D9A62E]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowOutcomeModal(false)}
                  className="px-4 py-2 rounded-lg bg-[rgba(38,42,34,0.7)] text-[#F7F1E4] text-xs font-semibold cursor-pointer border border-[rgba(255,210,100,0.3)] hover:bg-[rgba(52,58,46,0.9)] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#D9A62E] to-[#F0C75E] hover:from-[#E2B139] hover:to-[#F7D475] text-[#252820] text-xs font-bold border border-[#F0C75E] cursor-pointer shadow-md transition"
                >
                  SAVE OUTCOME
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
