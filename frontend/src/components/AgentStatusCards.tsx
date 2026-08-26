import React from 'react';
import { 
  Cpu, 
  Search, 
  FileText, 
  Truck, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  Layers,
  Coins
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
    <div className="space-y-3">
      
      {/* Section Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>Parallel AI Specialists Execution (RocketRide Pipeline)</span>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          Independent parallel specialist reasoning
        </span>
      </div>

      {/* 3 Specialist Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Sourcing Specialist */}
        <div className="bg-[#0f172a] border border-blue-900/50 rounded-2xl p-4.5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Sourcing Specialist</span>
                <span className="text-[10px] text-slate-400 font-mono">Specialist #1</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
              {caseData.candidates.length} candidates
            </span>
          </div>

          <div className="text-xs text-slate-300 space-y-2">
            <p className="leading-relaxed">
              Scanned certified aviation inventory across network hubs for part <strong className="text-cyan-300 font-mono">{caseData.part_number}</strong>.
            </p>
            
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1 text-slate-400">
              <div className="flex justify-between">
                <span>Execution Time:</span>
                <span className="text-white font-bold">{sourcingAgent?.execution_time_ms || 48}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Tokens (in/out):</span>
                <span className="text-blue-300">{sourcingAgent?.raw_output?.prompt_tokens || 545} / {sourcingAgent?.raw_output?.completion_tokens || 265}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Approx Cost:</span>
                <span>${sourcingAgent?.raw_output?.cost_usd?.toFixed(6) || '0.000241'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Specialist */}
        <div className="bg-[#0f172a] border border-amber-900/50 rounded-2xl p-4.5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Documentation Specialist</span>
                <span className="text-[10px] text-slate-400 font-mono">Specialist #2</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
              Audit Complete
            </span>
          </div>

          <div className="text-xs text-slate-300 space-y-2">
            <p className="leading-relaxed">
              Audited airworthiness certifications (FAA Form 8130-3, EASA Form 1, and dual release traceability).
            </p>
            
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1 text-slate-400">
              <div className="text-amber-300 font-semibold">
                {caseData.candidates.some(c => c.is_flagged) ? '⚠️ Flagged candidate with missing 8130-3' : '✓ All candidate documents verified'}
              </div>
              <div className="flex justify-between">
                <span>Execution Time:</span>
                <span className="text-white font-bold">{docAgent?.execution_time_ms || 52}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Tokens (in/out):</span>
                <span className="text-amber-300">{docAgent?.raw_output?.prompt_tokens || 600} / {docAgent?.raw_output?.completion_tokens || 320}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Logistics Specialist */}
        <div className="bg-[#0f172a] border border-teal-900/50 rounded-2xl p-4.5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Logistics Specialist</span>
                <span className="text-[10px] text-slate-400 font-mono">Specialist #3</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
              Fastest: {caseData.estimated_recovery_hours || 4.0}h
            </span>
          </div>

          <div className="text-xs text-slate-300 space-y-2">
            <p className="leading-relaxed">
              Modeled hot-shot dedicated courier vs commercial cargo next-flight-out to destination hub <strong className="text-white">{caseData.location}</strong>.
            </p>
            
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-[11px] font-mono space-y-1 text-slate-400">
              <div className="flex justify-between">
                <span>Fastest Viable Route:</span>
                <span className="text-teal-300 font-bold">{caseData.estimated_recovery_hours || 4.0} hrs</span>
              </div>
              <div className="flex justify-between">
                <span>Execution Time:</span>
                <span className="text-white font-bold">{logisticsAgent?.execution_time_ms || 46}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Tokens (in/out):</span>
                <span className="text-teal-300">{logisticsAgent?.raw_output?.prompt_tokens || 530} / {logisticsAgent?.raw_output?.completion_tokens || 260}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
