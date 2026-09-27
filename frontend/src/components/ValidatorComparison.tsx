import React from 'react';
import { 
  XCircle, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck
} from 'lucide-react';
import { RecoveryCandidate, ValidationResult } from '../types';

interface ValidatorComparisonProps {
  candidates: RecoveryCandidate[];
  validationResult?: ValidationResult;
  selectedCandidate: RecoveryCandidate | null;
  onSelectCandidate: (candidate: RecoveryCandidate) => void;
}

export const ValidatorComparison: React.FC<ValidatorComparisonProps> = ({
  candidates,
  validationResult,
  selectedCandidate,
  onSelectCandidate
}) => {
  // Find cheaper vs compliant candidate for the explainability comparison
  const rejectedCand = candidates.find(c => c.is_flagged) || candidates[1];
  const recommendedCand = candidates.find(c => c.is_recommended) || candidates[0];

  return (
    <div className="space-y-3 font-mono">
      
      {/* Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E1E1E] pb-2.5">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded bg-[#0D0D0D] border border-[#830000] text-[#BC0202]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white flex items-center space-x-2 uppercase tracking-wider">
              <span>VALIDATOR AGENT CROSS-CHECK (MULTI-AGENT SAFETY GATE)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#0D0D0D] text-white border border-[#830000] font-bold uppercase">
                {validationResult?.status || 'COMPLIANCE AUDITED'}
              </span>
            </h3>
            <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
              Audits all specialist candidates against airworthiness documentation, vendor track record, and deadline viability
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-neutral-500">RISK LEVEL:</span>
          <span className={`font-bold px-2 py-0.5 rounded ${
            validationResult?.risk_level === 'LOW' ? 'bg-[#0D0D0D] text-white border border-[#1E1E1E]' : 'bg-[#000000] text-[#FF0000] border border-[#FF0000]'
          }`}>
            {validationResult?.risk_level || 'LOW'} RISK
          </span>
        </div>
      </div>

      {/* WHY THE VALIDATOR REJECTED THE CHEAPER OPTION Callout Box */}
      <div className="bg-[#000000] border border-[#830000] rounded-xl p-4 space-y-2 shadow-lg">
        <div className="flex items-center space-x-2 text-white text-xs font-bold uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-[#BC0202] shrink-0" />
          <span>WHY THE VALIDATOR REJECTED THE CHEAPER OPTION</span>
        </div>

        <div className="text-xs text-neutral-300 leading-relaxed pl-6 space-y-1 font-sans">
          <p>
            <strong className="text-white">{rejectedCand?.vendor_name || 'Global Aviation Supply'}</strong> offered a lower landed price ($8,200 vs $14,700), but failed the airworthiness documentation check due to <span className="text-[#BC0202] font-semibold underline">missing authorized FAA 8130-3 / EASA Form 1 release tag</span> and lower historical supplier reliability ({Math.round((rejectedCand?.vendor_reliability_score || 0.58) * 100)}%).
          </p>
          <p className="text-[11px] text-neutral-400">
            SQUAWK prioritized <strong className="text-white">{recommendedCand?.vendor_name || 'SkySupply Global'}</strong> because verified traceability prevents grounding delays upon physical arrival at DEL.
          </p>
        </div>
      </div>

      {/* Full Comparison Table */}
      <div className="bg-[#000000] border border-[#830000] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-[#080808] text-neutral-400 font-mono text-[10px] uppercase border-b border-[#1E1E1E]">
              <tr>
                <th className="py-2.5 px-3">SUPPLIER</th>
                <th className="py-2.5 px-3">LANDED COST</th>
                <th className="py-2.5 px-3">ETA</th>
                <th className="py-2.5 px-3">DOCUMENTATION</th>
                <th className="py-2.5 px-3">RELIABILITY</th>
                <th className="py-2.5 px-3">RISK</th>
                <th className="py-2.5 px-3 text-right">DECISION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1E1E]">
              {candidates.map((cand) => {
                const isSelected = selectedCandidate?.id === cand.id;
                const isRec = cand.is_recommended;
                const isFlagged = cand.is_flagged;

                return (
                  <tr 
                    key={cand.id}
                    onClick={() => onSelectCandidate(cand)}
                    className={`cursor-pointer transition ${
                      isSelected 
                        ? 'bg-[#0D0D0D] text-white font-medium' 
                        : 'hover:bg-[#080808]'
                    }`}
                  >
                    {/* Supplier Name */}
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white font-sans">{cand.vendor_name}</span>
                        {isRec && (
                          <span className="px-1.5 py-0.2 rounded bg-[#830000] text-white border border-[#BC0202] text-[9px] font-bold uppercase">
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-neutral-500">Rank #{cand.overall_rank} • {cand.condition}</div>
                    </td>

                    {/* Cost */}
                    <td className="py-3 px-3">
                      <span className="font-bold text-white">${cand.total_landed_cost.toLocaleString()}</span>
                      <div className="text-[10px] text-neutral-500">${cand.part_cost.toLocaleString()} + ${cand.freight_cost.toLocaleString()} frt</div>
                    </td>

                    {/* ETA */}
                    <td className="py-3 px-3">
                      <span className="font-bold text-white">{cand.estimated_eta_hours} hrs</span>
                      <div className="text-[10px] text-neutral-500">{cand.shipping_method || 'Express Air Freight'}</div>
                    </td>

                    {/* Documentation */}
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-1.5">
                        {cand.documentation_status === 'Complete' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#BC0202] shrink-0" />
                            <span className="text-white font-semibold">Complete (8130-3 Verified)</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-[#FF0000] shrink-0" />
                            <span className="text-[#FF0000] font-semibold">Missing 8130-3 Tag</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Reliability */}
                    <td className="py-3 px-3">
                      <span className="font-bold text-white">{Math.round(cand.vendor_reliability_score * 100)}%</span>
                    </td>

                    {/* Risk */}
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        cand.is_flagged || cand.confidence < 0.7 
                          ? 'bg-[#000000] text-[#FF0000] border-[#FF0000]' 
                          : 'bg-[#0D0D0D] text-white border-[#1E1E1E]'
                      }`}>
                        {cand.is_flagged ? 'HIGH' : 'LOW'}
                      </span>
                    </td>

                    {/* Decision */}
                    <td className="py-3 px-3 text-right">
                      {isRec ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-[#830000] text-white border border-[#BC0202] font-bold text-[10px]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>RECOMMEND</span>
                        </span>
                      ) : isFlagged ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-[#000000] text-[#FF0000] border border-[#FF0000] font-bold text-[10px]">
                          <XCircle className="w-3 h-3" />
                          <span>REJECT</span>
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded bg-[#080808] text-neutral-400 border border-[#1E1E1E] text-[10px]">
                          SECONDARY
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
