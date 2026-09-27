import React, { useState } from 'react';
import { 
  Terminal, 
  Clock, 
  ChevronDown, 
  ChevronRight
} from 'lucide-react';
import { ToolCallRecord } from '../types';

interface LiveAgentTimelineProps {
  toolCalls: ToolCallRecord[];
}

export const LiveAgentTimeline: React.FC<LiveAgentTimelineProps> = ({ toolCalls }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!toolCalls || toolCalls.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-[#000000] border border-[#1E1E1E] text-center text-neutral-500 font-mono text-xs">
        No tool execution events recorded yet. Trigger the recovery loop to view live telemetry.
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[#000000] border border-[#830000] overflow-hidden font-mono">
      <div className="px-4 py-3 bg-[#080808] border-b border-[#1E1E1E] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded bg-[#0D0D0D] text-[#BC0202]">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">
              LIVE AGENT TOOL EXECUTION TIMELINE
            </h3>
            <p className="text-[10px] text-neutral-400 font-sans">
              Deterministic tool execution calls, latency telemetry, and API responses
            </p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded bg-[#0D0D0D] border border-[#1E1E1E] text-white text-[10px] font-bold">
          {toolCalls.length} CALLS
        </span>
      </div>

      <div className="p-3 space-y-1.5 max-h-96 overflow-y-auto text-xs">
        {toolCalls.map((tc, index) => {
          const isExpanded = expandedId === tc.id;
          return (
            <div 
              key={tc.id || index}
              className="rounded border border-[#1E1E1E] bg-[#080808] overflow-hidden transition"
            >
              <div 
                className="p-2 flex items-center justify-between cursor-pointer hover:bg-[#0D0D0D] select-none"
                onClick={() => setExpandedId(isExpanded ? null : tc.id)}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="text-[10px] text-neutral-500 w-5">#{index + 1}</span>
                  
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#0D0D0D] text-white border border-[#1E1E1E]">
                    {tc.agent}
                  </span>

                  <span className="text-white font-bold truncate text-[11px]">
                    {tc.tool}()
                  </span>
                </div>

                <div className="flex items-center space-x-2.5 text-[10px] text-neutral-400 shrink-0">
                  <span className="flex items-center space-x-1 text-neutral-500">
                    <Clock className="w-3 h-3" />
                    <span>{tc.duration_ms || 35}ms</span>
                  </span>
                  
                  <span className="px-1.5 py-0.2 rounded bg-[#0D0D0D] text-white border border-[#830000] text-[9px] font-bold">
                    {tc.status}
                  </span>

                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-neutral-400" /> : <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />}
                </div>
              </div>

              {/* Expandable Clean Summary Details */}
              {isExpanded && (
                <div className="p-2.5 bg-[#000000] border-t border-[#1E1E1E] text-[10px] space-y-1.5">
                  <div>
                    <span className="text-neutral-500 uppercase text-[9px] block font-bold mb-0.5">TOOL ARGUMENTS:</span>
                    <pre className="p-2 rounded bg-[#080808] text-neutral-300 text-[10px] overflow-x-auto border border-[#1E1E1E]">
                      {JSON.stringify(tc.args, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <span className="text-neutral-500 uppercase text-[9px] block font-bold mb-0.5">EXECUTION RESULT:</span>
                    <pre className="p-2 rounded bg-[#080808] text-white text-[10px] overflow-x-auto border border-[#1E1E1E]">
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
