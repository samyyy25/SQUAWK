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
        <div className="flex items-center space-x-2 text-xs font-bold text-white uppercase tracking-wider">
          <Cpu className="w-4 h-4 text-[#BC0202]" />
          <span>PARALLEL AI SPECIALIST EXECUTION PIPELINE</span>
        </div>
        <span className="text-[10px] text-neutral-500">
          INDEPENDENT REASONING AGENTS
        </span>
      </div>

      {/* 3 Specialist Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* Sourcing Specialist */}
        <div className="bg-[#000000] border border-[#830000] rounded-xl p-4 space-y-2.5 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded bg-[#0D0D0D] text-[#BC0202]">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">SOURCING AGENT</span>
                <span className="text-[10px] text-neutral-500">Specialist #1</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0D0D0D] text-white border border-[#1E1E1E]">
              {caseData.candidates.length} candidates
            </span>
          </div>

          <div className="text-xs text-neutral-300 space-y-2 font-sans">
            <p className="leading-relaxed">
              Scanned certified inventory across network hubs for part <strong className="text-white font-mono">{caseData.part_number || 'HP-2048'}</strong>.
            </p>
            
            <div className="bg-[#080808] p-2.5 rounded border border-[#1E1E1E] text-[11px] font-mono space-y-1 text-neutral-400">
              <div className="flex justify-between">
                <span>Execution Time:</span>
                <span className="text-white font-bold">{sourcingAgent?.execution_time_ms || 48}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Tokens:</span>
                <span className="text-neutral-300">{sourcingAgent?.raw_output?.prompt_tokens || 545} in / {sourcingAgent?.raw_output?.completion_tokens || 265} out</span>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Specialist */}
        <div className="bg-[#000000] border border-[#830000] rounded-xl p-4 space-y-2.5 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded bg-[#0D0D0D] text-[#BC0202]">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">DOCS AUDITOR</span>
                <span className="text-[10px] text-neutral-500">Specialist #2</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#0D0D0D] text-white border border-[#1E1E1E]">
              Audit Complete
            </span>
          </div>

          <div className="text-xs text-neutral-300 space-y-2 font-sans">
            <p className="leading-relaxed">
              Audited airworthiness certifications (FAA Form 8130-3, EASA Form 1 dual release traceability).
            </p>
            
            <div className="bg-[#080808] p-2.5 rounded border border-[#1E1E1E] text-[11px] font-mono space-y-1 text-neutral-400">
              <div className="text-white font-semibold">
                {caseData.candidates.some(c => c.is_flagged) ? '⚠️ Flagged candidate with missing 8130-3' : '✓ All candidate documents verified'}
              </div>
              <div className="flex justify-between">
                <span>Execution Time:</span>
                <span className="text-white font-bold">{docAgent?.execution_time_ms || 52}ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Logistics Specialist */}
        <div className="bg-[#000000] border border-[#830000] rounded-xl p-4 space-y-2.5 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded bg-[#0D0D0D] text-[#BC0202]">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">LOGISTICS ROUTER</span>
                <span className="text-[10px] text-neutral-500">Specialist #3</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#830000] text-white border border-[#BC0202]">
              Fastest: {caseData.estimated_recovery_hours || 4.5}h
            </span>
          </div>

          <div className="text-xs text-neutral-300 space-y-2 font-sans">
            <p className="leading-relaxed">
              Modeled hot-shot dedicated flight courier to destination hub <strong className="text-white font-mono">{caseData.location || 'DEL'}</strong>.
            </p>
            
            <div className="bg-[#080808] p-2.5 rounded border border-[#1E1E1E] text-[11px] font-mono space-y-1 text-neutral-400">
              <div className="flex justify-between">
                <span>Fastest Viable Route:</span>
                <span className="text-white font-bold">{caseData.estimated_recovery_hours || 4.5} hrs</span>
              </div>
              <div className="flex justify-between">
                <span>Execution Time:</span>
                <span className="text-white font-bold">{logisticsAgent?.execution_time_ms || 46}ms</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
