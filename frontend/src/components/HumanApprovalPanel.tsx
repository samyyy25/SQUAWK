import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Lock, 
  UserCheck,
  Building,
  Clock
} from 'lucide-react';
import { SquawkCase, RecoveryCandidate } from '../types';

interface HumanApprovalPanelProps {
  caseData: SquawkCase;
  selectedCandidate: RecoveryCandidate | null;
  approverName: string;
  setApproverName: (name: string) => void;
  approverLicense: string;
  setApproverLicense: (lic: string) => void;
  approvalNotes: string;
  setApprovalNotes: (notes: string) => void;
  isProcessingAction: boolean;
  onApprove: () => void;
  onReject: () => void;
  onRequestInfo: () => void;
}

export const HumanApprovalPanel: React.FC<HumanApprovalPanelProps> = ({
  caseData,
  selectedCandidate,
  approverName,
  setApproverName,
  approverLicense,
  setApproverLicense,
  approvalNotes,
  setApprovalNotes,
  isProcessingAction,
  onApprove,
  onReject,
  onRequestInfo
}) => {
  const isApproved = caseData.status === 'Approved';
  const isRejected = caseData.status === 'Rejected';

  const candidate = selectedCandidate || caseData.candidates.find(c => c.is_recommended) || caseData.candidates[0];

  return (
    <div className="bg-[#000000] border-2 border-[#830000] rounded-xl p-5 space-y-4 shadow-xl relative overflow-hidden font-mono">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E1E1E] pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded bg-[#0D0D0D] border border-[#830000] text-[#BC0202]">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                CERTIFIED HUMAN REVIEW & RECOVERY GATE
              </h3>
              <span className="px-2 py-0.5 rounded bg-[#0D0D0D] text-neutral-400 border border-[#1E1E1E] text-[10px] font-bold">
                {caseData.id}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5 font-sans">
              Mandatory authorization checkpoint before courier dispatch & inventory reservation
            </p>
          </div>
        </div>

        {/* State Status Tag */}
        <div>
          {isApproved ? (
            <span className="px-3 py-1 rounded bg-[#0D0D0D] text-white border border-[#830000] text-xs font-bold flex items-center space-x-1.5 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#BC0202]" />
              <span>RECOVERY AUTHORIZED</span>
            </span>
          ) : isRejected ? (
            <span className="px-3 py-1 rounded bg-[#000000] text-[#FF0000] border border-[#FF0000] text-xs font-bold flex items-center space-x-1.5">
              <XCircle className="w-3.5 h-3.5 text-[#FF0000]" />
              <span>RECOVERY REJECTED</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded bg-[#000000] text-[#BC0202] border border-[#BC0202] text-xs font-bold flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>HUMAN REVIEW REQUIRED</span>
            </span>
          )}
        </div>
      </div>

      {/* Decision Pipeline Flow Display (Section 11 Spec) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2.5 rounded bg-[#080808] border border-[#1E1E1E]">
          <div className="text-[10px] text-neutral-500 uppercase">STEP 1</div>
          <div className="font-bold text-white mt-0.5">AI RECOMMENDATION</div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Evaluated Multi-Candidate Strategy</div>
        </div>

        <div className="p-2.5 rounded bg-[#0D0D0D] border-2 border-[#BC0202]">
          <div className="text-[10px] text-[#BC0202] font-bold uppercase">STEP 2</div>
          <div className="font-bold text-white mt-0.5">HUMAN REVIEW REQUIRED</div>
          <div className="text-[10px] text-[#BC0202] mt-0.5">A&P Controller Verification</div>
        </div>

        <div className="p-2.5 rounded bg-[#080808] border border-[#1E1E1E]">
          <div className="text-[10px] text-neutral-500 uppercase">STEP 3</div>
          <div className="font-bold text-white mt-0.5">AUTHORIZE / MODIFY / REJECT</div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Audit-logged Dispatch Command</div>
        </div>
      </div>

      {/* Mandatory Safety Statement Callout */}
      <div className="p-3 bg-[#080808] border border-[#830000] rounded flex items-start space-x-2.5 text-xs text-neutral-300">
        <ShieldCheck className="w-4 h-4 text-[#BC0202] shrink-0 mt-0.5" />
        <div>
          <strong className="text-white font-semibold block mb-0.5">CORE OPERATIONAL SAFETY PRINCIPLE:</strong>
          "AI recommendations are advisory. Final maintenance and recovery authorization remains with the certified human reviewer."
        </div>
      </div>

      {/* Recommendation Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#080808] p-3.5 rounded border border-[#1E1E1E]">
        <div>
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">RECOMMENDED SUPPLIER</span>
          <div className="font-bold text-white text-xs flex items-center space-x-1.5 mt-0.5">
            <Building className="w-3.5 h-3.5 text-[#BC0202]" />
            <span>{candidate?.vendor_name || 'SkySupply Global (Mumbai)'}</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Reliability: <strong className="text-white">{Math.round((candidate?.vendor_reliability_score || 0.94) * 100)}%</strong>
          </div>
        </div>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">RECOVERY LOGISTICS</span>
          <div className="font-bold text-white text-xs flex items-center space-x-1.5 mt-0.5">
            <Clock className="w-3.5 h-3.5 text-[#BC0202]" />
            <span>{candidate?.estimated_eta_hours || 4.5} hrs ETA</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            Total Landed: <strong className="text-white">${candidate?.total_landed_cost?.toLocaleString() || '14,700'}</strong>
          </div>
        </div>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">AIRWORTHINESS STATUS</span>
          <div className="flex flex-wrap gap-1.5 text-[10px] mt-1">
            <span className="text-white bg-[#0D0D0D] px-1.5 py-0.5 rounded border border-[#1E1E1E]">FAA 8130-3 ✓</span>
            <span className="text-white bg-[#0D0D0D] px-1.5 py-0.5 rounded border border-[#1E1E1E]">EASA Form 1 ✓</span>
            <span className="text-white bg-[#0D0D0D] px-1.5 py-0.5 rounded border border-[#1E1E1E]">Part Match ✓</span>
          </div>
        </div>
      </div>

      {/* If already approved, show authorization banner */}
      {isApproved ? (
        <div className="p-3.5 bg-[#080808] border border-[#830000] rounded space-y-1.5">
          <div className="flex items-center space-x-2 text-white text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#BC0202]" />
            <span>RECOVERY AUTHORIZATION SIGN-OFF COMPLETE</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-neutral-300">
            <div>Signer: <span className="text-white font-bold">{approverName}</span></div>
            <div>License: <span className="text-white font-bold">{approverLicense}</span></div>
            <div>Action: <span className="text-white font-bold">Courier Dispatched to DEL Bay 42</span></div>
          </div>
          {approvalNotes && (
            <div className="text-xs text-neutral-400 pt-1 border-t border-[#1E1E1E]">
              Audit Notes: {approvalNotes}
            </div>
          )}
        </div>
      ) : (
        /* Reviewer Credentials and Decision Form */
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                AUTHORIZED CONTROLLER
              </label>
              <input 
                type="text" 
                value={approverName}
                onChange={(e) => setApproverName(e.target.value)}
                className="w-full bg-[#080808] border border-[#1E1E1E] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#830000]"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                FAA / DGCA LICENSE & ROLE
              </label>
              <input 
                type="text" 
                value={approverLicense}
                onChange={(e) => setApproverLicense(e.target.value)}
                className="w-full bg-[#080808] border border-[#1E1E1E] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#830000]"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
              CONTROLLER AUTHORIZATION NOTES (RECORDED IN AUDIT LOG)
            </label>
            <input 
              type="text" 
              placeholder="e.g. Authorized expedited procurement. Bay 42 tech crew standing by."
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              className="w-full bg-[#080808] border border-[#1E1E1E] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#830000] placeholder:text-neutral-600"
            />
          </div>

          {/* 3 Prominent Decision CTAs (Section 16 Spec) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              {/* REJECT (Critical Action) */}
              <button
                onClick={onReject}
                disabled={isProcessingAction}
                className="w-full sm:w-auto px-4 py-2 rounded bg-[#000000] hover:bg-[#FF0000]/20 text-[#FF0000] border border-[#FF0000] text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5 text-[#FF0000]" />
                <span>[ REJECT ]</span>
              </button>

              {/* REQUEST INFO / MODIFY (Secondary Action) */}
              <button
                onClick={onRequestInfo}
                disabled={isProcessingAction}
                className="w-full sm:w-auto px-4 py-2 rounded bg-[#000000] hover:bg-[#0D0D0D] text-neutral-300 hover:text-white border border-[#1E1E1E] hover:border-[#830000] text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#BC0202]" />
                <span>[ REQUEST INFO / MODIFY ]</span>
              </button>
            </div>

            {/* APPROVE (Primary Action: #830000 hover #BC0202) */}
            <button
              onClick={onApprove}
              disabled={isProcessingAction}
              className="w-full sm:w-auto px-6 py-2 rounded bg-[#830000] hover:bg-[#BC0202] text-white border border-[#BC0202] text-xs font-bold transition shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>[ APPROVE RECOVERY ]</span>
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
