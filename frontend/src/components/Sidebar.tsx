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
  RotateCcw
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
    <aside className="w-[240px] bg-[#000000] border-r border-[#1E1E1E] flex flex-col justify-between shrink-0 select-none text-neutral-300 h-screen sticky top-0 font-sans z-30">
      
      {/* Top Header & Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        
        {/* Brand Header */}
        <div className="flex items-center space-x-3 px-1 pb-3 border-b border-[#1E1E1E]">
          <div className="w-8 h-8 rounded bg-[#830000] flex items-center justify-center text-white shadow-sm border border-[#BC0202]">
            <Plane className="w-4 h-4 -rotate-45 text-[#FFFFFF]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-sm font-black text-white tracking-widest font-mono">SQUAWK</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF0000] animate-pulse" title="System Operational"></span>
            </div>
            <div className="text-[10px] text-neutral-400 font-mono tracking-tight mt-0.5">AOG OPS COMMAND</div>
          </div>
        </div>

        {/* OPERATIONS SECTION */}
        <div className="space-y-1">
          <div className="px-2 pb-1 text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">
            OPERATIONS
          </div>

          {/* Overview */}
          <button
            onClick={() => setCurrentTab('overview')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded text-xs font-semibold transition cursor-pointer relative ${
              currentTab === 'overview'
                ? 'bg-[#830000] text-white shadow-sm border-l-4 border-[#BC0202]'
                : 'text-neutral-400 hover:text-white hover:bg-[#0D0D0D]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-neutral-300" />
            <span className="font-mono tracking-wide">OVERVIEW</span>
          </button>

          {/* AOG Squawks */}
          <button
            onClick={() => setCurrentTab('cases')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition cursor-pointer relative ${
              currentTab === 'cases'
                ? 'bg-[#830000] text-white font-semibold border-l-4 border-[#BC0202]'
                : 'text-neutral-400 hover:text-white hover:bg-[#0D0D0D]'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Layers className="w-4 h-4 text-neutral-300" />
              <span className="font-mono tracking-wide">AOG SQUAWKS</span>
            </div>
            <span className="px-1.5 py-0.5 rounded bg-[#FF0000] text-white text-[10px] font-mono font-bold leading-none">
              {totalAogCount || 3}
            </span>
          </button>

          {/* New AOG Intake */}
          <button
            onClick={openIntakeModal}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded text-xs font-medium text-neutral-300 hover:text-white hover:bg-[#830000]/30 border border-[#830000]/50 transition cursor-pointer mt-1"
          >
            <Plus className="w-4 h-4 text-[#BC0202]" />
            <span className="font-mono tracking-wide">NEW INTAKE</span>
          </button>
        </div>

        {/* DECISION SUPPORT SECTION */}
        <div className="space-y-1">
          <div className="px-2 pb-1 text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">
            DECISION SUPPORT
          </div>

          <button
            onClick={() => setCurrentTab('activity')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded text-xs font-medium transition cursor-pointer relative ${
              currentTab === 'activity'
                ? 'bg-[#830000] text-white font-semibold border-l-4 border-[#BC0202]'
                : 'text-neutral-400 hover:text-white hover:bg-[#0D0D0D]'
            }`}
          >
            <Cpu className="w-4 h-4 text-neutral-300" />
            <span className="font-mono tracking-wide">AI INTELLIGENCE</span>
          </button>

          <button
            onClick={() => setCurrentTab('batch')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded text-xs font-medium transition cursor-pointer relative ${
              currentTab === 'batch'
                ? 'bg-[#830000] text-white font-semibold border-l-4 border-[#BC0202]'
                : 'text-neutral-400 hover:text-white hover:bg-[#0D0D0D]'
            }`}
          >
            <Radio className="w-4 h-4 text-neutral-300" />
            <span className="font-mono tracking-wide">RECOVERY PLANS</span>
          </button>
        </div>

        {/* LOGISTICS & NETWORK */}
        <div className="space-y-1">
          <div className="px-2 pb-1 text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">
            RESOURCES & AUDIT
          </div>

          <button
            onClick={() => setCurrentTab('vendors')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded text-xs font-medium transition cursor-pointer relative ${
              currentTab === 'vendors'
                ? 'bg-[#830000] text-white font-semibold border-l-4 border-[#BC0202]'
                : 'text-neutral-400 hover:text-white hover:bg-[#0D0D0D]'
            }`}
          >
            <Building2 className="w-4 h-4 text-neutral-300" />
            <span className="font-mono tracking-wide">MRO RESOURCES</span>
          </button>

          <button
            onClick={() => setCurrentTab('memory')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded text-xs font-medium transition cursor-pointer relative ${
              currentTab === 'memory'
                ? 'bg-[#830000] text-white font-semibold border-l-4 border-[#BC0202]'
                : 'text-neutral-400 hover:text-white hover:bg-[#0D0D0D]'
            }`}
          >
            <Database className="w-4 h-4 text-neutral-300" />
            <span className="font-mono tracking-wide">TIMELINE & MEMORY</span>
          </button>
        </div>

        {/* SAFETY & COMPLIANCE SECTION */}
        <div className="space-y-1 pt-1">
          <div className="px-2 pb-1 text-[10px] font-bold text-neutral-500 uppercase tracking-widest font-mono">
            GOVERNANCE
          </div>

          <button
            onClick={() => onOpenJudgesModal && onOpenJudgesModal()}
            className="w-full flex items-center space-x-2.5 px-3 py-2 rounded text-xs font-semibold text-neutral-200 hover:text-white bg-[#0D0D0D] hover:bg-[#830000]/40 border border-[#830000]/60 transition cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-[#BC0202]" />
            <span className="font-mono tracking-tight">JUDGES SAFETY FAQ</span>
          </button>
        </div>

      </div>

      {/* Bottom Status Box */}
      <div className="p-3 space-y-2 border-t border-[#1E1E1E]">
        <button
          onClick={onResetDemo}
          className="w-full py-1.5 px-3 rounded bg-[#0D0D0D] hover:bg-[#830000]/30 text-neutral-400 hover:text-white border border-[#1E1E1E] hover:border-[#830000] text-[11px] font-mono font-semibold transition flex items-center justify-center space-x-1.5 cursor-pointer"
          title="Reset SQUAWK database to pristine VT-SQK Delhi hero baseline"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#BC0202]" />
          <span>RESET DEMO BASELINE</span>
        </button>

        <div className="p-2.5 rounded bg-[#080808] border border-[#1E1E1E] space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF0000] inline-block"></span>
              <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                MISSION CONTROL
              </span>
            </div>
            <span className="text-[9px] font-mono text-[#BC0202] font-bold">LIVE</span>
          </div>
          <div className="text-[10px] font-mono text-neutral-400">
            AIRCRAFT ON GROUND DISPATCH
          </div>
          <div className="text-[9px] font-mono text-[#BC0202] font-semibold tracking-wider pt-0.5 border-t border-[#1E1E1E]">
            HUMAN-IN-THE-LOOP ACTIVE
          </div>
        </div>
      </div>

    </aside>
  );
};
