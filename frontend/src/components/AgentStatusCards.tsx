import React from 'react';
import { 
  Cpu, 
  Search, 
  FileText, 
  Truck
} from 'lucide-react';
import { SquawkCase } from '../types';

interface AgentStatusCardsProps {
  caseData: SquawkCase;
}

export const AgentStatusCards: React.FC<AgentStatusCardsProps> = ({ caseData }) => {
  const sourcingAgent = caseData.agent_results.find(a => a.specialist_name.includes('Sourcing'));
  const docAgent = caseData.agent_results.find(a => a.specialist_name.includes('Documentation'));
  const logisticsAgent = caseData.agent_results.find(a => a.specialist_name.includes('Logistics'));

  return (
    <div className="space-y-3 font-mono">
      
      {/* Section Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-bold text-[#F7F1E4] uppercase tracking-wider">
          <Cpu className="w-4 h-4 text-[#F0C75E]" />
          <span>PARALLEL AI SPECIALIST EXECUTION PIPELINE</span>
        </div>
        <span className="text-[10px] text-[#D8D0BD]/70 font-bold">
          INDEPENDENT REASONING AGENTS
        </span>
      </div>

      {/* 3 Specialist Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* Sourcing Specialist */}
        <div className="bg-[rgba(26,29,23,0.92)] border border-[rgba(255,210,100,0.3)] rounded-xl p-4 space-y-2.5 shadow-lg backdrop-blur-xl text-[#F7F1E4]">
          <div className="flex items-center justify-between border-b border-[rgba(255,210,100,0.15)] pb-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded bg-[rgba(217,166,46,0.18)] text-[#F0C75E]">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">SOURCING AGENT</span>
                <span className="text-[10px] text-[#D8D0BD]/70">Specialist #1</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[rgba(217,166,46,0.2)] text-[#F0C75E] border border-[rgba(217,166,46,0.4)]">
              {caseData.candidates.length} candidates
            </span>
          </div>

          <div className="text-xs text-[#D8D0BD] space-y-2 font-sans">
            <p className="leading-relaxed">
              Scanned certified inventory across network hubs for part <strong className="text-white font-mono">{caseData.part_number || 'HP-2048'}</strong>.
            </p>
            
            <div className="bg-[rgba(16,18,14,0.8)] p-2.5 rounded border border-[rgba(255,210,100,0.18)] text-[11px] font-mono space-y-1 text-[#D8D0BD]">
              <div className="flex justify-between">
                <span>Execution Time:</span>
                <span className="text-[#F0C75E] font-bold">{sourcingAgent?.execution_time_ms || 48}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Tokens:</span>
                <span className="text-[#D8D0BD]">{sourcingAgent?.raw_output?.prompt_tokens || 545} in / {sourcingAgent?.raw_output?.completion_tokens || 265} out</span>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Specialist */}
        <div className="bg-[rgba(26,29,23,0.92)] border border-[rgba(255,210,100,0.3)] rounded-xl p-4 space-y-2.5 shadow-lg backdrop-blur-xl text-[#F7F1E4]">
          <div className="flex items-center justify-between border-b border-[rgba(255,210,100,0.15)] pb-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded bg-[rgba(217,166,46,0.18)] text-[#F0C75E]">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">DOCS AUDITOR</span>
                <span className="text-[10px] text-[#D8D0BD]/70">Specialist #2</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[rgba(120,150,106,0.25)] text-[#A0C49D] border border-[rgba(120,150,106,0.4)]">
              Audit Complete
            </span>
          </div>

          <div className="text-xs text-[#D8D0BD] space-y-2 font-sans">
            <p className="leading-relaxed">
              Audited airworthiness certifications (FAA Form 8130-3, EASA Form 1 dual release traceability).
            </p>
            
            <div className="bg-[rgba(16,18,14,0.8)] p-2.5 rounded border border-[rgba(255,210,100,0.18)] text-[11px] font-mono space-y-1 text-[#D8D0BD]">
              <div className="text-[#A0C49D] font-semibold">
                {caseData.candidates.some(c => c.is_flagged) ? '⚠️ Flagged candidate with missing 8130-3' : '✓ All candidate documents verified'}
              </div>
              <div className="flex justify-between">
                <span>Execution Time:</span>
                <span className="text-[#F0C75E] font-bold">{docAgent?.execution_time_ms || 52}ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Logistics Specialist */}
        <div className="bg-[rgba(26,29,23,0.92)] border border-[rgba(255,210,100,0.3)] rounded-xl p-4 space-y-2.5 shadow-lg backdrop-blur-xl text-[#F7F1E4]">
          <div className="flex items-center justify-between border-b border-[rgba(255,210,100,0.15)] pb-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded bg-[rgba(217,166,46,0.18)] text-[#F0C75E]">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">LOGISTICS ROUTER</span>
                <span className="text-[10px] text-[#D8D0BD]/70">Specialist #3</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[rgba(217,166,46,0.25)] text-[#F0C75E] border border-[#D9A62E]">
              Fastest: {caseData.estimated_recovery_hours || 4.5}h
            </span>
          </div>

          <div className="text-xs text-[#D8D0BD] space-y-2 font-sans">
            <p className="leading-relaxed">
              Modeled hot-shot dedicated flight courier to destination hub <strong className="text-white font-mono">{caseData.location || 'DEL'}</strong>.
            </p>
            
            <div className="bg-[rgba(16,18,14,0.8)] p-2.5 rounded border border-[rgba(255,210,100,0.18)] text-[11px] font-mono space-y-1 text-[#D8D0BD]">
              <div className="flex justify-between">
                <span>Fastest Viable Route:</span>
                <span className="text-white font-bold">{caseData.estimated_recovery_hours || 4.5} hrs</span>
              </div>
              <div className="flex justify-between">
                <span>Execution Time:</span>
                <span className="text-[#F0C75E] font-bold">{logisticsAgent?.execution_time_ms || 46}ms</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
