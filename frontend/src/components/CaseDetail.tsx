import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plane, 
  Clock, 
  RotateCw,
  Building,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Cpu,
  Layers,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { SquawkCase, RecoveryCandidate } from '../types';
import { api } from '../api';
import { WorkflowTimeline } from './WorkflowTimeline';
import { AgentStatusCards } from './AgentStatusCards';
import { ValidatorComparison } from './ValidatorComparison';
import { RecommendationCard } from './RecommendationCard';
import { HumanApprovalPanel } from './HumanApprovalPanel';

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

  const [approverName, setApproverName] = useState('Capt. Marcus Vance');
  const [approverLicense, setApproverLicense] = useState('FAA A&P / AOG Controller #482910');
  const [approvalNotes, setApprovalNotes] = useState('Approved recommended rotable procurement route via AeroParts Inc.');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Outcome submission modal for completed cases
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [actualDeliveryHours, setActualDeliveryHours] = useState(3.9);
  const [actualCost, setActualCost] = useState(8750);
  const [docAccepted, setDocAccepted] = useState(true);
  const [vendorRating, setVendorRating] = useState(5);
  const [outcomeNotes, setOutcomeNotes] = useState('Flawless delivery, 8130-3 tag verified on arrival.');

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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center space-x-1 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Queue</span>
          </button>

          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-white font-mono">{caseData.tail_number || 'N42Q'}</h1>
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {caseData.id}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${
                caseData.priority === 'AOG' 
                  ? 'bg-red-950 text-red-400 border-red-800' 
                  : 'bg-amber-950 text-amber-400 border-amber-800'
              }`}>
                {caseData.priority}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                caseData.status === 'Approved' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                {caseData.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">{caseData.defect_description}</p>
          </div>
        </div>

        {/* Action button if already approved */}
        <div className="flex items-center space-x-3">
          {caseData.status === 'Approved' && (
            <button 
              onClick={() => setShowOutcomeModal(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg shadow-purple-950/50 transition flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Record Physical Delivery Outcome</span>
            </button>
          )}
          <button 
            onClick={onRefreshCase}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Re-run Multi-Agent Pipeline"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Case Overview Metadata Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 bg-[#0f172a] border border-slate-800 rounded-2xl p-4 text-xs shadow-lg">
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase font-mono tracking-wider">Aircraft Type</span>
          <div className="text-white font-medium mt-0.5">{caseData.aircraft_type || 'Boeing 737-800'}</div>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase font-mono tracking-wider">Station Airport</span>
          <div className="text-cyan-400 font-mono font-bold mt-0.5">{caseData.location || 'ORD'}</div>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase font-mono tracking-wider">Required Part</span>
          <div className="text-cyan-300 font-mono font-bold mt-0.5">{caseData.part_number || 'HYD-PUMP-2901'}</div>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase font-mono tracking-wider">ATA Chapter</span>
          <div className="text-slate-300 font-medium mt-0.5">{caseData.ata_chapter || '29 - Hydraulic Power'}</div>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase font-mono tracking-wider">Recovery ETA</span>
          <div className="text-cyan-300 font-mono font-bold mt-0.5">{caseData.estimated_recovery_hours || 4.0} hrs</div>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase font-mono tracking-wider">Safety Risk Level</span>
          <div className={`font-mono font-bold mt-0.5 ${caseData.risk_level === 'LOW' ? 'text-emerald-400' : 'text-red-400'}`}>
            {caseData.risk_level || 'LOW'} RISK
          </div>
        </div>
      </div>

      {/* TASK 3: END-TO-END VISUAL RECOVERY TIMELINE */}
      <WorkflowTimeline caseData={caseData} />

      {/* PARALLEL SPECIALIST AGENT STATUS CARDS */}
      <AgentStatusCards caseData={caseData} />

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-slate-200">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>Record Verified Physical Outcome</span>
            </h3>
            <p className="text-xs text-slate-400">
              Updates supplier memory model in RocketRide with physical gate turnaround performance.
            </p>

            <form onSubmit={handleOutcomeSubmit} className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Actual Delivery Hours</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={actualDeliveryHours} 
                    onChange={e => setActualDeliveryHours(parseFloat(e.target.value))}
                    className="w-full bg-[#14161a] border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Actual Landed Cost ($)</label>
                  <input 
                    type="number" 
                    value={actualCost} 
                    onChange={e => setActualCost(parseFloat(e.target.value))}
                    className="w-full bg-[#14161a] border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <input 
                  type="checkbox" 
                  id="docAcceptedCheck"
                  checked={docAccepted} 
                  onChange={e => setDocAccepted(e.target.checked)}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
                />
                <label htmlFor="docAcceptedCheck" className="text-slate-300">
                  FAA 8130-3 / EASA Form 1 documentation verified and accepted on arrival
                </label>
              </div>

              <div>
                <label className="text-slate-400 text-xs block mb-1">TechOps Gate Notes</label>
                <input 
                  type="text" 
                  value={outcomeNotes} 
                  onChange={e => setOutcomeNotes(e.target.value)}
                  className="w-full bg-[#14161a] border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowOutcomeModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-950/50"
                >
                  Save Outcome to Vendor Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
