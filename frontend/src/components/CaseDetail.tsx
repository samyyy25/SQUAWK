import React, { useState } from 'react';
import { 
  ArrowLeft, 
  RotateCw,
  Sparkles
} from 'lucide-react';
import { SquawkCase, RecoveryCandidate } from '../types';
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

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto bg-[#000000] text-neutral-200">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E1E1E] pb-3">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onBack}
            className="px-3 py-1.5 rounded bg-[#0D0D0D] hover:bg-[#830000]/30 text-neutral-300 hover:text-white border border-[#1E1E1E] hover:border-[#830000] transition flex items-center space-x-1.5 text-xs font-mono font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#BC0202]" />
            <span>BACK TO OVERVIEW</span>
          </button>

          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-lg font-bold text-white font-mono">{caseData.tail_number || 'VT-SQK'}</h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#0D0D0D] text-neutral-400 border border-[#1E1E1E]">
                {caseData.id}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider bg-[#000000] text-[#FF0000] border border-[#FF0000]">
                🔴 {caseData.priority || 'AOG'}
              </span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                caseData.status === 'Approved' ? 'bg-[#000000] text-white border-[#830000]' : 'bg-[#0D0D0D] text-[#BC0202] border-[#BC0202]'
              }`}>
                {caseData.status}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 font-mono">{caseData.defect_description}</p>
          </div>
        </div>

        {/* Action button if already approved */}
        <div className="flex items-center space-x-2.5">
          {caseData.status === 'Approved' && (
            <button 
              onClick={() => setShowOutcomeModal(true)}
              className="bg-[#830000] hover:bg-[#BC0202] text-white text-xs font-mono font-bold px-3 py-1.5 rounded border border-[#BC0202] transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>RECORD GATE OUTCOME</span>
            </button>
          )}
          <button 
            onClick={onRefreshCase}
            className="p-2 rounded bg-[#0D0D0D] hover:bg-[#830000]/30 border border-[#1E1E1E] text-neutral-300 hover:text-white transition cursor-pointer"
            title="Re-run Multi-Agent Pipeline"
          >
            <RotateCw className="w-4 h-4 text-[#BC0202]" />
          </button>
        </div>
      </div>

      {/* Case Overview Metadata Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 bg-[#000000] border border-[#830000] rounded-xl p-3.5 text-xs font-mono shadow-md">
        <div>
          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">AIRCRAFT TYPE</span>
          <div className="text-white font-medium mt-0.5">{caseData.aircraft_type || 'Boeing 737-800'}</div>
        </div>
        <div>
          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">STATION AIRPORT</span>
          <div className="text-white font-bold mt-0.5">{caseData.location || 'DEL (Terminal 3)'}</div>
        </div>
        <div>
          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">REQUIRED PART</span>
          <div className="text-white font-bold mt-0.5">{caseData.part_number || 'HP-2048'}</div>
        </div>
        <div>
          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">ATA CHAPTER</span>
          <div className="text-neutral-300 font-medium mt-0.5">{caseData.ata_chapter || '29 - Hydraulic Power'}</div>
        </div>
        <div>
          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">RECOVERY ETA</span>
          <div className="text-white font-bold mt-0.5">{caseData.estimated_recovery_hours || 4.5} hrs</div>
        </div>
        <div>
          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">SAFETY STATUS</span>
          <div className="font-bold text-[#BC0202] mt-0.5">
            HUMAN REVIEW REQ
          </div>
        </div>
      </div>

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

      {/* Outcome Submission Modal for Vendor Memory feedback */}
      {showOutcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="bg-[#000000] border-2 border-[#830000] rounded-xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-neutral-200 font-mono">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-[#BC0202]" />
              <span>RECORD VERIFIED GATE OUTCOME</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Updates supplier memory model with physical turnaround performance.
            </p>

            <form onSubmit={handleOutcomeSubmit} className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-neutral-400 block mb-1">ACTUAL DELIVERY HOURS</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={actualDeliveryHours} 
                    onChange={e => setActualDeliveryHours(parseFloat(e.target.value))}
                    className="w-full bg-[#080808] border border-[#1E1E1E] rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">ACTUAL LANDED COST ($)</label>
                  <input 
                    type="number" 
                    value={actualCost} 
                    onChange={e => setActualCost(parseFloat(e.target.value))}
                    className="w-full bg-[#080808] border border-[#1E1E1E] rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <input 
                  type="checkbox" 
                  id="docAcceptedCheck"
                  checked={docAccepted} 
                  onChange={e => setDocAccepted(e.target.checked)}
                  className="rounded border-[#830000] bg-[#080808] text-[#BC0202]"
                />
                <label htmlFor="docAcceptedCheck" className="text-neutral-300">
                  FAA 8130-3 / EASA Form 1 documentation verified and accepted
                </label>
              </div>

              <div>
                <label className="text-neutral-400 text-xs block mb-1">TECHOPS GATE NOTES</label>
                <input 
                  type="text" 
                  value={outcomeNotes} 
                  onChange={e => setOutcomeNotes(e.target.value)}
                  className="w-full bg-[#080808] border border-[#1E1E1E] rounded p-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowOutcomeModal(false)}
                  className="px-4 py-2 rounded bg-[#0D0D0D] text-neutral-300 text-xs font-semibold cursor-pointer border border-[#1E1E1E]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#830000] hover:bg-[#BC0202] text-white text-xs font-bold border border-[#BC0202] cursor-pointer"
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
