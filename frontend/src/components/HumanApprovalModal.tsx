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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-xl bg-[rgba(26,29,23,0.96)] border-2 border-[rgba(255,210,100,0.4)] shadow-2xl overflow-hidden font-mono text-[#F7F1E4]">
        
        {/* Header */}
        <div className="px-5 py-4 bg-[rgba(34,38,30,0.95)] border-b border-[rgba(255,210,100,0.2)] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded bg-[rgba(217,166,46,0.2)] text-[#F0C75E] border border-[#D9A62E]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                  HUMAN AUTHORIZATION GATE
                </h3>
                <span className="px-2 py-0.5 rounded bg-[rgba(217,166,46,0.18)] text-[#F0C75E] border border-[rgba(217,166,46,0.4)] text-[10px] font-bold">
                  HUMAN REVIEW REQ
                </span>
              </div>
              <p className="text-[11px] text-[#D8D0BD] mt-0.5">
                Review and authorize procurement & courier dispatch actions
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded text-[#D8D0BD] hover:text-white hover:bg-[rgba(255,210,100,0.15)] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleApproveSubmit} className="p-5 space-y-4 text-xs">
          
          {/* Target Plan Summary */}
          {targetCand && (
            <div className="p-3 rounded bg-[rgba(20,22,17,0.7)] border border-[rgba(255,210,100,0.25)] space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase text-[#F0C75E] font-bold">
                  RECOMMENDED RECOVERY PLAN:
                </span>
                <span className="px-2 py-0.5 rounded bg-[rgba(217,166,46,0.2)] text-[#F0C75E] text-[10px] border border-[#D9A62E] font-bold">
                  ETA: {targetCand.estimated_eta_hours.toFixed(1)}h
                </span>
              </div>

              <div className="text-sm font-bold text-white">
                {targetCand.vendor_name}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#D8D0BD] pt-1 border-t border-[rgba(255,210,100,0.15)]">
                <div>
                  <span className="text-[#D8D0BD]/70 block text-[10px]">LANDED COST:</span>
                  <span className="font-bold text-white">${targetCand.total_landed_cost.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[#D8D0BD]/70 block text-[10px]">ROUTE:</span>
                  <span className="truncate block text-[#D8D0BD]">{targetCand.shipping_method.split('(')[0]}</span>
                </div>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] text-[#D8D0BD] mb-1 font-bold">
                OPERATIONS ENGINEER NAME:
              </label>
              <input 
                type="text" 
                value={approverName}
                onChange={(e) => setApproverName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded bg-[rgba(16,18,14,0.9)] border border-[rgba(255,210,100,0.25)] text-[#F7F1E4] font-mono text-xs focus:outline-none focus:border-[#D9A62E]"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#D8D0BD] mb-1 font-bold">
                A&P / PART 66 LICENSE ID:
              </label>
              <input 
                type="text" 
                value={approverLicense}
                onChange={(e) => setApproverLicense(e.target.value)}
                placeholder="A&P-884920"
                required
                className="w-full px-3 py-2 rounded bg-[rgba(16,18,14,0.9)] border border-[rgba(255,210,100,0.25)] text-[#F7F1E4] font-mono text-xs focus:outline-none focus:border-[#D9A62E]"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#D8D0BD] mb-1 font-bold">
                AUTHORIZATION NOTES:
              </label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded bg-[rgba(16,18,14,0.9)] border border-[rgba(255,210,100,0.25)] text-[#F7F1E4] font-mono text-xs focus:outline-none focus:border-[#D9A62E] resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleRejectSubmit}
              disabled={isSubmitting}
              className="px-3.5 py-2 rounded bg-[rgba(200,91,67,0.2)] border border-[#C85B43] text-[#E07A63] hover:bg-[#C85B43] hover:text-white font-bold transition text-xs cursor-pointer"
            >
              [ REJECT / REPLAN ]
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded bg-gradient-to-r from-[#D9A62E] to-[#F0C75E] hover:from-[#E2B139] hover:to-[#F7D475] text-[#252820] font-bold text-xs border border-[#F0C75E] transition cursor-pointer shadow-md"
            >
              {isSubmitting ? 'AUTHORIZING...' : '[ APPROVE RECOVERY ]'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
