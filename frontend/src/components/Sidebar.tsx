import React from 'react';
import { 
  Plane, 
  LayoutDashboard, 
  Layers, 
  Plus, 
  Building2, 
  Cpu,
  Database,
  Radio,
  ShieldCheck,
  RotateCcw,
  BookOpen
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openIntakeModal: () => void;
  totalAogCount: number;
  activeFilterRegion?: string;
  setActiveFilterRegion?: (region: string) => void;
  onOpenJudgesModal?: () => void;
  onResetDemo?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  openIntakeModal,
  totalAogCount,
  onOpenJudgesModal,
  onResetDemo
}) => {
  return (
    <aside className="w-[240px] bg-[rgba(26,29,23,0.92)] backdrop-blur-xl border-r border-[rgba(255,210,100,0.22)] flex flex-col justify-between shrink-0 select-none text-[#D8D0BD] h-screen sticky top-0 font-sans z-30">
      
      {/* Top Header & Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        
        {/* Brand Header */}
        <div className="flex items-center space-x-3 px-1 pb-3 border-b border-[rgba(255,210,100,0.2)]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D9A62E] to-[#A87813] flex items-center justify-center text-[#252820] shadow-md border border-[#F0C75E]">
            <Plane className="w-4 h-4 -rotate-45 text-[#252820]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-sm font-black text-white tracking-widest font-mono">SQUAWK</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D9A62E] animate-pulse" title="System Operational"></span>
            </div>
            <div className="text-[10px] text-[#D8D0BD] font-mono tracking-tight mt-0.5">AOG OPS COMMAND</div>
          </div>
        </div>

        {/* OPERATIONS SECTION */}
        <div className="space-y-1">
          <div className="px-2 pb-1 text-[10px] font-bold text-[#A8A28E] uppercase tracking-widest font-mono">
            OPERATIONS
          </div>

          {/* Overview */}
          <button
            onClick={() => setCurrentTab('overview')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded text-xs font-semibold transition cursor-pointer relative ${
              currentTab === 'overview'
                ? 'bg-[rgba(217,166,46,0.22)] text-[#F0C75E] border-l-4 border-[#D9A62E] font-bold shadow-sm'
                : 'text-[#D8D0BD] hover:text-white hover:bg-[rgba(255,244,214,0.08)]'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${currentTab === 'overview' ? 'text-[#F0C75E]' : 'text-[#D8D0BD]'}`} />
            <span className="font-mono tracking-wide">OVERVIEW</span>
          </button>

          {/* AOG Squawks */}
          <button
            onClick={() => setCurrentTab('cases')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition cursor-pointer relative ${
              currentTab === 'cases'
                ? 'bg-[rgba(217,166,46,0.22)] text-[#F0C75E] border-l-4 border-[#D9A62E] font-bold shadow-sm'
                : 'text-[#D8D0BD] hover:text-white hover:bg-[rgba(255,244,214,0.08)]'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Layers className={`w-4 h-4 ${currentTab === 'cases' ? 'text-[#F0C75E]' : 'text-[#D8D0BD]'}`} />
              <span className="font-mono tracking-wide">AOG SQUAWKS</span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-[#C85B43] text-white text-[10px] font-mono font-bold leading-none shadow-sm">
              {totalAogCount || 3}
            </span>
          </button>

          {/* New AOG Intake */}
          <button
            onClick={openIntakeModal}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded text-xs font-medium text-[#F0C75E] hover:text-white hover:bg-[rgba(217,166,46,0.25)] border border-[rgba(217,166,46,0.45)] transition cursor-pointer mt-1"
          >
            <Plus className="w-4 h-4 text-[#F0C75E]" />
            <span className="font-mono tracking-wide">NEW INTAKE</span>
          </button>
        </div>

        {/* DECISION SUPPORT SECTION */}
        <div className="space-y-1">
          <div className="px-2 pb-1 text-[10px] font-bold text-[#A8A28E] uppercase tracking-widest font-mono">
            DECISION SUPPORT
          </div>

          <button
            onClick={() => setCurrentTab('activity')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded text-xs font-medium transition cursor-pointer relative ${
              currentTab === 'activity'
                ? 'bg-[rgba(217,166,46,0.22)] text-[#F0C75E] border-l-4 border-[#D9A62E] font-bold shadow-sm'
                : 'text-[#D8D0BD] hover:text-white hover:bg-[rgba(255,244,214,0.08)]'
            }`}
          >
            <Cpu className={`w-4 h-4 ${currentTab === 'activity' ? 'text-[#F0C75E]' : 'text-[#D8D0BD]'}`} />
            <span className="font-mono tracking-wide">AI INTELLIGENCE</span>
          </button>

          <button
            onClick={() => setCurrentTab('batch')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded text-xs font-medium transition cursor-pointer relative ${
              currentTab === 'batch'
                ? 'bg-[rgba(217,166,46,0.22)] text-[#F0C75E] border-l-4 border-[#D9A62E] font-bold shadow-sm'
                : 'text-[#D8D0BD] hover:text-white hover:bg-[rgba(255,244,214,0.08)]'
            }`}
          >
            <Radio className={`w-4 h-4 ${currentTab === 'batch' ? 'text-[#F0C75E]' : 'text-[#D8D0BD]'}`} />
            <span className="font-mono tracking-wide">RECOVERY PLANS</span>
          </button>

          <button
            onClick={() => setCurrentTab('history')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded text-xs font-medium transition cursor-pointer relative ${
              currentTab === 'history'
                ? 'bg-[rgba(217,166,46,0.22)] text-[#F0C75E] border-l-4 border-[#D9A62E] font-bold shadow-sm'
                : 'text-[#D8D0BD] hover:text-white hover:bg-[rgba(255,244,214,0.08)]'
            }`}
          >
            <BookOpen className={`w-4 h-4 ${currentTab === 'history' ? 'text-[#F0C75E]' : 'text-[#D8D0BD]'}`} />
            <span className="font-mono tracking-wide">HISTORICAL LEARNING</span>
          </button>
        </div>

        {/* LOGISTICS & NETWORK */}
        <div className="space-y-1">
          <div className="px-2 pb-1 text-[10px] font-bold text-[#A8A28E] uppercase tracking-widest font-mono">
            RESOURCES & AUDIT
          </div>

          <button
            onClick={() => setCurrentTab('vendors')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded text-xs font-medium transition cursor-pointer relative ${
              currentTab === 'vendors'
                ? 'bg-[rgba(217,166,46,0.22)] text-[#F0C75E] border-l-4 border-[#D9A62E] font-bold shadow-sm'
                : 'text-[#D8D0BD] hover:text-white hover:bg-[rgba(255,244,214,0.08)]'
            }`}
          >
            <Building2 className={`w-4 h-4 ${currentTab === 'vendors' ? 'text-[#F0C75E]' : 'text-[#D8D0BD]'}`} />
            <span className="font-mono tracking-wide">MRO RESOURCES</span>
          </button>

          <button
            onClick={() => setCurrentTab('memory')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded text-xs font-medium transition cursor-pointer relative ${
              currentTab === 'memory'
                ? 'bg-[rgba(217,166,46,0.22)] text-[#F0C75E] border-l-4 border-[#D9A62E] font-bold shadow-sm'
                : 'text-[#D8D0BD] hover:text-white hover:bg-[rgba(255,244,214,0.08)]'
            }`}
          >
            <Database className={`w-4 h-4 ${currentTab === 'memory' ? 'text-[#F0C75E]' : 'text-[#D8D0BD]'}`} />
            <span className="font-mono tracking-wide">TIMELINE & MEMORY</span>
          </button>
        </div>

        {/* SAFETY & COMPLIANCE SECTION */}
        <div className="space-y-1 pt-1">
          <div className="px-2 pb-1 text-[10px] font-bold text-[#A8A28E] uppercase tracking-widest font-mono">
            GOVERNANCE
          </div>

          <button
            onClick={() => onOpenJudgesModal && onOpenJudgesModal()}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded text-xs font-semibold text-[#F7F1E4] hover:text-white bg-[rgba(38,42,34,0.7)] hover:bg-[rgba(52,58,46,0.9)] border border-[rgba(255,210,100,0.3)] transition cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-[#D9A62E]" />
            <span className="font-mono tracking-tight">JUDGES SAFETY FAQ</span>
          </button>
        </div>

      </div>

      {/* Bottom Status Box */}
      <div className="p-3 space-y-2 border-t border-[rgba(255,210,100,0.2)]">
        <button
          onClick={onResetDemo}
          className="w-full py-1.5 px-3 rounded bg-[rgba(38,42,34,0.7)] hover:bg-[rgba(52,58,46,0.9)] text-[#D8D0BD] hover:text-white border border-[rgba(255,210,100,0.2)] hover:border-[#D9A62E] text-[11px] font-mono font-semibold transition flex items-center justify-center space-x-1.5 cursor-pointer"
          title="Reset SQUAWK database to pristine VT-SQK Delhi hero baseline"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#D9A62E]" />
          <span>RESET DEMO BASELINE</span>
        </button>

        <div className="p-2.5 rounded bg-[rgba(20,22,17,0.75)] border border-[rgba(255,210,100,0.2)] space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#78966A] inline-block shadow-[0_0_6px_#78966A]"></span>
              <span className="text-[10px] font-mono font-bold text-[#D8D0BD] uppercase tracking-wider">
                MISSION CONTROL
              </span>
            </div>
            <span className="text-[9px] font-mono text-[#F0C75E] font-bold">LIVE</span>
          </div>
          <div className="text-[10px] font-mono text-[#D8D0BD]">
            AIRCRAFT ON GROUND DISPATCH
          </div>
          <div className="text-[9px] font-mono text-[#F0C75E] font-semibold tracking-wider pt-0.5 border-t border-[rgba(255,210,100,0.15)]">
            HUMAN-IN-THE-LOOP ACTIVE
          </div>
        </div>
      </div>

    </aside>
  );
};
