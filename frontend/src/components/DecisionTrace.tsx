import React from 'react';
import { 
  BrainCircuit
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
    <div className="rounded-xl bg-[#000000] border border-[#830000] overflow-hidden font-mono">
      <div className="px-4 py-3 bg-[#080808] border-b border-[#1E1E1E] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-[#0D0D0D] text-[#BC0202]">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">
              AGENT DECISION TRACE
            </h3>
            <p className="text-[10px] text-neutral-400 font-sans">
              Auditable structured logic: Goal → Observation → Action → Outcome
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-white bg-[#0D0D0D] border border-[#1E1E1E] px-2 py-0.5 rounded">
          {trace.length} DECISIONS
        </span>
      </div>

      <div className="p-3 space-y-2 max-h-96 overflow-y-auto text-xs">
        {trace.map((step, idx) => {
          const isDisruption = step.step.includes('DISRUPTION') || step.step.includes('REPLAN');
          return (
            <div 
              key={idx}
              className={`p-2.5 rounded border transition ${
                isDisruption 
                  ? 'bg-[#0D0D0D] border-[#BC0202]' 
                  : 'bg-[#080808] border-[#1E1E1E]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded bg-[#000000] border border-[#1E1E1E] text-neutral-400 text-[10px] flex items-center justify-center font-bold">
                    #{idx + 1}
                  </span>
                  <span className={`text-[11px] font-bold uppercase ${
                    isDisruption ? 'text-[#BC0202]' : 'text-white'
                  }`}>
                    {step.step}
                  </span>
                </div>
                <span className="text-[10px] text-neutral-500">
                  {step.timestamp ? new Date(step.timestamp).toLocaleTimeString() : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px]">
                <div className="space-y-0.5">
                  <div>
                    <span className="text-neutral-500 font-bold uppercase mr-1">GOAL:</span>
                    <span className="text-neutral-200">{step.goal}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 font-bold uppercase mr-1">OBSERVATION:</span>
                    <span className="text-neutral-300">{step.observation}</span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div>
                    <span className="text-neutral-500 font-bold uppercase mr-1">ACTION:</span>
                    <span className="text-white">{step.action || step.reasoning}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 font-bold uppercase mr-1">OUTCOME:</span>
                    <span className="text-neutral-200 font-semibold">{step.outcome}</span>
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
