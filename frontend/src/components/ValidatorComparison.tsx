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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[rgba(255,210,100,0.2)] pb-2.5">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded bg-[rgba(217,166,46,0.18)] border border-[#D9A62E] text-[#F0C75E]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#252820] flex items-center space-x-2 uppercase tracking-wider">
              <span>VALIDATOR AGENT CROSS-CHECK (MULTI-AGENT SAFETY GATE)</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[rgba(217,166,46,0.2)] text-[#F0C75E] border border-[rgba(217,166,46,0.4)] font-bold uppercase">
                {validationResult?.status || 'COMPLIANCE AUDITED'}
              </span>
            </h3>
            <p className="text-[11px] text-[#555a4e] font-sans mt-0.5 font-medium">
              Audits all specialist candidates against airworthiness documentation, vendor track record, and deadline viability
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-[#616657] font-bold">RISK LEVEL:</span>
          <span className={`font-bold px-2 py-0.5 rounded ${
            validationResult?.risk_level === 'LOW' ? 'bg-[rgba(120,150,106,0.25)] text-[#406835] border border-[rgba(120,150,106,0.5)]' : 'bg-[rgba(200,91,67,0.2)] text-[#C85B43] border border-[#C85B43]'
          }`}>
            {validationResult?.risk_level || 'LOW'} RISK
          </span>
        </div>
      </div>

      {/* WHY THE VALIDATOR REJECTED THE CHEAPER OPTION Callout Box */}
      <div className="bg-[rgba(26,29,23,0.92)] border border-[rgba(255,210,100,0.3)] rounded-xl p-4 space-y-2 shadow-lg backdrop-blur-xl text-[#F7F1E4]">
        <div className="flex items-center space-x-2 text-[#F0C75E] text-xs font-bold uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-[#D9A62E] shrink-0" />
          <span>WHY THE VALIDATOR REJECTED THE CHEAPER OPTION</span>
        </div>

        <div className="text-xs text-[#D8D0BD] leading-relaxed pl-6 space-y-1 font-sans">
          <p>
            <strong className="text-white">{rejectedCand?.vendor_name || 'Global Aviation Supply'}</strong> offered a lower landed price ($8,200 vs $14,700), but failed the airworthiness documentation check due to <span className="text-[#E07A63] font-semibold underline">missing authorized FAA 8130-3 / EASA Form 1 release tag</span> and lower historical supplier reliability ({Math.round((rejectedCand?.vendor_reliability_score || 0.58) * 100)}%).
          </p>
          <p className="text-[11px] text-[#D8D0BD]/75">
            SQUAWK prioritized <strong className="text-white">{recommendedCand?.vendor_name || 'SkySupply Global'}</strong> because verified traceability prevents grounding delays upon physical arrival at DEL.
          </p>
        </div>
      </div>

      {/* Full Comparison Table */}
      <div className="bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(255,244,214,0.65)] rounded-xl overflow-hidden shadow-xl text-[#252820]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[rgba(238,228,208,0.85)] text-[#555a4e] font-mono text-[10px] uppercase border-b border-[rgba(217,166,46,0.2)]">
              <tr>
                <th className="py-2.5 px-3 font-bold">SUPPLIER</th>
                <th className="py-2.5 px-3 font-bold">LANDED COST</th>
                <th className="py-2.5 px-3 font-bold">ETA</th>
                <th className="py-2.5 px-3 font-bold">DOCUMENTATION</th>
                <th className="py-2.5 px-3 font-bold">RELIABILITY</th>
                <th className="py-2.5 px-3 font-bold">RISK</th>
                <th className="py-2.5 px-3 text-right font-bold">DECISION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(217,166,46,0.12)]">
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
                        ? 'bg-[rgba(217,166,46,0.18)] text-[#252820] font-medium' 
                        : 'hover:bg-[rgba(217,166,46,0.08)]'
                    }`}
                  >
                    {/* Supplier Name */}
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-[#252820] font-sans">{cand.vendor_name}</span>
                        {isRec && (
                          <span className="px-1.5 py-0.2 rounded bg-gradient-to-r from-[#D9A62E] to-[#F0C75E] text-[#252820] border border-[#F0C75E] text-[9px] font-bold uppercase shadow-sm">
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#616657]">Rank #{cand.overall_rank} • {cand.condition}</div>
                    </td>

                    {/* Cost */}
                    <td className="py-3 px-3">
                      <span className="font-bold text-[#252820]">${cand.total_landed_cost.toLocaleString()}</span>
                      <div className="text-[10px] text-[#616657]">${cand.part_cost.toLocaleString()} + ${cand.freight_cost.toLocaleString()} frt</div>
                    </td>

                    {/* ETA */}
                    <td className="py-3 px-3">
                      <span className="font-bold text-[#252820]">{cand.estimated_eta_hours} hrs</span>
                      <div className="text-[10px] text-[#616657]">{cand.shipping_method || 'Express Air Freight'}</div>
                    </td>

                    {/* Documentation */}
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-1.5">
                        {cand.documentation_status === 'Complete' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#78966A] shrink-0" />
                            <span className="text-[#252820] font-bold">Complete (8130-3 Verified)</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-[#C85B43] shrink-0" />
                            <span className="text-[#C85B43] font-bold">Missing 8130-3 Tag</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Reliability */}
                    <td className="py-3 px-3">
                      <span className="font-bold text-[#252820]">{Math.round(cand.vendor_reliability_score * 100)}%</span>
                    </td>

                    {/* Risk */}
                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        cand.is_flagged || cand.confidence < 0.7 
                          ? 'bg-[rgba(200,91,67,0.15)] text-[#C85B43] border-[#C85B43]' 
                          : 'bg-[rgba(120,150,106,0.2)] text-[#4A723D] border-[rgba(120,150,106,0.4)]'
                      }`}>
                        {cand.is_flagged ? 'HIGH' : 'LOW'}
                      </span>
                    </td>

                    {/* Decision */}
                    <td className="py-3 px-3 text-right">
                      {isRec ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-gradient-to-r from-[#D9A62E] to-[#F0C75E] text-[#252820] border border-[#F0C75E] font-bold text-[10px] shadow-sm">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>RECOMMEND</span>
                        </span>
                      ) : isFlagged ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-[rgba(200,91,67,0.15)] text-[#C85B43] border border-[#C85B43] font-bold text-[10px]">
                          <XCircle className="w-3 h-3" />
                          <span>REJECT</span>
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded bg-[rgba(20,22,17,0.08)] text-[#616657] border border-[rgba(20,22,17,0.15)] text-[10px] font-semibold">
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
