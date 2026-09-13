import React from 'react';
import { 
  BrainCircuit, 
  Target, 
  Eye, 
  Play, 
  CheckCircle2
} from 'lucide-react';
import { DecisionTraceStep } from '../types';

interface DecisionTraceProps {
  trace: DecisionTraceStep[];
}

export const DecisionTrace: React.FC<DecisionTraceProps> = ({ trace }) => {
  if (!trace || trace.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl bg-[#151B23] border border-[#26313D] overflow-hidden">
      <div className="px-5 py-3.5 bg-[#11161D] border-b border-[#26313D] flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              AGENT DECISION TRACE
            </h3>
            <p className="text-[11px] text-slate-400">
              Auditable structured logic: Goal → Observation → Action → Outcome
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-purple-300 bg-purple-950/60 border border-purple-800/50 px-2 py-0.5 rounded">
          {trace.length} DECISIONS
        </span>
      </div>

      <div className="p-4 space-y-2.5 max-h-96 overflow-y-auto font-sans text-xs">
        {trace.map((step, idx) => {
          const isDisruption = step.step.includes('DISRUPTION') || step.step.includes('REPLAN');
          return (
            <div 
              key={idx}
              className={`p-3 rounded-lg border transition ${
                isDisruption 
                  ? 'bg-amber-950/20 border-amber-800/40' 
                  : 'bg-[#11161D] border-[#26313D]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded bg-[#151B23] border border-[#26313D] text-slate-300 font-mono text-[10px] flex items-center justify-center font-bold">
                    #{idx + 1}
                  </span>
                  <span className={`font-mono text-[11px] font-bold uppercase ${
                    isDisruption ? 'text-amber-400' : 'text-cyan-400'
                  }`}>
                    {step.step}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {step.timestamp ? new Date(step.timestamp).toLocaleTimeString() : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                <div className="space-y-1">
                  <div>
                    <span className="text-slate-500 font-bold uppercase text-[10px] mr-1.5 font-mono">GOAL:</span>
                    <span className="text-slate-200">{step.goal}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold uppercase text-[10px] mr-1.5 font-mono">OBSERVATION:</span>
                    <span className="text-slate-300">{step.observation}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div>
                    <span className="text-slate-500 font-bold uppercase text-[10px] mr-1.5 font-mono">ACTION:</span>
                    <span className="text-cyan-300 font-mono text-[10.5px]">{step.action || step.reasoning}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold uppercase text-[10px] mr-1.5 font-mono">OUTCOME:</span>
                    <span className="text-emerald-300 font-semibold">{step.outcome}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
