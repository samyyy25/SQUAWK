import React, { useState } from 'react';
import { 
  Terminal, 
  Clock, 
  ChevronDown, 
  ChevronRight,
  Code
} from 'lucide-react';
import { ToolCallRecord } from '../types';

interface LiveAgentTimelineProps {
  toolCalls: ToolCallRecord[];
}

export const LiveAgentTimeline: React.FC<LiveAgentTimelineProps> = ({ toolCalls }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!toolCalls || toolCalls.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-[#151B23] border border-[#26313D] text-center text-slate-500 font-mono text-xs">
        No tool execution events recorded yet. Trigger the recovery loop to view live telemetry.
      </div>
    );
  }

  const getAgentBadgeColor = (agent: string) => {
    switch (agent) {
      case 'ORCHESTRATOR': return 'bg-cyan-950 text-cyan-300 border-cyan-800/60';
      case 'SOURCING_AGENT': return 'bg-blue-950 text-blue-300 border-blue-800/60';
      case 'COMPLIANCE_AGENT': return 'bg-emerald-950 text-emerald-300 border-emerald-800/60';
      case 'LOGISTICS_AGENT': return 'bg-indigo-950 text-indigo-300 border-indigo-800/60';
      case 'OPTIMIZATION_AGENT': return 'bg-purple-950 text-purple-300 border-purple-800/60';
      case 'VALIDATOR_AGENT': return 'bg-emerald-950 text-emerald-300 border-emerald-800/60';
      case 'ENVIRONMENT_MONITOR': return 'bg-amber-950 text-amber-300 border-amber-800/60';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="rounded-xl bg-[#151B23] border border-[#26313D] overflow-hidden">
      <div className="px-5 py-3.5 bg-[#11161D] border-b border-[#26313D] flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              LIVE AGENT TOOL EXECUTION TIMELINE
            </h3>
            <p className="text-[11px] text-slate-400">
              Deterministic tool execution calls, latency telemetry, and internal API responses
            </p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded bg-[#11161D] border border-[#26313D] text-cyan-300 font-mono text-[10px] font-bold">
          {toolCalls.length} TOOL CALLS
        </span>
      </div>

      <div className="p-4 space-y-2 max-h-96 overflow-y-auto font-mono text-xs">
        {toolCalls.map((tc, index) => {
          const isExpanded = expandedId === tc.id;
          return (
            <div 
              key={tc.id || index}
              className="rounded-lg border border-[#26313D] bg-[#11161D] overflow-hidden transition"
            >
              <div 
                className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-[#161d27] select-none"
                onClick={() => setExpandedId(isExpanded ? null : tc.id)}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <span className="text-[10px] text-slate-500 w-5">#{index + 1}</span>
                  
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getAgentBadgeColor(tc.agent)}`}>
                    {tc.agent}
                  </span>

                  <span className="text-cyan-400 font-bold truncate text-[11px]">
                    {tc.tool}()
                  </span>
                </div>

                <div className="flex items-center space-x-3 text-[10px] text-slate-400 shrink-0">
                  <span className="flex items-center space-x-1 text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{tc.duration_ms || 35}ms</span>
                  </span>
                  
                  <span className="px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-[9px] font-bold">
                    {tc.status}
                  </span>

                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                </div>
              </div>

              {/* Expandable Clean Summary Details */}
              {isExpanded && (
                <div className="p-3 bg-[#0B0F14] border-t border-[#26313D] text-[11px] space-y-2">
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] block font-bold mb-0.5">Tool Arguments:</span>
                    <pre className="p-2 rounded bg-[#11161D] text-slate-300 text-[10px] overflow-x-auto border border-[#26313D]">
                      {JSON.stringify(tc.args, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] block font-bold mb-0.5">Execution Result:</span>
                    <pre className="p-2 rounded bg-[#11161D] text-emerald-300 text-[10px] overflow-x-auto border border-[#26313D]">
                      {JSON.stringify(tc.result, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
