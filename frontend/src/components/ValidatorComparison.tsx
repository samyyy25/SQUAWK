import React from 'react';
import { 
  FileCheck2, 
  XCircle, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  DollarSign, 
  Clock, 
  Sparkles,
  Award
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
    <div className="space-y-4">
      
      {/* Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Validator Agent Cross-Check (AI Checking AI)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold uppercase">
                {validationResult?.status || 'COMPLIANCE AUDITED'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Evaluates all specialist candidates against airworthiness documentation completeness, supplier history, and route viability
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-slate-500">Risk Assessment:</span>
          <span className={`font-bold px-2 py-0.5 rounded ${
            validationResult?.risk_level === 'LOW' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'
          }`}>
            {validationResult?.risk_level || 'LOW'} RISK
          </span>
        </div>
      </div>

      {/* WHY THE VALIDATOR REJECTED THE CHEAPER OPTION Callout Box */}
      <div className="bg-gradient-to-r from-amber-950/40 via-[#181a20] to-cyan-950/30 border border-amber-800/60 rounded-2xl p-4.5 space-y-2.5 shadow-lg">
        <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Why The Validator Rejected The Cheaper Option</span>
        </div>

        <div className="text-xs text-slate-300 leading-relaxed pl-6 space-y-1.5">
          <p>
            <strong className="text-white">{rejectedCand?.vendor_name || 'Global Aviation Supply'}</strong> offered a lower landed price ($8,200 vs $8,750), but failed the airworthiness documentation check due to <span className="text-amber-300 font-semibold underline decoration-amber-500/60">missing authorized FAA 8130-3 / EASA Form 1 release tag</span> and lower historical supplier reliability ({Math.round((rejectedCand?.vendor_reliability_score || 0.58) * 100)}%).
          </p>
          <p className="text-[11px] text-slate-400">
            Squawk prioritized <strong className="text-cyan-300">{recommendedCand?.vendor_name || 'AeroParts Inc.'}</strong> because complete certified provenance prevents flight grounding delays upon physical gate inspection.
          </p>
        </div>
      </div>

      {/* Full Comparison Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#111c33] text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Landed Cost</th>
                <th className="py-3 px-4">ETA</th>
                <th className="py-3 px-4">Documentation Status</th>
                <th className="py-3 px-4">Reliability</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4 text-right">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
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
                        ? 'bg-cyan-950/40 font-medium' 
                        : 'hover:bg-slate-900/60'
                    }`}
                  >
                    {/* Supplier Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white font-sans">{cand.vendor_name}</span>
                        {isRec && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono text-[9px] font-bold uppercase">
                            RECOMMENDED
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">Rank #{cand.overall_rank} • {cand.condition}</div>
                    </td>

                    {/* Cost */}
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-white">${cand.total_landed_cost.toLocaleString()}</span>
                      <div className="text-[10px] text-slate-500">${cand.part_cost.toLocaleString()} + ${cand.freight_cost.toLocaleString()} frt</div>
                    </td>

                    {/* ETA */}
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-cyan-300">{cand.estimated_eta_hours} hrs</span>
                      <div className="text-[10px] text-slate-500">{cand.shipping_method || 'Hot-Shot Courier'}</div>
                    </td>

                    {/* Documentation */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1.5">
                        {cand.documentation_status === 'Complete' ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="text-emerald-300 font-semibold">Complete (8130-3 Verified)</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                            <span className="text-red-300 font-semibold">Missing 8130-3 Tag</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Reliability */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-white">{Math.round(cand.vendor_reliability_score * 100)}%</span>
                        <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${cand.vendor_reliability_score > 0.8 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                            style={{ width: `${Math.round(cand.vendor_reliability_score * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Risk */}
                    <td className="py-3.5 px-4">
                      <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                        cand.is_flagged || cand.confidence < 0.7 
                          ? 'bg-red-950 text-red-400 border-red-800' 
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}>
                        {cand.is_flagged ? 'HIGH' : 'LOW'}
                      </span>
                    </td>

                    {/* Decision */}
                    <td className="py-3.5 px-4 text-right">
                      {isRec ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>RECOMMEND</span>
                        </span>
                      ) : isFlagged ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-red-950 text-red-300 border border-red-800 font-mono font-bold text-[11px]">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>REJECT</span>
                        </span>
                      ) : (
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 font-mono text-[11px]">
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
