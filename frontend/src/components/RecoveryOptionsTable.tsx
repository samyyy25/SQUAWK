import React, { useState } from 'react';
import { 
  Sliders, 
  CheckCircle2, 
  XCircle,
  Info
} from 'lucide-react';
import { RecoveryCandidate } from '../types';

interface RecoveryOptionsTableProps {
  candidates: RecoveryCandidate[];
  activePlan: any;
  deadlineHours: number;
  selectionReason?: string;
  scoringWeights?: Record<string, number>;
  onWeightChange?: (weights: Record<string, number>) => void;
}

export const RecoveryOptionsTable: React.FC<RecoveryOptionsTableProps> = ({
  candidates,
  activePlan,
  deadlineHours = 18.0,
  selectionReason,
  scoringWeights = { delivery: 0.40, reliability: 0.25, cost: 0.15, compliance: 0.10, carbon: 0.10 },
  onWeightChange
}) => {
  const [showSliders, setShowSliders] = useState(false);
  const [weights, setWeights] = useState(scoringWeights);

  const handleSliderChange = (key: string, val: number) => {
    const updated = { ...weights, [key]: val };
    setWeights(updated);
    if (onWeightChange) onWeightChange(updated);
  };

  return (
    <div className="rounded-xl bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(217,166,46,0.3)] overflow-hidden font-mono shadow-md text-[#252820]">
      
      {/* Header */}
      <div className="px-5 py-3.5 bg-[rgba(255,248,235,0.9)] border-b border-[rgba(217,166,46,0.25)] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#252820] tracking-wide font-sans">
            RECOVERY PLAN EVALUATION
          </h3>
          <p className="text-[11px] text-[#4A483E] mt-0.5 font-sans">
            Ranked candidate plans evaluated against time, cost, airworthiness, reliability, and carbon constraints
          </p>
        </div>

        <button
          onClick={() => setShowSliders(!showSliders)}
          className="flex items-center space-x-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-[rgba(38,42,34,0.7)] hover:bg-[rgba(52,58,46,0.9)] border border-[rgba(255,210,100,0.3)] text-[#F7F1E4] transition cursor-pointer shadow-sm"
        >
          <Sliders className="w-3.5 h-3.5 text-[#F0C75E]" />
          <span>{showSliders ? 'Hide Scoring Weights' : 'Configure Weights'}</span>
        </button>
      </div>

      {/* Weight Sliders Bar */}
      {showSliders && (
        <div className="p-4 bg-[rgba(255,248,235,0.85)] border-b border-[rgba(217,166,46,0.25)] grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div>
            <div className="flex justify-between text-[11px] text-[#4A483E] mb-1">
              <span>Delivery Time</span>
              <span className="text-[#A87813] font-mono font-bold">{Math.round(weights.delivery * 100)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.05"
              value={weights.delivery}
              onChange={(e) => handleSliderChange('delivery', parseFloat(e.target.value))}
              className="w-full accent-[#D9A62E] h-1 bg-[#D8D0BD] rounded cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-[11px] text-[#4A483E] mb-1">
              <span>Reliability</span>
              <span className="text-[#4E6B42] font-mono font-bold">{Math.round(weights.reliability * 100)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.05"
              value={weights.reliability}
              onChange={(e) => handleSliderChange('reliability', parseFloat(e.target.value))}
              className="w-full accent-[#78966A] h-1 bg-[#D8D0BD] rounded cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-[11px] text-[#4A483E] mb-1">
              <span>Landed Cost</span>
              <span className="text-[#A87813] font-mono font-bold">{Math.round(weights.cost * 100)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.05"
              value={weights.cost}
              onChange={(e) => handleSliderChange('cost', parseFloat(e.target.value))}
              className="w-full accent-[#D9A62E] h-1 bg-[#D8D0BD] rounded cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-[11px] text-[#4A483E] mb-1">
              <span>Compliance</span>
              <span className="text-[#4E6B42] font-mono font-bold">{Math.round(weights.compliance * 100)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.05"
              value={weights.compliance}
              onChange={(e) => handleSliderChange('compliance', parseFloat(e.target.value))}
              className="w-full accent-[#78966A] h-1 bg-[#D8D0BD] rounded cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-[11px] text-[#4A483E] mb-1">
              <span>Carbon (CO₂e)</span>
              <span className="text-[#A87813] font-mono font-bold">{Math.round(weights.carbon * 100)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.05"
              value={weights.carbon}
              onChange={(e) => handleSliderChange('carbon', parseFloat(e.target.value))}
              className="w-full accent-[#D9A62E] h-1 bg-[#D8D0BD] rounded cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Options Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-[rgba(255,245,230,0.95)] text-[11px] font-mono text-[#8C8472] border-b border-[rgba(217,166,46,0.25)] uppercase font-bold">
            <tr>
              <th className="py-2.5 px-4">Rank</th>
              <th className="py-2.5 px-3">Supplier</th>
              <th className="py-2.5 px-3">Route</th>
              <th className="py-2.5 px-3">ETA</th>
              <th className="py-2.5 px-3">Cost</th>
              <th className="py-2.5 px-3">Reliability</th>
              <th className="py-2.5 px-3">Compliance</th>
              <th className="py-2.5 px-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(217,166,46,0.2)]">
            {candidates.map((cand, idx) => {
              const isTop = cand.is_recommended;
              const isFlagged = cand.is_flagged || cand.estimated_eta_hours > deadlineHours;
              
              const routeCode = cand.vendor_name.includes('Singapore') || cand.shipping_method.includes('SIN') 
                ? 'SIN → DEL' 
                : cand.vendor_name.includes('Mumbai') || cand.shipping_method.includes('BOM') 
                ? 'BOM → DEL' 
                : 'FRA → DEL';

              return (
                <tr 
                  key={cand.id || idx}
                  className={`transition ${
                    isTop 
                      ? 'bg-[rgba(217,166,46,0.12)]' 
                      : isFlagged 
                      ? 'bg-[#C85B43]/10 opacity-75' 
                      : 'hover:bg-[rgba(255,248,235,0.7)]'
                  }`}
                >
                  <td className="py-3 px-4 font-mono font-bold">
                    <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] ${
                      isTop ? 'bg-gradient-to-r from-[#D9A62E] to-[#F0C75E] text-[#252820] font-extrabold shadow-sm' : 'bg-[rgba(217,166,46,0.15)] text-[#A87813] border border-[rgba(217,166,46,0.35)]'
                    }`}>
                      #{cand.overall_rank || idx + 1}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-semibold text-[#252820] font-sans">{cand.vendor_name}</div>
                    <div className="text-[11px] text-[#4A483E]">{cand.condition} • {cand.part_number}</div>
                  </td>

                  <td className="py-3 px-3 font-mono font-semibold text-[#252820]">
                    {routeCode}
                  </td>

                  <td className="py-3 px-3 font-mono">
                    <div className={`font-bold ${isFlagged ? 'text-[#E07A5F]' : 'text-[#4E6B42]'}`}>
                      {cand.estimated_eta_hours.toFixed(1)}h
                    </div>
                    <div className="text-[10px] text-[#8C8472] font-sans">
                      {cand.estimated_eta_hours <= deadlineHours ? `Buffer: ${(deadlineHours - cand.estimated_eta_hours).toFixed(1)}h` : 'Exceeds 18h'}
                    </div>
                  </td>

                  <td className="py-3 px-3 font-mono font-semibold text-[#252820]">
                    ${cand.total_landed_cost.toLocaleString()}
                  </td>

                  <td className="py-3 px-3 font-mono">
                    <span className="font-semibold text-[#4E6B42]">
                      {Math.round(cand.vendor_reliability_score * 100)}%
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    {cand.documentation_status === 'PASS' || cand.documentation_status === 'Complete' ? (
                      <span className="inline-flex items-center space-x-1 text-[#4E6B42] font-mono text-[11px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#78966A]" />
                        <span>PASS</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-[#A87813] font-mono text-[11px] font-bold">
                        <XCircle className="w-3.5 h-3.5 text-[#D9A62E]" />
                        <span>MISSING</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right font-mono">
                    {isTop ? (
                      <span className="px-2 py-0.5 rounded bg-[#78966A]/20 text-[#4E6B42] border border-[#78966A]/40 text-[10px] font-bold uppercase">
                        #1 RECOMMENDED
                      </span>
                    ) : isFlagged ? (
                      <span className="px-2 py-0.5 rounded bg-[#C85B43]/20 text-[#C85B43] border border-[#C85B43]/40 text-[10px] font-bold uppercase">
                        #3 DISQUALIFIED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-[rgba(217,166,46,0.15)] text-[#A87813] border border-[rgba(217,166,46,0.35)] text-[10px] font-bold uppercase">
                        #2 BACKUP
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Selection Rationale Box */}
      {selectionReason && (
        <div className="p-3.5 bg-[rgba(255,248,235,0.9)] border-t border-[rgba(217,166,46,0.25)] flex items-start space-x-2 text-xs">
          <Info className="w-4 h-4 text-[#A87813] shrink-0 mt-0.5" />
          <div className="text-[#4A483E] leading-relaxed font-sans">
            <strong className="text-[#A87813] font-mono uppercase text-[10px] tracking-wide block mb-0.5">
              SELECTION RATIONALE:
            </strong>
            {selectionReason}
          </div>
        </div>
      )}

    </div>
  );
};
