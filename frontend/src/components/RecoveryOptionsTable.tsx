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
    <div className="rounded-xl bg-[#151B23] border border-[#26313D] overflow-hidden">
      
      {/* Header */}
      <div className="px-5 py-3.5 bg-[#11161D] border-b border-[#26313D] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide">
            RECOVERY PLAN EVALUATION
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Ranked candidate plans evaluated against time, cost, airworthiness, reliability, and carbon constraints
          </p>
        </div>

        <button
          onClick={() => setShowSliders(!showSliders)}
          className="flex items-center space-x-1.5 text-xs font-medium px-3 py-1 rounded-lg bg-[#1e2633] hover:bg-[#253041] border border-[#26313D] text-slate-200 transition cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>{showSliders ? 'Hide Scoring Weights' : 'Configure Weights'}</span>
        </button>
      </div>

      {/* Weight Sliders Bar */}
      {showSliders && (
        <div className="p-4 bg-[#11161D] border-b border-[#26313D] grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Delivery Time</span>
              <span className="text-cyan-400 font-mono font-bold">{Math.round(weights.delivery * 100)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.05"
              value={weights.delivery}
              onChange={(e) => handleSliderChange('delivery', parseFloat(e.target.value))}
              className="w-full accent-cyan-400 h-1 bg-slate-700 rounded cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Reliability</span>
              <span className="text-blue-400 font-mono font-bold">{Math.round(weights.reliability * 100)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.05"
              value={weights.reliability}
              onChange={(e) => handleSliderChange('reliability', parseFloat(e.target.value))}
              className="w-full accent-blue-400 h-1 bg-slate-700 rounded cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Landed Cost</span>
              <span className="text-emerald-400 font-mono font-bold">{Math.round(weights.cost * 100)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.05"
              value={weights.cost}
              onChange={(e) => handleSliderChange('cost', parseFloat(e.target.value))}
              className="w-full accent-emerald-400 h-1 bg-slate-700 rounded cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Compliance</span>
              <span className="text-purple-400 font-mono font-bold">{Math.round(weights.compliance * 100)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.05"
              value={weights.compliance}
              onChange={(e) => handleSliderChange('compliance', parseFloat(e.target.value))}
              className="w-full accent-purple-400 h-1 bg-slate-700 rounded cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Carbon (CO₂e)</span>
              <span className="text-teal-400 font-mono font-bold">{Math.round(weights.carbon * 100)}%</span>
            </div>
            <input 
              type="range" min="0" max="1" step="0.05"
              value={weights.carbon}
              onChange={(e) => handleSliderChange('carbon', parseFloat(e.target.value))}
              className="w-full accent-teal-400 h-1 bg-slate-700 rounded cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Options Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead className="bg-[#11161D] text-[11px] font-mono text-slate-400 border-b border-[#26313D] uppercase">
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
          <tbody className="divide-y divide-[#1e2633]">
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
                      ? 'bg-cyan-950/20' 
                      : isFlagged 
                      ? 'bg-red-950/10 opacity-75' 
                      : 'hover:bg-[#18202b]'
                  }`}
                >
                  <td className="py-3 px-4 font-mono font-bold">
                    <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] ${
                      isTop ? 'bg-cyan-500 text-black font-extrabold' : 'bg-slate-800 text-slate-300'
                    }`}>
                      #{cand.overall_rank || idx + 1}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-semibold text-white">{cand.vendor_name}</div>
                    <div className="text-[11px] text-slate-400">{cand.condition} • {cand.part_number}</div>
                  </td>

                  <td className="py-3 px-3 font-mono font-semibold text-slate-300">
                    {routeCode}
                  </td>

                  <td className="py-3 px-3 font-mono">
                    <div className={`font-bold ${isFlagged ? 'text-red-400' : 'text-emerald-400'}`}>
                      {cand.estimated_eta_hours.toFixed(1)}h
                    </div>
                    <div className="text-[10px] text-slate-500 font-sans">
                      {cand.estimated_eta_hours <= deadlineHours ? `Buffer: ${(deadlineHours - cand.estimated_eta_hours).toFixed(1)}h` : 'Exceeds 18h'}
                    </div>
                  </td>

                  <td className="py-3 px-3 font-mono font-semibold text-slate-200">
                    ${cand.total_landed_cost.toLocaleString()}
                  </td>

                  <td className="py-3 px-3 font-mono">
                    <span className="font-semibold text-blue-400">
                      {Math.round(cand.vendor_reliability_score * 100)}%
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    {cand.documentation_status === 'PASS' || cand.documentation_status === 'Complete' ? (
                      <span className="inline-flex items-center space-x-1 text-emerald-400 font-mono text-[11px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>PASS</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 text-amber-400 font-mono text-[11px] font-bold">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>MISSING</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right font-mono">
                    {isTop ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase">
                        #1 RECOMMENDED
                      </span>
                    ) : isFlagged ? (
                      <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/40 text-[10px] font-bold uppercase">
                        #3 DISQUALIFIED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold uppercase">
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
        <div className="p-3.5 bg-[#11161D] border-t border-[#26313D] flex items-start space-x-2 text-xs">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="text-slate-300 leading-relaxed font-sans">
            <strong className="text-cyan-300 font-mono uppercase text-[10px] tracking-wide block mb-0.5">
              SELECTION RATIONALE:
            </strong>
            {selectionReason}
          </div>
        </div>
      )}

    </div>
  );
};
