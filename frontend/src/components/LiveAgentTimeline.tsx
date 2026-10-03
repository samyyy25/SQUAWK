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
      <div className="p-6 rounded-xl bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(217,166,46,0.25)] text-center text-[#8C8472] font-mono text-xs shadow-md">
        No tool execution events recorded yet. Trigger the recovery loop to view live telemetry.
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(217,166,46,0.3)] overflow-hidden font-mono text-[#252820] shadow-md">
      <div className="px-4 py-3 bg-[rgba(255,248,235,0.9)] border-b border-[rgba(217,166,46,0.25)] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-[rgba(217,166,46,0.18)] text-[#A87813] border border-[#D9A62E] shadow-sm">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#252820] tracking-wide uppercase font-sans">
              LIVE AGENT TOOL EXECUTION TIMELINE
            </h3>
            <p className="text-[10px] text-[#4A483E] font-sans">
              Deterministic tool execution calls, latency telemetry, and API responses
            </p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded bg-[rgba(217,166,46,0.15)] border border-[rgba(217,166,46,0.35)] text-[#A87813] text-[10px] font-bold">
          {toolCalls.length} CALLS
        </span>
      </div>

      <div className="p-3 space-y-1.5 max-h-96 overflow-y-auto text-xs">
        {toolCalls.map((tc, index) => {
          const isExpanded = expandedId === tc.id;
          return (
            <div 
              key={tc.id || index}
              className="rounded-lg border border-[rgba(217,166,46,0.25)] bg-[rgba(255,255,255,0.85)] overflow-hidden transition shadow-sm hover:border-[#D9A62E]"
            >
              <div 
                className="p-2 flex items-center justify-between cursor-pointer hover:bg-[rgba(255,248,235,0.9)] select-none"
                onClick={() => setExpandedId(isExpanded ? null : tc.id)}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="text-[10px] text-[#8C8472] w-5">#{index + 1}</span>
                  
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[rgba(217,166,46,0.15)] text-[#A87813] border border-[rgba(217,166,46,0.35)]">
                    {tc.agent}
                  </span>

                  <span className="text-[#252820] font-bold truncate text-[11px]">
                    {tc.tool}()
                  </span>
                </div>

                <div className="flex items-center space-x-2.5 text-[10px] text-[#4A483E] shrink-0">
                  <span className="flex items-center space-x-1 text-[#8C8472]">
                    <Clock className="w-3 h-3 text-[#A87813]" />
                    <span>{tc.duration_ms || 35}ms</span>
                  </span>
                  
                  <span className="px-1.5 py-0.5 rounded bg-[#78966A]/20 text-[#4E6B42] border border-[#78966A]/40 text-[9px] font-bold">
                    {tc.status}
                  </span>

                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-[#8C8472]" /> : <ChevronRight className="w-3.5 h-3.5 text-[#8C8472]" />}
                </div>
              </div>

              {/* Expandable Clean Summary Details */}
              {isExpanded && (
                <div className="p-2.5 bg-[rgba(255,250,242,0.95)] border-t border-[rgba(217,166,46,0.25)] text-[10px] space-y-1.5">
                  <div>
                    <span className="text-[#8C8472] uppercase text-[9px] block font-bold mb-0.5">TOOL ARGUMENTS:</span>
                    <pre className="p-2 rounded bg-[rgba(255,248,235,0.9)] text-[#252820] text-[10px] overflow-x-auto border border-[rgba(217,166,46,0.25)] font-mono">
                      {JSON.stringify(tc.args, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <span className="text-[#8C8472] uppercase text-[9px] block font-bold mb-0.5">EXECUTION RESULT:</span>
                    <pre className="p-2 rounded bg-[rgba(255,248,235,0.9)] text-[#252820] text-[10px] overflow-x-auto border border-[rgba(217,166,46,0.25)] font-mono">
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
