import React from 'react';
import { 
  Plane, 
  LayoutDashboard, 
  Layers, 
  Database, 
  BrainCircuit, 
  Radio, 
  Activity, 
  Plus, 
  ShieldAlert,
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronsUpDown,
  Star,
  Sparkles,
  ShieldCheck,
  Cpu
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openIntakeModal: () => void;
  totalAogCount: number;
  activeFilterRegion: string;
  setActiveFilterRegion: (region: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  openIntakeModal,
  totalAogCount,
  activeFilterRegion,
  setActiveFilterRegion
}) => {
  const regions = [
    'North America',
    'Europe',
    'Asia Pacific',
    'Middle East'
  ];

  return (
    <aside className="w-64 bg-[#121316] border-r border-[#1e2025] flex flex-col justify-between shrink-0 select-none text-slate-300 h-screen sticky top-0">
      
      {/* Top Brand Header & Navigation Sections */}
      <div className="overflow-y-auto flex-1 custom-scrollbar">
        
        {/* Brand Header */}
        <div className="p-4 flex items-center justify-between border-b border-[#1e2025]/80">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-purple-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-black shadow-inner shadow-cyan-500/10">
              <Plane className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-sm font-bold text-white tracking-wider">SQUAWK</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/80 font-mono">v2.4</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">AOG Recovery Orchestrator</div>
            </div>
          </div>
        </div>

        {/* OPERATIONS SECTION */}
        <div className="p-3 space-y-1">
          <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Operations
          </div>

          <button
            onClick={() => setCurrentTab('overview')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
              currentTab === 'overview'
                ? 'bg-[#1e222b] text-white font-semibold shadow-sm ring-1 ring-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#181a20]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <LayoutDashboard className={`w-4 h-4 ${currentTab === 'overview' ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>Overview Center</span>
            </div>
          </button>

          <button
            onClick={() => setCurrentTab('cases')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
              currentTab === 'cases'
                ? 'bg-[#1e222b] text-white font-semibold shadow-sm ring-1 ring-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#181a20]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Layers className={`w-4 h-4 ${currentTab === 'cases' ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>AOG Cases Queue</span>
            </div>
            <span className="px-1.5 py-0.5 rounded-md bg-red-950/80 text-red-400 border border-red-800/60 text-[10px] font-mono font-bold">
              {totalAogCount}
            </span>
          </button>

          <button
            onClick={openIntakeModal}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-cyan-300 hover:text-cyan-200 hover:bg-cyan-950/30 transition border border-dashed border-cyan-800/50"
          >
            <div className="flex items-center space-x-2.5">
              <Plus className="w-4 h-4 text-cyan-400" />
              <span>New AOG Intake</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-500">Pipeline</span>
          </button>

          <button
            onClick={() => setCurrentTab('batch')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
              currentTab === 'batch'
                ? 'bg-[#1e222b] text-white font-semibold shadow-sm ring-1 ring-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#181a20]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Radio className={`w-4 h-4 ${currentTab === 'batch' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>Batch Queue</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">
              15 cases
            </span>
          </button>
        </div>

        {/* NETWORK SECTION */}
        <div className="p-3 pt-0 space-y-1">
          <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Network & Intelligence
          </div>

          <button
            onClick={() => setCurrentTab('vendors')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
              currentTab === 'vendors'
                ? 'bg-[#1e222b] text-white font-semibold shadow-sm ring-1 ring-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#181a20]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Database className={`w-4 h-4 ${currentTab === 'vendors' ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>Vendors & Hubs</span>
            </div>
          </button>

          <button
            onClick={() => setCurrentTab('memory')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
              currentTab === 'memory'
                ? 'bg-[#1e222b] text-white font-semibold shadow-sm ring-1 ring-purple-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#181a20]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <BrainCircuit className={`w-4 h-4 ${currentTab === 'memory' ? 'text-purple-400' : 'text-slate-400'}`} />
              <span>Vendor Memory</span>
            </div>
            <span className="text-[10px] text-purple-400 font-mono">Learning</span>
          </button>

          <button
            onClick={() => setCurrentTab('activity')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
              currentTab === 'activity'
                ? 'bg-[#1e222b] text-white font-semibold shadow-sm ring-1 ring-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#181a20]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Activity className={`w-4 h-4 ${currentTab === 'activity' ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>Activity Stream</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Audit</span>
          </button>
        </div>

        {/* Operational Scope & Hubs */}
        <div className="px-4 pt-2 pb-2">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            <span>Operating Regions</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {regions.map((reg) => {
              const active = activeFilterRegion === reg;
              return (
                <button
                  key={reg}
                  onClick={() => setActiveFilterRegion(active ? 'ALL' : reg)}
                  className={`flex items-center space-x-1.5 px-2 py-1 rounded-lg text-[11px] transition text-left truncate ${
                    active ? 'text-cyan-400 font-semibold bg-[#181a20] border border-cyan-800/50' : 'text-slate-400 hover:text-slate-200 bg-[#14161a]/60'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                  <span className="truncate">{reg}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Bottom Human Reviewer Profile & Mode */}
      <div className="p-3 border-t border-[#1e2025] space-y-2 shrink-0 bg-[#0f1013]">
        <div className="px-2.5 py-1.5 rounded-xl bg-[#181a20] border border-[#242730] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-[11px]">squawk.ops.demo</span>
          </div>
          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">Advisory</span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-xl bg-[#14161a] border border-[#1e2025]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs ring-2 ring-cyan-500/30">
              MV
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center space-x-1">
                <span>Capt. Marcus Vance</span>
              </div>
              <div className="text-[10px] text-slate-400">FAA A&P #482910</div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">Decider</span>
        </div>
      </div>

    </aside>
  );
};

