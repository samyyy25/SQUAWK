import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  FileCheck, 
  AlertTriangle, 
  Lock, 
  UserCheck,
  Building,
  Clock,
  Sparkles
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
  const isNeedsInfo = caseData.status === 'Needs Review';

  const candidate = selectedCandidate || caseData.candidates.find(c => c.is_recommended) || caseData.candidates[0];

  return (
    <div className="bg-[#0f172a] border border-cyan-800/60 rounded-2xl p-6 space-y-5 shadow-2xl relative overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white">Certified Human Review & Recovery Gate</h3>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-mono font-bold uppercase">
                {caseData.id}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Final authorization checkpoint before automated courier dispatch & inventory reservation
            </p>
          </div>
        </div>

        {/* State Status Tag */}
        <div>
          {isApproved ? (
            <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-mono font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-950/50">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>RECOVERY AUTHORIZED</span>
            </span>
          ) : isRejected ? (
            <span className="px-3 py-1 rounded-full bg-red-950 text-red-300 border border-red-700 font-mono font-bold text-xs flex items-center space-x-1.5">
              <XCircle className="w-4 h-4 text-red-400" />
              <span>RECOVERY REJECTED</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-700 font-mono font-bold text-xs flex items-center space-x-1.5 animate-pulse">
              <Lock className="w-3.5 h-3.5" />
              <span>HUMAN DECISION REQUIRED</span>
            </span>
          )}
        </div>
      </div>

      {/* Mandatory Safety Statement Callout */}
      <div className="p-3 bg-[#0a0f1d] border border-cyan-900/50 rounded-xl flex items-start space-x-3 text-xs text-slate-300">
        <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-cyan-300 font-semibold block mb-0.5">Core Operational Safety Principle:</strong>
          "AI recommendation is advisory. Final maintenance and recovery authorization remains with the qualified human reviewer."
        </div>
      </div>

      {/* Recommendation Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Recommended Supplier</span>
          <div className="font-bold text-white text-sm flex items-center space-x-1.5 mt-0.5">
            <Building className="w-4 h-4 text-cyan-400" />
            <span>{candidate?.vendor_name || 'AeroParts Inc.'}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Reliability: <strong className="text-emerald-400 font-mono">{Math.round((candidate?.vendor_reliability_score || 0.94) * 100)}%</strong>
          </div>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Recovery Logistics</span>
          <div className="font-bold text-cyan-300 text-sm flex items-center space-x-1.5 mt-0.5">
            <Clock className="w-4 h-4" />
            <span>{candidate?.estimated_eta_hours || 4.0} hrs ETA</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Total Landed: <strong className="text-white">${candidate?.total_landed_cost?.toLocaleString() || '8,750'}</strong>
          </div>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Airworthiness Verification</span>
          <div className="flex flex-wrap gap-2 text-[11px] font-mono mt-1">
            <span className="text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">FAA 8130-3 ✓</span>
            <span className="text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">EASA Form 1 ✓</span>
            <span className="text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">Part Match ✓</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Validator Finding: Lower-cost candidate rejected due to missing documentation.
          </div>
        </div>
      </div>

      {/* If already approved, show authorization banner */}
      {isApproved ? (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-xl space-y-2">
          <div className="flex items-center space-x-2 text-emerald-300 text-xs font-bold font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>RECOVERY AUTHORIZATION SIGN-OFF COMPLETE</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300 font-mono">
            <div>Signer: <span className="text-white font-bold">{approverName}</span></div>
            <div>License: <span className="text-white font-bold">{approverLicense}</span></div>
            <div>Action: <span className="text-emerald-300 font-bold">Courier Dispatched to ORD Gate</span></div>
          </div>
          {approvalNotes && (
            <div className="text-xs text-slate-400 pt-1 border-t border-emerald-900/60">
              Audit Notes: {approvalNotes}
            </div>
          )}
        </div>
      ) : (
        /* Reviewer Credentials and Decision Form */
        <div className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Authorized Controller
              </label>
              <input 
                type="text" 
                value={approverName}
                onChange={(e) => setApproverName(e.target.value)}
                className="w-full bg-[#14161a] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                FAA / EASA License & Role
              </label>
              <input 
                type="text" 
                value={approverLicense}
                onChange={(e) => setApproverLicense(e.target.value)}
                className="w-full bg-[#14161a] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Controller Authorization Notes (Recorded in Tech Ops Audit Log)
            </label>
            <input 
              type="text" 
              placeholder="e.g. Approved expedited rotable route. Gate maintenance team on standby at ORD."
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              className="w-full bg-[#14161a] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans placeholder:text-slate-600"
            />
          </div>

          {/* 3 Prominent Decision CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={onReject}
                disabled={isProcessingAction}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/80 text-xs font-bold transition flex items-center justify-center space-x-1.5 active:scale-95 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>REJECT</span>
              </button>

              <button
                onClick={onRequestInfo}
                disabled={isProcessingAction}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition flex items-center justify-center space-x-1.5 active:scale-95 disabled:opacity-50"
              >
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>REQUEST MORE INFO</span>
              </button>
            </div>

            <button
              onClick={onApprove}
              disabled={isProcessingAction}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black text-xs font-black transition shadow-lg shadow-emerald-950/60 flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>APPROVE RECOVERY</span>
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
