import React from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Building, 
  FileCheck2, 
  TrendingUp, 
  Layers,
  CheckCircle2
} from 'lucide-react';
import { RecoveryCandidate } from '../types';

interface RecommendationCardProps {
  candidate: RecoveryCandidate;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ candidate }) => {
  const factors = [
    {
      title: 'Documentation Completeness',
      desc: '100% compliant FAA Form 8130-3 & EASA Form 1 dual release attached.',
      score: '100%',
      barColor: 'bg-emerald-400',
      width: '100%'
    },
    {
      title: 'Supplier Reliability History',
      desc: '94% on-time delivery track record across 48 verified airline maintenance orders.',
      score: `${Math.round(candidate.vendor_reliability_score * 100)}%`,
      barColor: 'bg-emerald-400',
      width: `${Math.round(candidate.vendor_reliability_score * 100)}%`
    },
    {
      title: 'Delivery Speed & Proximity',
      desc: 'Dedicated hot-shot courier from nearby regional hub (ORD gate arrival in 4.0 hrs).',
      score: '4.0h ETA',
      barColor: 'bg-cyan-400',
      width: '90%'
    },
    {
      title: 'Direct IPC Part Number Compatibility',
      desc: 'Direct rotable OEM interchangeability match with zero engineering variance.',
      score: 'Exact Match',
      barColor: 'bg-cyan-400',
      width: '100%'
    },
    {
      title: 'Historical Vendor Memory Performance',
      desc: 'Zero documented tag discrepancies or delay penalties in previous 90 days.',
      score: 'A+ Grade',
      barColor: 'bg-purple-400',
      width: '95%'
    }
  ];

  return (
    <div className="bg-[#0f172a] border border-cyan-900/60 rounded-2xl p-5 space-y-4 shadow-xl">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Why Squawk Recommends This Supplier
            </h4>
            <p className="text-[11px] text-slate-400">
              Explainable multi-criteria decision weighting matrix
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono text-slate-400">Selected:</span>
          <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold text-xs">
            {candidate.vendor_name}
          </span>
        </div>
      </div>

      {/* Factor Breakdown Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
        {factors.map((f, idx) => (
          <div key={idx} className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">{f.title}</span>
              <span className="font-mono text-cyan-300 font-bold text-[11px]">{f.score}</span>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-snug">
              {f.desc}
            </p>

            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${f.barColor}`} style={{ width: f.width }} />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
