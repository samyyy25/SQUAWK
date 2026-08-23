import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plane, 
  Clock, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Info, 
  Send, 
  Sparkles, 
  FileText, 
  Truck, 
  Search, 
  Check, 
  Layers, 
  Cpu, 
  HelpCircle,
  Building,
  RotateCw
} from 'lucide-react';
import { SquawkCase, RecoveryCandidate } from '../types';
import { api } from '../api';

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
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Outcome submission states
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [actualDeliveryHours, setActualDeliveryHours] = useState(3.9);
  const [actualCost, setActualCost] = useState(21100);
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

  // Find agent raw results
  const sourcingAgent = caseData.agent_results.find(a => a.specialist_name.includes('Sourcing'));
  const docAgent = caseData.agent_results.find(a => a.specialist_name.includes('Documentation'));
  const logisticsAgent = caseData.agent_results.find(a => a.specialist_name.includes('Logistics'));

  return (
    <div className="p-6 space-y-6">
      
      {/* Top Header & Breadcrumbs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onBack}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-bold text-white font-mono">{caseData.tail_number || 'UNKNOWN TAIL'}</h1>
              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${
                caseData.priority === 'AOG' 
                  ? 'bg-red-950 text-red-400 border-red-800' 
                  : 'bg-amber-950 text-amber-400 border-amber-800'
              }`}>
                {caseData.priority}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {caseData.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{caseData.defect_description}</p>
          </div>
        </div>

        {/* Action button if already approved */}
        <div className="flex items-center space-x-3">
          {caseData.status === 'Approved' && (
            <button 
              onClick={() => setShowOutcomeModal(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-lg transition"
            >
              Record Verified Physical Outcome
            </button>
          )}
          <button 
            onClick={onRefreshCase}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Re-run Multi-Agent Pipeline"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Case Information Bar */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 bg-[#0f172a] border border-slate-800 rounded-xl p-4 text-xs">
        <div>
          <span className="text-[11px] text-slate-500 font-semibold uppercase">Aircraft Type</span>
          <div className="text-slate-200 font-medium mt-0.5">{caseData.aircraft_type || 'Unspecified'}</div>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 font-semibold uppercase">ATA Chapter</span>
          <div className="text-slate-200 font-medium mt-0.5">{caseData.ata_chapter || 'None'}</div>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 font-semibold uppercase">Part Number (IPC)</span>
          <div className="text-cyan-400 font-mono font-bold mt-0.5">{caseData.part_number || 'N/A'}</div>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 font-semibold uppercase">Station Location</span>
          <div className="text-slate-200 font-mono font-bold mt-0.5">{caseData.location}</div>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 font-semibold uppercase">Risk Evaluation</span>
          <div className={`font-bold mt-0.5 ${caseData.risk_level === 'LOW' ? 'text-emerald-400' : 'text-red-400'}`}>
            {caseData.risk_level} RISK
          </div>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 font-semibold uppercase">AI Confidence</span>
          <div className="text-cyan-300 font-mono font-bold mt-0.5">
            {Math.round(caseData.confidence_score * 100)}%
          </div>
        </div>
      </div>

      {/* Parallel AI Specialist Inspection Cards */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>Parallel RocketRide Specialist Inspection</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Sourcing Specialist */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-white">Sourcing Specialist</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                {caseData.candidates.length} candidates
              </span>
            </div>
            <div className="text-xs text-slate-300 space-y-1.5">
              <p>Queried certified inventory databases across hubs.</p>
              <div className="text-[11px] text-slate-400 space-y-1 font-mono">
                <div>• Matched Part: {caseData.part_number}</div>
                <div>• Inventory availability verified</div>
              </div>
            </div>
          </div>

          {/* Documentation Specialist */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">Documentation Specialist</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                Evidence Checked
              </span>
            </div>
            <div className="text-xs text-slate-300 space-y-1.5">
              <p>Audited airworthiness certifications (8130-3 / EASA Form 1 / OEM trace).</p>
              <div className="text-[11px] text-amber-300/90 font-mono">
                {caseData.candidates.some(c => c.is_flagged) ? '⚠️ Flagged candidate with missing 8130-3' : '✓ All candidates certified'}
              </div>
            </div>
          </div>

          {/* Logistics Specialist */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Logistics Specialist</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                Fastest: {caseData.estimated_recovery_hours || 4.0} hrs
              </span>
            </div>
            <div className="text-xs text-slate-300 space-y-1.5">
              <p>Modeled hot-shot vans vs next-flight-out cargo landed costs.</p>
              <div className="text-[11px] text-slate-400 font-mono">
                • Target Hub: {caseData.location}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Validator Agent Breakdown (AI Checking AI) */}
      {caseData.validation_result && (
        <div className="bg-gradient-to-r from-slate-900 via-[#0f172a] to-slate-900 border border-cyan-900/50 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Validator Agent (AI Checking AI)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                    {caseData.validation_result.status}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Reconciles specialist conflicts & enforces airworthiness safety compliance</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-mono font-bold text-emerald-400">
                Confidence: {Math.round(caseData.validation_result.confidence * 100)}%
              </div>
              <div className="text-[10px] text-slate-500 uppercase">Risk: {caseData.validation_result.risk_level}</div>
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200">
            <strong>Reasoning:</strong> {caseData.validation_result.reasoning_summary}
          </div>

          {/* Conflict warnings if any */}
          {caseData.validation_result.conflicts_detected && caseData.validation_result.conflicts_detected.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">Detected Conflicts & Safety Flags:</span>
              <div className="space-y-1.5">
                {caseData.validation_result.conflicts_detected.map((conf: any, idx: number) => (
                  <div key={idx} className="p-2.5 bg-red-950/30 border border-red-900/60 rounded-lg text-xs text-red-200 flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-red-300 font-semibold">{conf.candidate}:</strong> {conf.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recovery Candidates Ranked Comparison */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <span>Ranked Recovery Options</span>
            <span className="text-[10px] text-slate-400 font-normal">
              (Multi-criteria weighted: Airworthiness Evidence &gt; ETA &gt; Reliability &gt; Cost)
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {caseData.candidates.map((cand) => {
            const isSelected = selectedCandidate?.id === cand.id;
            return (
              <div 
                key={cand.id}
                onClick={() => setSelectedCandidate(cand)}
                className={`p-5 rounded-2xl border transition cursor-pointer relative ${
                  isSelected 
                    ? 'bg-slate-900 border-cyan-500 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-500/50' 
                    : 'bg-[#0f172a] border-slate-800 hover:border-slate-700'
                }`}
              >
                {cand.is_recommended && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1">
                    <Check className="w-3 h-3" />
                    <span>RECOMMENDED</span>
                  </div>
                )}

                {cand.is_flagged && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800 text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>FLAGGED</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <div className="text-xs text-slate-400 font-mono">Rank #{cand.overall_rank}</div>
                    <div className="text-base font-bold text-white flex items-center space-x-2">
                      <Building className="w-4 h-4 text-cyan-400" />
                      <span>{cand.vendor_name}</span>
                    </div>
                  </div>

                  {/* Pricing and ETA Matrix */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-950/70 p-2.5 rounded-xl text-center">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Total Landed Cost</div>
                      <div className="text-sm font-bold text-white font-mono">${cand.total_landed_cost.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">${cand.part_cost.toLocaleString()} + ${cand.freight_cost.toLocaleString()} frt</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Delivery ETA</div>
                      <div className="text-sm font-bold text-cyan-300 font-mono">{cand.estimated_eta_hours} hrs</div>
                      <div className="text-[10px] text-slate-400">Hot-Shot Courier</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Vendor Reliability</div>
                      <div className="text-sm font-bold text-emerald-300 font-mono">
                        {Math.round(cand.vendor_reliability_score * 100)}%
                      </div>
                      <div className="text-[10px] text-slate-400">Verified History</div>
                    </div>
                  </div>

                  {/* Documentation & Tag details */}
                  <div className="text-xs space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-400">Documentation:</span>
                      <span className={`font-semibold ${cand.documentation_status === 'Complete' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {cand.documentation_status}
                      </span>
                    </div>
                    {cand.doc_notes && (
                      <p className="text-[11px] text-slate-400 font-mono">{cand.doc_notes}</p>
                    )}
                    {cand.flag_reason && (
                      <p className="text-[11px] text-red-300 bg-red-950/40 p-2 rounded border border-red-900/60 font-semibold">
                        {cand.flag_reason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Human Approval Gate & Action Generator */}
      {caseData.status !== 'Approved' && caseData.status !== 'Closed' && (
        <div className="bg-[#0f172a] border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Human Tech Ops Authorization Gate</h3>
              <p className="text-xs text-slate-400">
                A certified human controller must review and authorize procurement before automated logistics actions dispatch.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Authorizing Controller Name</label>
              <input 
                type="text" 
                value={approverName}
                onChange={(e) => setApproverName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">FAA / EASA License Number</label>
              <input 
                type="text" 
                value={approverLicense}
                onChange={(e) => setApproverLicense(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Operational Authorization Notes</label>
            <input 
              type="text" 
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="e.g. Authorized under MEL Cat B. Priority AOG hot-shot dispatch approved."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-400">
              Selected Vendor: <strong className="text-white">{selectedCandidate?.vendor_name || 'None'}</strong> • 
              ETA: <strong className="text-cyan-300">{selectedCandidate?.estimated_eta_hours || '--'} hrs</strong>
            </div>

            <div className="flex items-center space-x-2">
              <button 
                onClick={handleReject}
                disabled={isProcessingAction}
                className="px-3 py-2 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-semibold transition"
              >
                Reject
              </button>
              <button 
                onClick={handleRequestInfo}
                disabled={isProcessingAction}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Request Info
              </button>
              <button 
                onClick={handleApprove}
                disabled={isProcessingAction || !selectedCandidate}
                className="flex items-center space-x-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition active:scale-95 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>APPROVE RECOVERY PLAN</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Real-World Recovery Actions Feed */}
      {caseData.recovery_actions && caseData.recovery_actions.length > 0 && (
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Simulated Real-World Dispatch Actions (DEMO ACTION)</span>
            </h3>
            <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
              4 Actions Dispatched
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {caseData.recovery_actions.map((act) => (
              <div key={act.id} className="p-3 bg-slate-950/90 border border-slate-800/80 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white font-mono">{act.title}</span>
                  <span className="text-[10px] text-emerald-400 font-mono">✓ EXECUTED</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Ref: {act.reference_number} • Demo Mode Active
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outcome Submission Modal */}
      {showOutcomeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 text-slate-200">
            <h3 className="text-base font-bold text-white">Record Verified Physical Outcome</h3>
            <p className="text-xs text-slate-400">
              Close the feedback loop. Physical verification updates long-term vendor reliability memory.
            </p>

            <form onSubmit={handleOutcomeSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Actual Delivery Hours</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={actualDeliveryHours} 
                  onChange={(e) => setActualDeliveryHours(parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Actual Total Landed Cost ($)</label>
                <input 
                  type="number" 
                  value={actualCost} 
                  onChange={(e) => setActualCost(parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Documentation Accepted on Arrival?</label>
                <select 
                  value={docAccepted ? 'true' : 'false'}
                  onChange={(e) => setDocAccepted(e.target.value === 'true')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                >
                  <option value="true">✓ YES - FAA Form 8130-3 Verified Pristine</option>
                  <option value="false">❌ NO - Documentation Defect / Missing Tags</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Operator Notes</label>
                <input 
                  type="text" 
                  value={outcomeNotes} 
                  onChange={(e) => setOutcomeNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button 
                  type="button" 
                  onClick={() => setShowOutcomeModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded-lg bg-purple-600 text-xs font-bold text-white hover:bg-purple-500"
                >
                  Save & Update Vendor Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
