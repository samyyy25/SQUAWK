import React from 'react';
import { 
  ShieldCheck,
  RotateCcw,
  Radio
} from 'lucide-react';

interface TopbarProps {
  currentTab: string;
  openIntakeModal?: () => void;
  onOpenJudgesModal?: () => void;
  onResetDemo?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenJudgesModal,
  onResetDemo
}) => {
  return (
    <header className="h-13 bg-[#000000] border-b border-[#1E1E1E] px-5 flex items-center justify-between shrink-0 select-none text-neutral-200 font-sans z-20">
      
      {/* Left Title / Operational Status */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 px-2.5 py-1 rounded bg-[#0D0D0D] border border-[#1E1E1E]">
          <span className="w-2 h-2 rounded-full bg-[#FF0000]"></span>
          <span className="text-[11px] font-mono font-bold text-white tracking-widest uppercase">
            AOG DISPATCH CONSOLE
          </span>
        </div>
        <span className="text-xs text-neutral-400 font-mono hidden md:inline">
          DEL / VIDP · HUB CONTROL ACTIVE
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        
        {/* Reset Demo Button */}
        <button
          onClick={onResetDemo}
          className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#0D0D0D] hover:bg-[#830000]/30 border border-[#1E1E1E] hover:border-[#830000] text-[11px] font-mono text-neutral-300 hover:text-white transition cursor-pointer"
          title="Reset SQUAWK database to pristine VT-SQK Delhi baseline"
        >
          <RotateCcw className="w-3 h-3 text-[#BC0202]" />
          <span>RESET BASELINE</span>
        </button>

        {/* Judges & Safety Guide Button */}
        <button
          onClick={onOpenJudgesModal}
          className="flex items-center space-x-1.5 px-3 py-1 rounded bg-[#830000] hover:bg-[#BC0202] text-white text-[11px] font-mono font-semibold transition border border-[#BC0202] cursor-pointer shadow-sm"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-white" />
          <span className="tracking-wide">SAFETY GOVERNANCE</span>
        </button>

        {/* User Operator Status */}
        <div className="flex items-center space-x-2 pl-2 border-l border-[#1E1E1E]">
          <div className="w-6 h-6 rounded bg-[#830000] text-white font-mono font-bold text-[10px] flex items-center justify-center border border-[#BC0202]">
            OC
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-[11px] font-bold text-white leading-tight font-mono">DUTY CONTROLLER</div>
            <div className="text-[9px] text-neutral-400 font-mono">STATION DEL · AUTH 2048</div>
          </div>
        </div>

      </div>

    </header>
  );
};
