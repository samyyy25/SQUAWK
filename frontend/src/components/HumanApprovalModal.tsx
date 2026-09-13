import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X
} from 'lucide-react';
import { SquawkCase, RecoveryCandidate } from '../types';

interface HumanApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: SquawkCase;
  candidate?: RecoveryCandidate | null;
  onApprove: (data: { approverName: string; approverLicense: string; notes: string; candidateId?: string }) => void;
  onReject: (data: { approverName: string; approverLicense: string; notes: string }) => void;
}

export const HumanApprovalModal: React.FC<HumanApprovalModalProps> = ({
  isOpen,
  onClose,
  caseData,
  candidate,
  onApprove,
  onReject
}) => {
  const [approverName, setApproverName] = useState('Lead Engineer (MCC Delhi)');
  const [approverLicense, setApproverLicense] = useState('A&P-884920');
  const [notes, setNotes] = useState('Authorized for immediate rotable reservation and NFO carrier dispatch.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const targetCand = candidate || caseData.candidates.find(c => c.is_recommended) || caseData.candidates[0];

  const handleApproveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onApprove({
      approverName,
      approverLicense,
      notes,
      candidateId: targetCand?.id
    });
    setIsSubmitting(false);
    onClose();
  };

  const handleRejectSubmit = () => {
    setIsSubmitting(true);
    onReject({
      approverName,
      approverLicense,
      notes: notes || 'Rejected by Operations Controller'
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-xl bg-[#151B23] border border-[#26313D] shadow-2xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="px-5 py-4 bg-[#11161D] border-b border-[#26313D] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                  HUMAN AUTHORIZATION GATE
                </h3>
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono font-bold">
                  AI SUGGESTS • HUMAN DECIDES
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Review and authorize autonomous procurement & carrier dispatch actions
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleApproveSubmit} className="p-5 space-y-4 text-xs">
          
          {/* Target Plan Summary */}
          {targetCand && (
            <div className="p-3 rounded-lg bg-[#11161D] border border-[#26313D] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                  RECOMMENDED RECOVERY PLAN:
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-mono border border-emerald-800/50 font-bold">
                  ETA: {targetCand.estimated_eta_hours.toFixed(1)}h
                </span>
              </div>

              <div className="text-sm font-bold text-white">
                {targetCand.vendor_name}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300 pt-1 border-t border-[#26313D]">
                <div>
                  <span className="text-slate-500 block text-[10px]">Landed Cost:</span>
                  <span className="font-bold text-slate-100">${targetCand.total_landed_cost.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Carrier / Route:</span>
                  <span className="truncate block">{targetCand.shipping_method.split('(')[0]}</span>
                </div>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Operations Engineer Name:
              </label>
              <input 
                type="text"
                value={approverName}
                onChange={(e) => setApproverName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg bg-[#11161D] border border-[#26313D] text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                A&P / PART 66 LICENSE ID:
              </label>
              <input 
                type="text"
                value={approverLicense}
                onChange={(e) => setApproverLicense(e.target.value)}
                placeholder="A&P-884920"
                required
                className="w-full px-3 py-2 rounded-lg bg-[#11161D] border border-[#26313D] text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Authorization Notes & Rationale:
              </label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-[#11161D] border border-[#26313D] text-white font-mono text-xs focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleRejectSubmit}
              disabled={isSubmitting}
              className="px-3 py-2 rounded-lg bg-[#11161D] border border-red-800/60 hover:bg-red-950/40 text-red-300 font-bold transition text-xs cursor-pointer"
            >
              Reject / Request Replan
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition shadow-md active:scale-95 cursor-pointer"
            >
              {isSubmitting ? 'Authorizing...' : 'Approve Recovery Plan'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
