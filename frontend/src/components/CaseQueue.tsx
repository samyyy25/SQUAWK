import React, { useState } from 'react';
import { 
  Layers, 
  Search, 
  Plane, 
  CheckCircle2, 
  UserCheck, 
  ArrowRight,
  Building
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
        return <span className="px-2 py-0.5 rounded bg-[#000000] text-[#BC0202] border border-[#BC0202] font-mono text-[10px] font-bold">Human Approval</span>;
      case 'Sourcing':
        return <span className="px-2 py-0.5 rounded bg-[#0D0D0D] text-white border border-[#830000] font-mono text-[10px]">Sourcing Agent</span>;
      case 'Documentation':
        return <span className="px-2 py-0.5 rounded bg-[#0D0D0D] text-white border border-[#830000] font-mono text-[10px]">Docs Auditor</span>;
      case 'Logistics':
        return <span className="px-2 py-0.5 rounded bg-[#0D0D0D] text-white border border-[#830000] font-mono text-[10px]">Logistics Router</span>;
      case 'Validator':
        return <span className="px-2 py-0.5 rounded bg-[#0D0D0D] text-white border border-[#830000] font-mono text-[10px]">Validator Gate</span>;
      case 'Recovery':
      case 'Dispatched':
        return <span className="px-2 py-0.5 rounded bg-[#830000] text-white border border-[#BC0202] font-mono text-[10px]">Recovery Active</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-[#080808] text-neutral-300 border border-[#1E1E1E] font-mono text-[10px]">{stage}</span>;
    }
  };

  return (
    <div className="p-4 space-y-4 bg-[#000000] min-h-full font-mono text-neutral-200">
      
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E1E1E] pb-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2 tracking-wide uppercase">
            <Layers className="w-4 h-4 text-[#BC0202]" />
            <span>AOG SQUAWK INCIDENT QUEUE</span>
          </h2>
          <p className="text-xs text-neutral-400 font-sans mt-0.5">
            Operational dashboard of multi-agent recovery pipelines and human approval checkpoints
          </p>
        </div>

        {/* Search and Action */}
        <div className="flex items-center space-x-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search tail, defect, part, hub..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#080808] border border-[#1E1E1E] rounded pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#830000] w-56 font-sans placeholder:text-neutral-600"
            />
          </div>

          <button
            onClick={onOpenIntake}
            className="bg-[#830000] hover:bg-[#BC0202] text-white font-bold px-3 py-1.5 rounded text-xs transition border border-[#BC0202] cursor-pointer"
          >
            NEW INTAKE
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
              className={`px-3 py-1.5 rounded text-xs font-semibold transition flex items-center space-x-1.5 shrink-0 cursor-pointer ${
                active 
                  ? 'bg-[#830000] text-white border border-[#BC0202]' 
                  : 'text-neutral-400 hover:text-white hover:bg-[#0D0D0D] border border-transparent'
              }`}
            >
              <span>{tab}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                active ? 'bg-[#000000] text-white' : 'bg-[#080808] text-neutral-500'
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
          const isHero = caseItem.tail_number === 'VT-SQK' || caseItem.id === 'CASE-SQK-2048';
          const recommendedCand = caseItem.candidates?.find(c => c.is_recommended) || caseItem.candidates?.[0];
          const isHumanGate = caseItem.status === 'Awaiting Approval' || caseItem.current_stage === 'Human Approval' || isHero;
          const isApproved = caseItem.status === 'Approved';

          return (
            <div
              key={caseItem.id}
              className={`bg-[#000000] border rounded-xl p-4 transition-all duration-200 ${
                isHero 
                  ? 'border-2 border-[#830000] shadow-lg' 
                  : isHumanGate 
                  ? 'border border-[#830000]/60' 
                  : 'border border-[#1E1E1E]'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Left Col: Aircraft, Airport, Defect & Part */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs text-white bg-[#0D0D0D] px-2 py-0.5 rounded border border-[#1E1E1E]">
                      {caseItem.id}
                    </span>
                    <span className="font-mono font-bold text-xs text-white bg-[#830000] px-2 py-0.5 rounded border border-[#BC0202] flex items-center space-x-1">
                      <Plane className="w-3 h-3 -rotate-45" />
                      <span>{caseItem.tail_number || 'VT-SQK'}</span>
                    </span>
                    <span className="text-xs text-neutral-300 font-sans">
                      {caseItem.aircraft_type || 'Boeing 737-800'}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">
                      • Station {caseItem.location || 'DEL Terminal 3'}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-[#000000] text-[#FF0000] border border-[#FF0000]">
                      🔴 {caseItem.priority || 'AOG'}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-white font-sans">
                    {caseItem.defect_description}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                    <div>
                      <span className="text-neutral-500">PART REQUIRED: </span>
                      <strong className="text-white font-mono">{caseItem.part_number || 'HP-2048'}</strong>
                    </div>
                    {caseItem.ata_chapter && (
                      <div>
                        <span className="text-neutral-500">ATA: </span>
                        <span className="text-neutral-300">{caseItem.ata_chapter}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Center Col: Agent Pipeline Stage & Supplier Recommendation */}
                <div className="lg:w-80 space-y-1.5 bg-[#080808] p-3 rounded border border-[#1E1E1E]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-neutral-500 uppercase">STAGE:</span>
                    {getStageBadge(caseItem.current_stage || (isApproved ? 'Recovery' : 'Human Approval'))}
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-400">RECOMMENDED:</span>
                    <span className="font-bold text-white flex items-center space-x-1 truncate max-w-[160px]">
                      <Building className="w-3 h-3 text-[#BC0202] shrink-0" />
                      <span className="truncate">{recommendedCand?.vendor_name || 'SkySupply Global'}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-[#1E1E1E]">
                    <span className="text-neutral-500">ETA: <strong className="text-white">{caseItem.estimated_recovery_hours || recommendedCand?.estimated_eta_hours || 4.5}h</strong></span>
                    <span className="text-neutral-500">Reliability: <strong className="text-white">{Math.round((recommendedCand?.vendor_reliability_score || 0.94) * 100)}%</strong></span>
                    <span className={caseItem.risk_level === 'LOW' ? 'text-neutral-300' : 'text-[#FF0000]'}>{caseItem.risk_level || 'LOW'} RISK</span>
                  </div>
                </div>

                {/* Right Col: Human Approval Status & Action Button */}
                <div className="flex lg:flex-col items-center lg:items-end justify-between gap-2 shrink-0">
                  <div>
                    {isHumanGate ? (
                      <span className="flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#000000] text-[#BC0202] border border-[#BC0202]">
                        <UserCheck className="w-3 h-3" />
                        <span>HUMAN REVIEW REQ</span>
                      </span>
                    ) : isApproved ? (
                      <span className="flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#0D0D0D] text-white border border-[#830000]">
                        <CheckCircle2 className="w-3 h-3 text-[#BC0202]" />
                        <span>AUTHORIZED</span>
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-neutral-400">{caseItem.status}</span>
                    )}
                  </div>

                  {/* Primary OPEN RECOVERY CASE CTA */}
                  <button
                    onClick={() => onSelectCase(caseItem)}
                    className="flex items-center space-x-1.5 bg-[#830000] hover:bg-[#BC0202] text-white font-bold px-3 py-1.5 rounded text-xs transition border border-[#BC0202] cursor-pointer"
                  >
                    <span>OPEN CASE</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>
          );
        })}

        {filteredCases.length === 0 && (
          <div className="text-center py-12 bg-[#080808] border border-[#1E1E1E] rounded-xl space-y-2">
            <p className="text-sm font-semibold text-neutral-300 font-sans">No cases match the selected filter.</p>
            <button 
              onClick={() => setActiveFilter('ALL')}
              className="text-xs text-[#BC0202] hover:underline font-semibold cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
