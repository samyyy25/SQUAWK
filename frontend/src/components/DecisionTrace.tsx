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
    <div className="rounded-xl bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(217,166,46,0.3)] overflow-hidden font-mono text-[#252820] shadow-md">
      <div className="px-4 py-3 bg-[rgba(255,248,235,0.9)] border-b border-[rgba(217,166,46,0.25)] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-[rgba(217,166,46,0.18)] text-[#A87813] border border-[#D9A62E] shadow-sm">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#252820] tracking-wide uppercase font-sans">
              AGENT DECISION TRACE
            </h3>
            <p className="text-[10px] text-[#4A483E] font-sans">
              Auditable structured logic: Goal → Observation → Action → Outcome
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-[#A87813] bg-[rgba(217,166,46,0.15)] border border-[rgba(217,166,46,0.35)] px-2 py-0.5 rounded font-bold">
          {trace.length} DECISIONS
        </span>
      </div>

      <div className="p-3 space-y-2 max-h-96 overflow-y-auto text-xs">
        {trace.map((step, idx) => {
          const isDisruption = step.step.includes('DISRUPTION') || step.step.includes('REPLAN');
          return (
            <div 
              key={idx}
              className={`p-2.5 rounded-lg border transition shadow-sm ${
                isDisruption 
                  ? 'bg-[#C85B43]/10 border-[#C85B43]/50' 
                  : 'bg-[rgba(255,255,255,0.85)] border-[rgba(217,166,46,0.25)] hover:border-[#D9A62E]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-[rgba(217,166,46,0.15)] border border-[rgba(217,166,46,0.35)] text-[#A87813] text-[10px] flex items-center justify-center font-bold">
                    #{idx + 1}
                  </span>
                  <span className={`text-[11px] font-bold uppercase ${
                    isDisruption ? 'text-[#C85B43]' : 'text-[#252820]'
                  }`}>
                    {step.step}
                  </span>
                </div>
                <span className="text-[10px] text-[#8C8472] font-mono">
                  {step.timestamp ? new Date(step.timestamp).toLocaleTimeString() : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px]">
                <div className="space-y-0.5">
                  <div>
                    <span className="text-[#8C8472] font-bold uppercase mr-1">GOAL:</span>
                    <span className="text-[#252820] font-sans">{step.goal}</span>
                  </div>
                  <div>
                    <span className="text-[#8C8472] font-bold uppercase mr-1">OBSERVATION:</span>
                    <span className="text-[#4A483E] font-sans">{step.observation}</span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div>
                    <span className="text-[#8C8472] font-bold uppercase mr-1">ACTION:</span>
                    <span className="text-[#252820] font-sans font-medium">{step.action || step.reasoning}</span>
                  </div>
                  <div>
                    <span className="text-[#8C8472] font-bold uppercase mr-1">OUTCOME:</span>
                    <span className="text-[#4E6B42] font-sans font-semibold">{step.outcome}</span>
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
