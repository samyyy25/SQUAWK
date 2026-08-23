import React from 'react';
import { 
  Plane, 
  LayoutDashboard, 
  Layers, 
  Database, 
  BrainCircuit, 
  CheckSquare, 
  Activity, 
  PlusCircle, 
  ShieldAlert,
  Search,
  Bell,
  Radio
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openIntakeModal: () => void;
  totalAogCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  openIntakeModal,
  totalAogCount
}) => {
  return (
    <div className="bg-[#090d14] border-b border-slate-800 text-slate-200">
      {/* Top Operations Telemetry Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black tracking-wider">
            <Plane className="w-5 h-5 -rotate-45" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-widest text-white">SQUAWK</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                AOG Orchestrator
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1"></span>
                RocketRide Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              From defect report to recovery plan — before the clock gets expensive.
            </p>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search Aircraft, ATA, or Part #..." 
              className="bg-slate-900/90 border border-slate-800 text-xs rounded-lg pl-9 pr-4 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 w-64"
            />
          </div>

          <button 
            onClick={openIntakeModal}
            className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-lg shadow-red-950/40 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New AOG Case</span>
          </button>

          <div className="h-6 w-px bg-slate-800"></div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-xs font-medium text-slate-200">Duty Tech Ops Desk</div>
              <div className="text-[10px] text-slate-400 font-mono">ORD Station Control</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-cyan-400">
              TO
            </div>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex items-center space-x-1 px-6 py-1.5 overflow-x-auto text-xs font-medium bg-[#0c1017]">
        <button
          onClick={() => setCurrentTab('overview')}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md transition ${
            currentTab === 'overview' 
              ? 'bg-slate-800 text-cyan-400 font-semibold border-b-2 border-cyan-400' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setCurrentTab('cases')}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md transition ${
            currentTab === 'cases' 
              ? 'bg-slate-800 text-cyan-400 font-semibold border-b-2 border-cyan-400' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>AOG Cases</span>
          <span className="px-1.5 py-0.2 rounded-full bg-red-950 text-red-400 text-[10px] border border-red-800 font-mono">
            {totalAogCount}
          </span>
        </button>

        <button
          onClick={() => setCurrentTab('batch')}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md transition ${
            currentTab === 'batch' 
              ? 'bg-slate-800 text-cyan-400 font-semibold border-b-2 border-cyan-400' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Radio className="w-4 h-4 text-emerald-400" />
          <span>Batch Processing</span>
        </button>

        <button
          onClick={() => setCurrentTab('vendors')}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md transition ${
            currentTab === 'vendors' 
              ? 'bg-slate-800 text-cyan-400 font-semibold border-b-2 border-cyan-400' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Vendors</span>
        </button>

        <button
          onClick={() => setCurrentTab('memory')}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md transition ${
            currentTab === 'memory' 
              ? 'bg-slate-800 text-cyan-400 font-semibold border-b-2 border-cyan-400' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <BrainCircuit className="w-4 h-4 text-purple-400" />
          <span>Memory & Learning</span>
        </button>

        <button
          onClick={() => setCurrentTab('activity')}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md transition ${
            currentTab === 'activity' 
              ? 'bg-slate-800 text-cyan-400 font-semibold border-b-2 border-cyan-400' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Activity Stream</span>
        </button>
      </div>

      {/* Airworthiness Legal & Operational Safety Banner */}
      <div className="bg-amber-950/40 border-t border-b border-amber-800/50 px-6 py-1 text-[11px] text-amber-300 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            <strong>AIRWORTHINESS ADVISORY:</strong> SQUAWK is an AI decision-support & operations orchestrator. All recovery recommendations require authorization by a licensed A&P / Part 66 engineer.
          </span>
        </div>
        <span className="text-[10px] font-mono text-amber-400/80">DEMO MODE ACTIVE</span>
      </div>
    </div>
  );
};
