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
    <div className="bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(217,166,46,0.3)] rounded-xl p-5 space-y-4 shadow-md relative overflow-hidden font-mono text-[#252820]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(217,166,46,0.25)] pb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-[rgba(217,166,46,0.18)] border border-[#D9A62E] text-[#A87813] shadow-sm">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-[#252820] uppercase tracking-wider font-sans">
                CERTIFIED HUMAN REVIEW & RECOVERY GATE
              </h3>
              <span className="px-2 py-0.5 rounded bg-[rgba(217,166,46,0.15)] text-[#A87813] border border-[rgba(217,166,46,0.35)] text-[10px] font-bold">
                {caseData.id}
              </span>
            </div>
            <p className="text-xs text-[#4A483E] mt-0.5 font-sans">
              Mandatory authorization checkpoint before courier dispatch & inventory reservation
            </p>
          </div>
        </div>

        {/* State Status Tag */}
        <div>
          {isApproved ? (
            <span className="px-3 py-1 rounded bg-[#78966A]/20 text-[#4E6B42] border border-[#78966A]/40 text-xs font-bold flex items-center space-x-1.5 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#78966A]" />
              <span>RECOVERY AUTHORIZED</span>
            </span>
          ) : isRejected ? (
            <span className="px-3 py-1 rounded bg-[#C85B43]/20 text-[#C85B43] border border-[#C85B43]/40 text-xs font-bold flex items-center space-x-1.5">
              <XCircle className="w-3.5 h-3.5 text-[#C85B43]" />
              <span>RECOVERY REJECTED</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded bg-[rgba(217,166,46,0.18)] text-[#A87813] border border-[#D9A62E] text-xs font-bold flex items-center space-x-1.5 shadow-sm">
              <Lock className="w-3.5 h-3.5 text-[#A87813]" />
              <span>HUMAN REVIEW REQUIRED</span>
            </span>
          )}
        </div>
      </div>

      {/* Decision Pipeline Flow Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-center text-xs">
        <div className="p-2.5 rounded-lg bg-[rgba(255,248,235,0.85)] border border-[rgba(217,166,46,0.25)] shadow-sm">
          <div className="text-[10px] text-[#8C8472] uppercase font-bold">STEP 1</div>
          <div className="font-bold text-[#252820] mt-0.5">AI RECOMMENDATION</div>
          <div className="text-[10px] text-[#4A483E] mt-0.5 font-sans">Evaluated Multi-Candidate Strategy</div>
        </div>

        <div className="p-2.5 rounded-lg bg-[rgba(217,166,46,0.15)] border-2 border-[#D9A62E] shadow-sm">
          <div className="text-[10px] text-[#A87813] font-bold uppercase">STEP 2</div>
          <div className="font-bold text-[#252820] mt-0.5">HUMAN REVIEW REQUIRED</div>
          <div className="text-[10px] text-[#A87813] mt-0.5 font-sans font-bold">A&P Controller Verification</div>
        </div>

        <div className="p-2.5 rounded-lg bg-[rgba(255,248,235,0.85)] border border-[rgba(217,166,46,0.25)] shadow-sm">
          <div className="text-[10px] text-[#8C8472] uppercase font-bold">STEP 3</div>
          <div className="font-bold text-[#252820] mt-0.5">AUTHORIZE / MODIFY / REJECT</div>
          <div className="text-[10px] text-[#4A483E] mt-0.5 font-sans">Audit-logged Dispatch Command</div>
        </div>
      </div>

      {/* Mandatory Safety Statement Callout */}
      <div className="p-3 bg-[rgba(217,166,46,0.12)] border border-[rgba(217,166,46,0.35)] rounded-lg flex items-start space-x-2.5 text-xs text-[#252820] shadow-sm">
        <ShieldCheck className="w-4 h-4 text-[#A87813] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#A87813] font-bold block mb-0.5">CORE OPERATIONAL SAFETY PRINCIPLE:</strong>
          <span className="font-sans text-[#4A483E]">
            "AI recommendations are advisory. Final maintenance and recovery authorization remains with the certified human reviewer."
          </span>
        </div>
      </div>

      {/* Recommendation Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[rgba(255,248,235,0.85)] p-3.5 rounded-lg border border-[rgba(217,166,46,0.25)] shadow-sm">
        <div>
          <span className="text-[10px] text-[#8C8472] uppercase tracking-wider block font-bold">RECOMMENDED SUPPLIER</span>
          <div className="font-bold text-[#252820] text-xs flex items-center space-x-1.5 mt-0.5 font-sans">
            <Building className="w-3.5 h-3.5 text-[#A87813]" />
            <span>{candidate?.vendor_name || 'SkySupply Global (Mumbai)'}</span>
          </div>
          <div className="text-[11px] text-[#4A483E] mt-1 font-mono">
            Reliability: <strong className="text-[#252820]">{Math.round((candidate?.vendor_reliability_score || 0.94) * 100)}%</strong>
          </div>
        </div>

        <div>
          <span className="text-[10px] text-[#8C8472] uppercase tracking-wider block font-bold">RECOVERY LOGISTICS</span>
          <div className="font-bold text-[#252820] text-xs flex items-center space-x-1.5 mt-0.5 font-sans">
            <Clock className="w-3.5 h-3.5 text-[#A87813]" />
            <span>{candidate?.estimated_eta_hours || 4.5} hrs ETA</span>
          </div>
          <div className="text-[11px] text-[#4A483E] mt-1 font-mono">
            Total Landed: <strong className="text-[#A87813]">${candidate?.total_landed_cost?.toLocaleString() || '14,700'}</strong>
          </div>
        </div>

        <div>
          <span className="text-[10px] text-[#8C8472] uppercase tracking-wider block font-bold">AIRWORTHINESS STATUS</span>
          <div className="flex flex-wrap gap-1.5 text-[10px] mt-1">
            <span className="text-[#252820] bg-[rgba(255,250,242,0.95)] px-1.5 py-0.5 rounded border border-[rgba(217,166,46,0.35)] font-mono font-bold">FAA 8130-3 ✓</span>
            <span className="text-[#252820] bg-[rgba(255,250,242,0.95)] px-1.5 py-0.5 rounded border border-[rgba(217,166,46,0.35)] font-mono font-bold">EASA Form 1 ✓</span>
            <span className="text-[#252820] bg-[rgba(255,250,242,0.95)] px-1.5 py-0.5 rounded border border-[rgba(217,166,46,0.35)] font-mono font-bold">Part Match ✓</span>
          </div>
        </div>
      </div>

      {/* If already approved, show authorization banner */}
      {isApproved ? (
        <div className="p-3.5 bg-[rgba(255,248,235,0.85)] border border-[#78966A]/40 rounded-lg space-y-1.5 shadow-sm">
          <div className="flex items-center space-x-2 text-[#4E6B42] text-xs font-bold font-sans">
            <CheckCircle2 className="w-4 h-4 text-[#78966A]" />
            <span>RECOVERY AUTHORIZATION SIGN-OFF COMPLETE</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[#4A483E] font-mono">
            <div>Signer: <span className="text-[#252820] font-bold">{approverName}</span></div>
            <div>License: <span className="text-[#252820] font-bold">{approverLicense}</span></div>
            <div>Action: <span className="text-[#252820] font-bold">Courier Dispatched to DEL Bay 42</span></div>
          </div>
          {approvalNotes && (
            <div className="text-xs text-[#4A483E] pt-1 border-t border-[rgba(217,166,46,0.2)] font-sans">
              Audit Notes: {approvalNotes}
            </div>
          )}
        </div>
      ) : (
        /* Reviewer Credentials and Decision Form */
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-[#8C8472] uppercase tracking-wider block mb-1">
                AUTHORIZED CONTROLLER
              </label>
              <input 
                type="text" 
                value={approverName}
                onChange={(e) => setApproverName(e.target.value)}
                className="w-full bg-[rgba(255,250,242,0.9)] border border-[rgba(217,166,46,0.35)] rounded-lg px-3 py-2 text-xs text-[#252820] focus:outline-none focus:border-[#D9A62E] font-mono shadow-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#8C8472] uppercase tracking-wider block mb-1">
                FAA / DGCA LICENSE & ROLE
              </label>
              <input 
                type="text" 
                value={approverLicense}
                onChange={(e) => setApproverLicense(e.target.value)}
                className="w-full bg-[rgba(255,250,242,0.9)] border border-[rgba(217,166,46,0.35)] rounded-lg px-3 py-2 text-xs text-[#252820] focus:outline-none focus:border-[#D9A62E] font-mono shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-[#8C8472] uppercase tracking-wider block mb-1">
              CONTROLLER AUTHORIZATION NOTES (RECORDED IN AUDIT LOG)
            </label>
            <input 
              type="text" 
              placeholder="e.g. Authorized expedited procurement. Bay 42 tech crew standing by."
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              className="w-full bg-[rgba(255,250,242,0.9)] border border-[rgba(217,166,46,0.35)] rounded-lg px-3 py-2 text-xs text-[#252820] focus:outline-none focus:border-[#D9A62E] placeholder:text-[#8C8472] font-mono shadow-sm"
            />
          </div>

          {/* 3 Prominent Decision CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              {/* REJECT (Critical Action) */}
              <button
                onClick={onReject}
                disabled={isProcessingAction}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#C85B43]/15 hover:bg-[#C85B43]/25 text-[#C85B43] border border-[#C85B43]/50 text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                <XCircle className="w-3.5 h-3.5 text-[#C85B43]" />
                <span>[ REJECT ]</span>
              </button>

              {/* REQUEST INFO / MODIFY (Secondary Action) */}
              <button
                onClick={onRequestInfo}
                disabled={isProcessingAction}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[rgba(38,42,34,0.7)] hover:bg-[rgba(52,58,46,0.9)] text-[#F7F1E4] border border-[rgba(255,210,100,0.3)] text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                <HelpCircle className="w-3.5 h-3.5 text-[#F0C75E]" />
                <span>[ REQUEST INFO / MODIFY ]</span>
              </button>
            </div>

            {/* APPROVE (Primary Action) */}
            <button
              onClick={onApprove}
              disabled={isProcessingAction}
              className="w-full sm:w-auto px-6 py-2 rounded-lg bg-gradient-to-r from-[#D9A62E] to-[#F0C75E] hover:from-[#E2B139] hover:to-[#F7D475] text-[#252820] border border-[#F0C75E] text-xs font-bold transition shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#252820]" />
              <span>[ APPROVE RECOVERY ]</span>
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
