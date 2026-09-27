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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
      <div className="relative w-full max-w-lg rounded-xl bg-[#000000] border-2 border-[#830000] shadow-2xl overflow-hidden font-mono text-neutral-200">
        
        {/* Header */}
        <div className="px-5 py-4 bg-[#080808] border-b border-[#1E1E1E] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded bg-[#0D0D0D] text-[#BC0202] border border-[#830000]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                  HUMAN AUTHORIZATION GATE
                </h3>
                <span className="px-2 py-0.5 rounded bg-[#000000] text-[#BC0202] border border-[#BC0202] text-[10px] font-bold">
                  HUMAN REVIEW REQ
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Review and authorize procurement & courier dispatch actions
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-[#0D0D0D] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleApproveSubmit} className="p-5 space-y-4 text-xs">
          
          {/* Target Plan Summary */}
          {targetCand && (
            <div className="p-3 rounded bg-[#080808] border border-[#1E1E1E] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase text-white font-bold">
                  RECOMMENDED RECOVERY PLAN:
                </span>
                <span className="px-2 py-0.5 rounded bg-[#830000] text-white text-[10px] border border-[#BC0202] font-bold">
                  ETA: {targetCand.estimated_eta_hours.toFixed(1)}h
                </span>
              </div>

              <div className="text-sm font-bold text-white">
                {targetCand.vendor_name}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-300 pt-1 border-t border-[#1E1E1E]">
                <div>
                  <span className="text-neutral-500 block text-[10px]">LANDED COST:</span>
                  <span className="font-bold text-white">${targetCand.total_landed_cost.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">ROUTE:</span>
                  <span className="truncate block text-neutral-200">{targetCand.shipping_method.split('(')[0]}</span>
                </div>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1 font-bold">
                OPERATIONS ENGINEER NAME:
              </label>
              <input 
                type="text" 
                value={approverName}
                onChange={(e) => setApproverName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded bg-[#080808] border border-[#1E1E1E] text-white font-mono text-xs focus:outline-none focus:border-[#830000]"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1 font-bold">
                A&P / PART 66 LICENSE ID:
              </label>
              <input 
                type="text" 
                value={approverLicense}
                onChange={(e) => setApproverLicense(e.target.value)}
                placeholder="A&P-884920"
                required
                className="w-full px-3 py-2 rounded bg-[#080808] border border-[#1E1E1E] text-white font-mono text-xs focus:outline-none focus:border-[#830000]"
              />
            </div>

            <div>
              <label className="block text-[11px] text-neutral-400 mb-1 font-bold">
                AUTHORIZATION NOTES:
              </label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded bg-[#080808] border border-[#1E1E1E] text-white font-mono text-xs focus:outline-none focus:border-[#830000] resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleRejectSubmit}
              disabled={isSubmitting}
              className="px-3.5 py-2 rounded bg-[#000000] border border-[#FF0000] text-[#FF0000] hover:bg-[#FF0000]/20 font-bold transition text-xs cursor-pointer"
            >
              [ REJECT / REPLAN ]
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded bg-[#830000] hover:bg-[#BC0202] text-white font-bold text-xs border border-[#BC0202] transition cursor-pointer"
            >
              {isSubmitting ? 'AUTHORIZING...' : '[ APPROVE RECOVERY ]'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
