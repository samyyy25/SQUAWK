import React, { useState } from 'react';
import { 
  Layers, 
  Search, 
  Filter, 
  Plane, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  ArrowRight,
  Sparkles,
  Building,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { SquawkCase } from '../types';

interface CaseQueueProps {
  cases: SquawkCase[];
  onSelectCase: (caseItem: SquawkCase) => void;
  onOpenIntake: () => void;
}

type FilterStatus = 'ALL' | 'CRITICAL' | 'PROCESSING' | 'AWAITING HUMAN' | 'RESOLVED';

export const CaseQueue: React.FC<CaseQueueProps> = ({
  cases,
  onSelectCase,
  onOpenIntake
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCases = cases.filter(c => {
    // Filter by tab
    if (activeFilter === 'CRITICAL' && c.priority !== 'AOG' && c.risk_level !== 'HIGH') return false;
    if (activeFilter === 'PROCESSING' && c.status !== 'Processing' && c.current_stage !== 'Sourcing' && c.current_stage !== 'Logistics') return false;
    if (activeFilter === 'AWAITING HUMAN' && c.status !== 'Awaiting Approval' && c.status !== 'Needs Review' && c.current_stage !== 'Human Approval') return false;
    if (activeFilter === 'RESOLVED' && c.status !== 'Approved' && c.status !== 'Closed') return false;

    // Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const tail = (c.tail_number || '').toLowerCase();
      const defect = (c.defect_description || '').toLowerCase();
      const loc = (c.location || '').toLowerCase();
      const part = (c.part_number || '').toLowerCase();
      const id = (c.id || '').toLowerCase();
      return tail.includes(q) || defect.includes(q) || loc.includes(q) || part.includes(q) || id.includes(q);
    }

    return true;
  });

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'Human Approval':
        return <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/80 font-mono text-[10px] font-bold">Human Approval</span>;
      case 'Sourcing':
        return <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-mono text-[10px]">Sourcing Specialist</span>;
      case 'Documentation':
        return <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono text-[10px]">Docs Specialist</span>;
      case 'Logistics':
        return <span className="px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 font-mono text-[10px]">Logistics Specialist</span>;
      case 'Validator':
        return <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono text-[10px]">Validator Gate</span>;
      case 'Recovery':
      case 'Dispatched':
        return <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[10px]">Recovery Active</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[10px]">{stage}</span>;
    }
  };

  return (
    <div className="p-6 space-y-5 bg-[#0b0c0e] min-h-full">
      
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2025] pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>AOG Case Management Queue</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time queue of multi-agent recovery pipelines, supplier candidates, and human approval checkpoints
          </p>
        </div>

        {/* Search and Action */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search tail, defect, part, hub..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#14161a] border border-[#242730] rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-56 font-sans placeholder:text-slate-500"
            />
          </div>

          <button
            onClick={onOpenIntake}
            className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-3 py-1.5 rounded-xl text-xs transition shadow-md shadow-cyan-950/40"
          >
            + Ingest Defect
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
        {(['ALL', 'CRITICAL', 'PROCESSING', 'AWAITING HUMAN', 'RESOLVED'] as FilterStatus[]).map((tab) => {
          const active = activeFilter === tab;
          const count = cases.filter(c => {
            if (tab === 'ALL') return true;
            if (tab === 'CRITICAL') return c.priority === 'AOG' || c.risk_level === 'HIGH';
            if (tab === 'PROCESSING') return c.status === 'Processing' || c.current_stage === 'Sourcing' || c.current_stage === 'Logistics';
            if (tab === 'AWAITING HUMAN') return c.status === 'Awaiting Approval' || c.status === 'Needs Review' || c.current_stage === 'Human Approval';
            if (tab === 'RESOLVED') return c.status === 'Approved' || c.status === 'Closed';
            return true;
          }).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shrink-0 ${
                active 
                  ? 'bg-slate-800 text-cyan-400 border border-cyan-500/40 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#14161a] border border-transparent'
              }`}
            >
              <span>{tab}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                active ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'bg-slate-900 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Queue Case Table / Cards */}
      <div className="space-y-3">
        {filteredCases.map((caseItem) => {
          const isHero = caseItem.tail_number === 'N42Q';
          const recommendedCand = caseItem.candidates?.find(c => c.is_recommended) || caseItem.candidates?.[0];
          const isHumanGate = caseItem.status === 'Awaiting Approval' || caseItem.current_stage === 'Human Approval' || isHero;
          const isApproved = caseItem.status === 'Approved';

          return (
            <div
              key={caseItem.id}
              className={`bg-[#14161a] border rounded-2xl p-4 transition-all duration-200 hover:border-slate-700 ${
                isHero 
                  ? 'border-cyan-500/50 shadow-lg shadow-cyan-950/20 ring-1 ring-cyan-500/20' 
                  : isHumanGate 
                  ? 'border-amber-800/50' 
                  : 'border-[#20232b]'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Left Col: Aircraft, Airport, Defect & Part */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                      {caseItem.id}
                    </span>
                    <span className="font-mono font-bold text-xs text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/80 flex items-center space-x-1">
                      <Plane className="w-3 h-3 -rotate-45" />
                      <span>{caseItem.tail_number || 'N42Q'}</span>
                    </span>
                    <span className="text-xs text-slate-300 font-medium">
                      {caseItem.aircraft_type || 'Boeing 737-800'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      • Station {caseItem.location || 'ORD'}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded border ${
                      caseItem.priority === 'AOG' ? 'bg-red-950 text-red-400 border-red-800' : 'bg-amber-950 text-amber-400 border-amber-800'
                    }`}>
                      {caseItem.priority}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-100 line-clamp-1">
                    {caseItem.defect_description}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <div>
                      <span className="text-slate-500">Part Required: </span>
                      <strong className="text-cyan-300 font-mono">{caseItem.part_number || 'HYD-PUMP-2901'}</strong>
                    </div>
                    {caseItem.ata_chapter && (
                      <div>
                        <span className="text-slate-500">ATA: </span>
                        <span className="text-slate-300">{caseItem.ata_chapter}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Center Col: Agent Pipeline Stage & Supplier Recommendation */}
                <div className="lg:w-80 space-y-2 bg-[#0e1013] p-3 rounded-xl border border-[#1e2025]">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Workflow Stage:</span>
                    {getStageBadge(caseItem.current_stage || (isApproved ? 'Recovery' : 'Human Approval'))}
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Recommended:</span>
                    <span className="font-bold text-white flex items-center space-x-1 truncate max-w-[160px]">
                      <Building className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="truncate">{recommendedCand?.vendor_name || 'AeroParts Inc.'}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-mono pt-1 border-t border-slate-800">
                    <span className="text-slate-500">ETA: <strong className="text-cyan-300">{caseItem.estimated_recovery_hours || recommendedCand?.estimated_eta_hours || 4.0}h</strong></span>
                    <span className="text-slate-500">Reliability: <strong className="text-emerald-400">{Math.round((recommendedCand?.vendor_reliability_score || 0.94) * 100)}%</strong></span>
                    <span className={caseItem.risk_level === 'LOW' ? 'text-emerald-400' : 'text-red-400'}>{caseItem.risk_level || 'LOW'} RISK</span>
                  </div>
                </div>

                {/* Right Col: Human Approval Status & Action Button */}
                <div className="flex lg:flex-col items-center lg:items-end justify-between gap-2 shrink-0">
                  <div>
                    {isHumanGate ? (
                      <span className="flex items-center space-x-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-950/80 text-amber-300 border border-amber-700/80">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>AWAITING HUMAN</span>
                      </span>
                    ) : isApproved ? (
                      <span className="flex items-center space-x-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>AUTHORIZED</span>
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-slate-400">{caseItem.status}</span>
                    )}
                  </div>

                  {/* Primary OPEN RECOVERY CASE CTA */}
                  <button
                    onClick={() => onSelectCase(caseItem)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold px-3.5 py-2 rounded-xl text-xs transition shadow-lg shadow-cyan-950/50 active:scale-95 whitespace-nowrap"
                  >
                    <span>OPEN RECOVERY CASE</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>

              </div>
            </div>
          );
        })}

        {filteredCases.length === 0 && (
          <div className="text-center py-12 bg-[#14161a] border border-[#20232b] rounded-2xl space-y-2">
            <p className="text-sm font-semibold text-slate-300">No cases match the selected filter.</p>
            <button 
              onClick={() => setActiveFilter('ALL')}
              className="text-xs text-cyan-400 hover:underline font-semibold"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
