import React from 'react';
import { 
  Plane, 
  LayoutDashboard, 
  Layers, 
  Plus, 
  Building2, 
  Bot,
  Database,
  Radio
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openIntakeModal: () => void;
  totalAogCount: number;
  activeFilterRegion?: string;
  setActiveFilterRegion?: (region: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  openIntakeModal,
  totalAogCount
}) => {
  return (
    <aside className="w-[240px] bg-[#070B11] border-r border-[#151D2A] flex flex-col justify-between shrink-0 select-none text-slate-300 h-screen sticky top-0 font-sans z-30">
      
      {/* Top Header & Navigation */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
        
        {/* Brand Header */}
        <div className="flex items-center space-x-3 px-1">
          <div className="w-8 h-8 rounded-lg bg-[#0284c7] flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Plane className="w-5 h-5 -rotate-45" />
          </div>
          <div>
            <div className="text-sm font-black text-white tracking-wider leading-none">SQUAWK</div>
            <div className="text-[11px] text-[#38bdf8] font-medium mt-0.5">AOG Recovery Orchestrator</div>
          </div>
        </div>

        {/* OPERATIONS SECTION */}
        <div className="space-y-1.5">
          <div className="px-2 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            OPERATIONS
          </div>

          {/* Overview */}
          <button
            onClick={() => setCurrentTab('overview')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
              currentTab === 'overview'
                ? 'bg-[#0284c7] text-white shadow-md shadow-cyan-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0E1522]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview</span>
          </button>

          {/* AOG Cases */}
          <button
            onClick={() => setCurrentTab('cases')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
              currentTab === 'cases'
                ? 'bg-[#0284c7] text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0E1522]'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Layers className="w-4 h-4" />
              <span>AOG Cases</span>
            </div>
            <span className="px-1.5 py-0.5 rounded-full bg-[#ef4444] text-white text-[10px] font-mono font-bold leading-none">
              {totalAogCount || 3}
            </span>
          </button>

          {/* New AOG Intake */}
          <button
            onClick={openIntakeModal}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-cyan-300 hover:bg-[#0E1522] transition cursor-pointer"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>New AOG Intake</span>
          </button>
        </div>

        {/* NETWORK SECTION */}
        <div className="space-y-1.5">
          <div className="px-2 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            NETWORK
          </div>

          <button
            onClick={() => setCurrentTab('vendors')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
              currentTab === 'vendors'
                ? 'bg-[#0284c7] text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0E1522]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Suppliers & Hubs</span>
          </button>

          <button
            onClick={() => setCurrentTab('batch')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
              currentTab === 'batch'
                ? 'bg-[#0284c7] text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0E1522]'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Batch Queue</span>
          </button>
        </div>

        {/* INTELLIGENCE SECTION */}
        <div className="space-y-1.5">
          <div className="px-2 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
            INTELLIGENCE
          </div>

          <button
            onClick={() => setCurrentTab('activity')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
              currentTab === 'activity'
                ? 'bg-[#0284c7] text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0E1522]'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Agent Activity</span>
          </button>

          <button
            onClick={() => setCurrentTab('memory')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
              currentTab === 'memory'
                ? 'bg-[#0284c7] text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#0E1522]'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Vendor Memory</span>
          </button>
        </div>

      </div>

      {/* Bottom Status Box */}
      <div className="p-3">
        <div className="p-3 rounded-xl bg-[#0B1019] border border-[#172233] space-y-1">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              ACTIVE OPERATIONS
            </span>
          </div>
          <div className="text-xs font-bold text-white">Live Operations Center</div>
          <div className="text-[10px] text-cyan-400 font-medium">AI SUGGESTS · HUMAN DECIDES</div>
        </div>
      </div>

    </aside>
  );
};
