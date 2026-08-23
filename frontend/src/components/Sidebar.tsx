import React from 'react';
import { 
  Plane, 
  LayoutDashboard, 
  Map, 
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
  Filter,
  Star,
  Sparkles
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
    'Middle East',
    'South America',
    'Africa'
  ];

  return (
    <aside className="w-64 bg-[#121316] border-r border-[#1e2025] flex flex-col justify-between shrink-0 select-none text-slate-300 h-screen sticky top-0">
      
      {/* Top Brand Header */}
      <div>
        <div className="p-4 flex items-center justify-between border-b border-[#1e2025]/80">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black shadow-inner">
              <Plane className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-sm font-bold text-white tracking-wider">Squawk</span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium leading-none">AOG Orchestrator</div>
            </div>
          </div>
          <button className="text-slate-500 hover:text-slate-300 transition">
            <ChevronsUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Navigation Menu */}
        <div className="p-3 space-y-1">
          <button
            onClick={() => setCurrentTab('overview')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
              currentTab === 'overview'
                ? 'bg-[#1e222b] text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#181a20]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <LayoutDashboard className={`w-4 h-4 ${currentTab === 'overview' ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>Overview</span>
            </div>
          </button>

          <button
            onClick={() => setCurrentTab('cases')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
              currentTab === 'cases'
                ? 'bg-[#1e222b] text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#181a20]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Layers className={`w-4 h-4 ${currentTab === 'cases' ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>AOG Cases</span>
            </div>
            <span className="px-1.5 py-0.5 rounded-md bg-red-950/80 text-red-400 border border-red-800/60 text-[10px] font-mono font-bold">
              {totalAogCount}
            </span>
          </button>

          <button
            onClick={() => setCurrentTab('batch')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
              currentTab === 'batch'
                ? 'bg-[#1e222b] text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#181a20]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Radio className={`w-4 h-4 ${currentTab === 'batch' ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>Batch Queue</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">15 cases</span>
          </button>

          <button
            onClick={() => setCurrentTab('vendors')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
              currentTab === 'vendors'
                ? 'bg-[#1e222b] text-white font-semibold shadow-sm'
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
                ? 'bg-[#1e222b] text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#181a20]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <BrainCircuit className={`w-4 h-4 ${currentTab === 'memory' ? 'text-purple-400' : 'text-slate-400'}`} />
              <span>Vendor Memory</span>
            </div>
          </button>

          <button
            onClick={() => setCurrentTab('activity')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
              currentTab === 'activity'
                ? 'bg-[#1e222b] text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#181a20]'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Activity className={`w-4 h-4 ${currentTab === 'activity' ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>Activity Stream</span>
            </div>
          </button>
        </div>

        {/* Regions Section */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            <span>Regions</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
          <div className="space-y-1">
            {regions.map((reg) => {
              const active = activeFilterRegion === reg;
              return (
                <button
                  key={reg}
                  onClick={() => setActiveFilterRegion(active ? 'ALL' : reg)}
                  className={`w-full flex items-center space-x-2.5 px-2 py-1.5 rounded-lg text-xs transition text-left ${
                    active ? 'text-cyan-400 font-semibold bg-[#181a20]' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                  <span>{reg}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters Section */}
        <div className="px-4 pt-2">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Filters
          </div>
          <button 
            onClick={() => setActiveFilterRegion(activeFilterRegion === 'HUBS_ONLY' ? 'ALL' : 'HUBS_ONLY')}
            className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded-lg text-xs transition text-left ${
              activeFilterRegion === 'HUBS_ONLY' ? 'text-amber-400 font-semibold bg-[#181a20]' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>AOG Hubs Only</span>
          </button>
        </div>
      </div>

      {/* Bottom User & System Link */}
      <div className="p-3 border-t border-[#1e2025] space-y-2">
        <div className="px-2.5 py-1.5 rounded-xl bg-[#181a20] border border-[#242730] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-[11px]">squawk.ops.aero</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
        </div>

        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#181a20] transition cursor-pointer">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-white text-xs ring-2 ring-purple-500/30">
              MV
            </div>
            <div>
              <div className="text-xs font-bold text-white">Capt. Marcus Vance</div>
              <div className="text-[10px] text-slate-400">Tech Ops Duty Director</div>
            </div>
          </div>
          <ChevronsUpDown className="w-4 h-4 text-slate-500" />
        </div>
      </div>

    </aside>
  );
};
