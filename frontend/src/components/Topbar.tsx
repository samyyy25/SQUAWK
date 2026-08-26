import React from 'react';
import { 
  Plus, 
  SlidersHorizontal, 
  PanelLeft,
  LayoutGrid,
  Radio,
  Sparkles,
  ShieldCheck,
  Cpu
} from 'lucide-react';

interface TopbarProps {
  currentTab: string;
  openIntakeModal: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentTab,
  openIntakeModal
}) => {
  const getTitle = () => {
    switch (currentTab) {
      case 'overview': return 'AOG Command Center';
      case 'cases': return 'AOG Case Queue & Dispatch';
      case 'batch': return 'Batch Processing Center';
      case 'vendors': return 'Aviation Supplier Network';
      case 'memory': return 'Vendor Memory & Learning';
      case 'activity': return 'Operations Audit Stream';
      default: return 'Flight Operations';
    }
  };

  return (
    <header className="h-14 bg-[#121316] border-b border-[#1e2025] px-6 flex items-center justify-between shrink-0 select-none text-slate-200">
      
      {/* Left Title & Icons */}
      <div className="flex items-center space-x-3">
        <div className="p-1 rounded-lg bg-slate-800/80 text-cyan-400 border border-slate-700/60">
          <Cpu className="w-4 h-4" />
        </div>

        <div className="h-4 w-px bg-slate-800"></div>

        <div className="flex items-center space-x-2">
          <h1 className="text-sm font-bold text-white tracking-wide">{getTitle()}</h1>
        </div>
      </div>

      {/* Center/Right Status & Controls */}
      <div className="flex items-center space-x-3">
        
        {/* Global Demo Environment Indicator */}
        <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-800/50 text-[11px] font-mono text-amber-300">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span className="font-semibold tracking-wider uppercase">DEMO ENVIRONMENT</span>
          <span className="text-amber-500/80">• Simulated Data</span>
        </div>

        {/* AI Suggests - Human Decides Badge */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-800/50 text-[11px] font-mono text-cyan-300">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold">AI Suggests. Human Decides.</span>
        </div>

        {/* New Flight / Case Button */}
        <button
          onClick={openIntakeModal}
          className="flex items-center space-x-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold px-3 py-1.5 rounded-xl text-xs transition shadow-lg shadow-cyan-950/50 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>New AOG Intake</span>
        </button>

      </div>

    </header>
  );
};

