import React from 'react';
import { 
  Bot, 
  Search, 
  FileCheck2, 
  Truck, 
  Sliders, 
  ShieldCheck
} from 'lucide-react';

interface AgentActivityCardsProps {
  currentStage: string;
  replanCount: number;
  isDisrupted: boolean;
  isVerified: boolean;
}

export const AgentActivityCards: React.FC<AgentActivityCardsProps> = ({
  currentStage,
  replanCount,
  isDisrupted,
  isVerified
}) => {
  const agents = [
    {
      id: 'orchestrator',
      name: 'Orchestrator',
      purpose: 'Master workflow & task state',
      icon: Bot,
      status: isVerified ? 'COMPLETE' : isDisrupted ? 'REPLANNING' : currentStage === 'HUMAN_REVIEW' ? 'AWAITING HUMAN' : 'ACTIVE',
      statusColor: isVerified ? 'text-emerald-400' : isDisrupted ? 'text-amber-400' : 'text-cyan-400',
      activeTool: isVerified ? 'verify_recovery()' : isDisrupted ? 'replan_recovery()' : 'get_aircraft_status()'
    },
    {
      id: 'sourcing',
      name: 'Sourcing Agent',
      purpose: 'Supplier & rotable discovery',
      icon: Search,
      status: isDisrupted ? 'RE-QUERYING' : 'COMPLETE',
      statusColor: isDisrupted ? 'text-amber-400' : 'text-emerald-400',
      activeTool: 'search_suppliers()'
    },
    {
      id: 'compliance',
      name: 'Compliance Agent',
      purpose: 'FAA 8130-3 & EASA verification',
      icon: FileCheck2,
      status: 'COMPLETE',
      statusColor: 'text-emerald-400',
      activeTool: 'verify_part()'
    },
    {
      id: 'logistics',
      name: 'Logistics Agent',
      purpose: 'NFO flight & freight routing',
      icon: Truck,
      status: 'COMPLETE',
      statusColor: 'text-emerald-400',
      activeTool: 'calculate_route()'
    },
    {
      id: 'optimization',
      name: 'Optimization Agent',
      purpose: 'Multi-attribute scoring model',
      icon: Sliders,
      status: replanCount > 0 ? `RE-SCORED (v${replanCount + 1})` : 'COMPLETE',
      statusColor: 'text-emerald-400',
      activeTool: 'optimize_recovery()'
    },
    {
      id: 'validator',
      name: 'Validator Agent',
      purpose: 'AI Checking AI & verification',
      icon: ShieldCheck,
      status: isVerified ? 'VERIFIED (7/7)' : 'COMPLETE',
      statusColor: 'text-emerald-400',
      activeTool: isVerified ? 'verify_recovery()' : 'validate_plan()'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {agents.map((ag) => {
        const Icon = ag.icon;
        return (
          <div 
            key={ag.id}
            className="p-3.5 rounded-xl bg-[#151B23] border border-[#26313D] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="p-1.5 rounded-lg bg-[#11161D] border border-[#26313D] text-slate-300">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className={`text-[10px] font-mono font-bold ${ag.statusColor}`}>
                  ● {ag.status}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white tracking-wide">
                {ag.name}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                {ag.purpose}
              </p>
            </div>

            <div className="mt-2.5 pt-2 border-t border-[#26313D]">
              <span className="text-[10px] font-mono text-cyan-400 font-semibold block truncate">
                {ag.activeTool}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
