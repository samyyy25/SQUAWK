import React from 'react';
import { 
  Bell, 
  ChevronDown,
  ShieldCheck,
  Cpu
} from 'lucide-react';

interface TopbarProps {
  currentTab: string;
  openIntakeModal?: () => void;
}

export const Topbar: React.FC<TopbarProps> = () => {
  return (
    <header className="h-14 bg-[#070B11] border-b border-[#151D2A] px-6 flex items-center justify-between shrink-0 select-none text-slate-200 font-sans z-20">
      
      {/* Left Title */}
      <div className="flex items-center space-x-2.5">
        <div className="w-6 h-6 rounded-md bg-[#0e2238] border border-cyan-500/40 flex items-center justify-center text-cyan-400">
          <Cpu className="w-3.5 h-3.5" />
        </div>
        <h1 className="text-sm font-bold text-white tracking-wide">AOG Command Center</h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        
        {/* Operations Environment Badge */}
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-[#061e2f]/80 border border-[#0284c7]/70 text-[11px] font-mono text-cyan-300 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="font-semibold uppercase tracking-wider">OPERATIONS ENVIRONMENT</span>
        </div>

        {/* AI Suggests · Human Decides Badge */}
        <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#041a24]/90 border border-[#0e7490]/70 text-[11px] font-mono text-cyan-300 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold uppercase tracking-wide">AI SUGGESTS · HUMAN DECIDES</span>
        </div>

        {/* Notifications Bell */}
        <button className="w-8 h-8 rounded-full bg-[#0F1724] border border-[#1E293B] flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-600 transition cursor-pointer">
          <Bell className="w-4 h-4" />
        </button>

        {/* User Operator Dropdown */}
        <div className="flex items-center space-x-2 pl-1 cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-[#0284c7] text-white font-bold text-xs flex items-center justify-center shadow-md">
            OC
          </div>
          <span className="text-xs font-semibold text-slate-300 hover:text-white transition">
            Operations Controller
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
        </div>

      </div>

    </header>
  );
};
