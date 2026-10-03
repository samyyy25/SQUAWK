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
        return <span className="px-2 py-0.5 rounded bg-[rgba(217,166,46,0.18)] text-[#A87813] border border-[#D9A62E] font-mono text-[10px] font-bold">Human Approval</span>;
      case 'Sourcing':
        return <span className="px-2 py-0.5 rounded bg-[rgba(38,42,34,0.1)] text-[#252820] border border-[rgba(217,166,46,0.4)] font-mono text-[10px]">Sourcing Agent</span>;
      case 'Documentation':
        return <span className="px-2 py-0.5 rounded bg-[rgba(38,42,34,0.1)] text-[#252820] border border-[rgba(217,166,46,0.4)] font-mono text-[10px]">Docs Auditor</span>;
      case 'Logistics':
        return <span className="px-2 py-0.5 rounded bg-[rgba(38,42,34,0.1)] text-[#252820] border border-[rgba(217,166,46,0.4)] font-mono text-[10px]">Logistics Router</span>;
      case 'Validator':
        return <span className="px-2 py-0.5 rounded bg-[rgba(38,42,34,0.1)] text-[#252820] border border-[rgba(217,166,46,0.4)] font-mono text-[10px]">Validator Gate</span>;
      case 'Recovery':
      case 'Dispatched':
        return <span className="px-2 py-0.5 rounded bg-[#78966A]/20 text-[#4E6B42] border border-[#78966A]/40 font-mono text-[10px] font-bold">Recovery Active</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-[rgba(255,248,235,0.9)] text-[#4A483E] border border-[rgba(217,166,46,0.3)] font-mono text-[10px]">{stage}</span>;
    }
  };

  return (
    <div className="space-y-4 bg-transparent min-h-full font-mono text-[#252820]">
      
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(217,166,46,0.3)] pb-3">
        <div>
          <h2 className="text-base font-bold text-[#252820] flex items-center space-x-2 tracking-wide uppercase">
            <Layers className="w-4 h-4 text-[#D9A62E]" />
            <span>AOG SQUAWK INCIDENT QUEUE</span>
          </h2>
          <p className="text-xs text-[#4A483E] font-sans mt-0.5">
            Operational dashboard of multi-agent recovery pipelines and human approval checkpoints
          </p>
        </div>

        {/* Search and Action */}
        <div className="flex items-center space-x-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8C8472] absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search tail, defect, part, hub..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[rgba(255,250,242,0.9)] border border-[rgba(217,166,46,0.35)] rounded pl-8 pr-3 py-1.5 text-xs text-[#252820] focus:outline-none focus:border-[#D9A62E] w-56 font-sans placeholder:text-[#8C8472] shadow-sm"
            />
          </div>

          <button
            onClick={onOpenIntake}
            className="bg-gradient-to-r from-[#D9A62E] to-[#F0C75E] hover:from-[#F0C75E] hover:to-[#D9A62E] text-[#252820] font-bold px-3 py-1.5 rounded text-xs transition border border-[#F0C75E] cursor-pointer shadow-md"
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
                  ? 'bg-gradient-to-r from-[#D9A62E] to-[#F0C75E] text-[#252820] border border-[#F0C75E] shadow-sm' 
                  : 'bg-[rgba(255,250,242,0.7)] text-[#4A483E] hover:text-[#252820] hover:bg-[rgba(255,250,242,0.9)] border border-[rgba(217,166,46,0.25)]'
              }`}
            >
              <span>{tab}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                active ? 'bg-[#252820] text-white' : 'bg-[rgba(217,166,46,0.2)] text-[#A87813]'
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
              className={`bg-[rgba(255,250,242,0.9)] backdrop-blur-xl border rounded-xl p-4 transition-all duration-200 shadow-md ${
                isHero 
                  ? 'border-2 border-[#D9A62E] shadow-xl' 
                  : isHumanGate 
                  ? 'border border-[#D9A62E]/60' 
                  : 'border border-[rgba(217,166,46,0.3)]'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Left Col: Aircraft, Airport, Defect & Part */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#252820] bg-[rgba(217,166,46,0.18)] px-2 py-0.5 rounded border border-[rgba(217,166,46,0.35)]">
                      {caseItem.id}
                    </span>
                    <span className="font-mono font-bold text-xs text-[#252820] bg-[#D9A62E] px-2 py-0.5 rounded border border-[#F0C75E] flex items-center space-x-1 shadow-sm">
                      <Plane className="w-3 h-3 -rotate-45" />
                      <span>{caseItem.tail_number || 'VT-SQK'}</span>
                    </span>
                    <span className="text-xs text-[#252820] font-sans font-medium">
                      {caseItem.aircraft_type || 'Boeing 737-800'}
                    </span>
                    <span className="text-xs text-[#4A483E] font-mono">
                      • Station {caseItem.location || 'DEL Terminal 3'}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-[#C85B43]/15 text-[#C85B43] border border-[#C85B43]/30">
                      🔴 {caseItem.priority || 'AOG'}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-[#252820] font-sans">
                    {caseItem.defect_description}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#4A483E]">
                    <div>
                      <span className="text-[#8C8472]">PART REQUIRED: </span>
                      <strong className="text-[#252820] font-mono">{caseItem.part_number || 'HP-2048'}</strong>
                    </div>
                    {caseItem.ata_chapter && (
                      <div>
                        <span className="text-[#8C8472]">ATA: </span>
                        <span className="text-[#252820] font-semibold">{caseItem.ata_chapter}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Center Col: Agent Pipeline Stage & Supplier Recommendation */}
                <div className="lg:w-80 space-y-1.5 bg-[rgba(255,248,235,0.85)] p-3 rounded-lg border border-[rgba(217,166,46,0.25)]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#8C8472] uppercase font-bold">STAGE:</span>
                    {getStageBadge(caseItem.current_stage || (isApproved ? 'Recovery' : 'Human Approval'))}
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#4A483E]">RECOMMENDED:</span>
                    <span className="font-bold text-[#252820] flex items-center space-x-1 truncate max-w-[160px]">
                      <Building className="w-3 h-3 text-[#A87813] shrink-0" />
                      <span className="truncate">{recommendedCand?.vendor_name || 'SkySupply Global'}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-[rgba(217,166,46,0.2)]">
                    <span className="text-[#4A483E]">ETA: <strong className="text-[#252820]">{caseItem.estimated_recovery_hours || recommendedCand?.estimated_eta_hours || 4.5}h</strong></span>
                    <span className="text-[#4A483E]">Reliability: <strong className="text-[#252820]">{Math.round((recommendedCand?.vendor_reliability_score || 0.94) * 100)}%</strong></span>
                    <span className={caseItem.risk_level === 'LOW' ? 'text-[#78966A] font-bold' : 'text-[#C85B43] font-bold'}>{caseItem.risk_level || 'LOW'} RISK</span>
                  </div>
                </div>

                {/* Right Col: Human Approval Status & Action Button */}
                <div className="flex lg:flex-col items-center lg:items-end justify-between gap-2 shrink-0">
                  <div>
                    {isHumanGate ? (
                      <span className="flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[rgba(217,166,46,0.18)] text-[#A87813] border border-[#D9A62E]">
                        <UserCheck className="w-3 h-3" />
                        <span>HUMAN REVIEW REQ</span>
                      </span>
                    ) : isApproved ? (
                      <span className="flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#78966A]/20 text-[#4E6B42] border border-[#78966A]/40">
                        <CheckCircle2 className="w-3 h-3 text-[#4E6B42]" />
                        <span>AUTHORIZED</span>
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-[#4A483E]">{caseItem.status}</span>
                    )}
                  </div>

                  {/* Primary OPEN RECOVERY CASE CTA */}
                  <button
                    onClick={() => onSelectCase(caseItem)}
                    className="flex items-center space-x-1.5 bg-gradient-to-r from-[#D9A62E] to-[#F0C75E] hover:from-[#F0C75E] hover:to-[#D9A62E] text-[#252820] font-bold px-3 py-1.5 rounded text-xs transition border border-[#F0C75E] cursor-pointer shadow-sm"
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
          <div className="text-center py-12 bg-[rgba(255,250,242,0.85)] border border-[rgba(217,166,46,0.3)] rounded-xl space-y-2">
            <p className="text-sm font-semibold text-[#252820] font-sans">No cases match the selected filter.</p>
            <button 
              onClick={() => setActiveFilter('ALL')}
              className="text-xs text-[#A87813] hover:underline font-semibold cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
