import React from 'react';
import { 
  Sparkles
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
      width: '100%'
    },
    {
      title: 'Supplier Reliability History',
      desc: '94% on-time delivery track record across 48 verified maintenance orders.',
      score: `${Math.round(candidate.vendor_reliability_score * 100)}%`,
      width: `${Math.round(candidate.vendor_reliability_score * 100)}%`
    },
    {
      title: 'Delivery Speed & Proximity',
      desc: 'Dedicated hot-shot flight courier from regional hub (DEL arrival in 4.5 hrs).',
      score: '4.5h ETA',
      width: '90%'
    },
    {
      title: 'Direct IPC Part Number Compatibility',
      desc: 'Direct rotable OEM interchangeability match with zero engineering variance.',
      score: 'Exact Match',
      width: '100%'
    },
    {
      title: 'Historical Vendor Memory Performance',
      desc: 'Zero documented tag discrepancies or delay penalties in previous 90 days.',
      score: 'A+ Grade',
      width: '95%'
    }
  ];

  return (
    <div className="bg-[#000000] border border-[#830000] rounded-xl p-4 space-y-3 shadow-xl font-mono">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded bg-[#0D0D0D] border border-[#830000] text-[#BC0202]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              WHY SQUAWK RECOMMENDS THIS SUPPLIER
            </h4>
            <p className="text-[11px] text-neutral-400 font-sans">
              Explainable multi-criteria decision weighting matrix
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-neutral-500 uppercase">SELECTED:</span>
          <span className="px-2 py-0.5 rounded bg-[#830000] text-white border border-[#BC0202] font-bold text-xs">
            {candidate.vendor_name}
          </span>
        </div>
      </div>

      {/* Factor Breakdown Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {factors.map((f, idx) => (
          <div key={idx} className="bg-[#080808] p-3 rounded border border-[#1E1E1E] space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white font-sans">{f.title}</span>
              <span className="font-mono text-white font-bold text-[11px]">{f.score}</span>
            </div>
            
            <p className="text-[11px] text-neutral-400 leading-snug font-sans">
              {f.desc}
            </p>

            <div className="w-full bg-[#1E1E1E] h-1.5 rounded overflow-hidden">
              <div className="h-full bg-[#830000]" style={{ width: f.width }} />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
