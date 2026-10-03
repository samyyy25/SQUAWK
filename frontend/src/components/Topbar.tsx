import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck,
  RotateCcw,
  Radio,
  User,
  Compass
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
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      };
      const formatted = now.toLocaleDateString('en-GB', options).replace(/,/g, '');
      const parts = formatted.split(' ');
      // Format: Wed, 24 Sep 2025 | 14:32
      const timeStr = `${parts[0]}, ${parts[1]} ${parts[2]} ${parts[3]} | ${parts[4]}`;
      setTimeString(timeStr);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-14 bg-[rgba(26,29,23,0.92)] backdrop-blur-xl border-b border-[rgba(255,210,100,0.22)] px-5 flex items-center justify-between shrink-0 select-none text-[#F7F1E4] font-sans z-20">
      
      {/* Left Title / Operational Status */}
      <div className="flex items-center space-x-3">
        {/* System Online Status Indicator from Reference */}
        <div className="flex items-center space-x-2 px-2.5 py-1 rounded bg-[rgba(38,42,34,0.65)] border border-[rgba(255,210,100,0.2)]">
          <span className="w-2 h-2 rounded-full bg-[#78966A] shadow-[0_0_8px_#78966A]"></span>
          <span className="text-[11px] font-mono font-bold text-[#F7F1E4] tracking-wide">
            System Online
          </span>
        </div>

        <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded bg-[rgba(20,22,17,0.7)] border border-[rgba(217,166,46,0.3)]">
          <span className="text-[11px] font-mono font-bold text-[#F0C75E] tracking-widest uppercase">
            AOG DISPATCH CONSOLE
          </span>
        </div>

        <span className="text-xs text-[#D8D0BD] font-mono hidden xl:inline">
          DEL / VIDP · HUB CONTROL ACTIVE
        </span>
      </div>

      {/* Right Controls + Reference HUD Coordinates */}
      <div className="flex items-center space-x-3">
        
        {/* Aviation HUD Coordinates Box from Reference Image */}
        <div className="hidden lg:flex items-center space-x-2.5 px-3 py-1 bg-[rgba(20,22,17,0.75)] border border-[rgba(217,166,46,0.4)] rounded text-[10px] font-mono text-[#F0C75E] hud-reticle">
          <div className="text-right leading-tight">
            <div className="font-bold text-white tracking-widest">DEL</div>
            <div className="text-[9px] text-[#D8D0BD]">T3 ✳</div>
          </div>
          <div className="border-l border-[rgba(217,166,46,0.3)] pl-2 text-left leading-tight">
            <div className="text-[#F7F1E4]">28.5562° N</div>
            <div className="text-[#D8D0BD]">77.1000° E</div>
          </div>
        </div>

        {/* Live Date / Time Display from Reference */}
        <div className="hidden md:block text-xs font-mono text-[#D8D0BD] px-2 py-1 bg-[rgba(38,42,34,0.4)] rounded border border-[rgba(255,210,100,0.15)]">
          {timeString || 'Wed, 24 Sep 2025 | 14:32'}
        </div>

        {/* Reset Demo Button */}
        <button
          onClick={onResetDemo}
          className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-[rgba(38,42,34,0.7)] hover:bg-[rgba(52,58,46,0.9)] border border-[rgba(255,210,100,0.25)] hover:border-[#D9A62E] text-[11px] font-mono text-[#D8D0BD] hover:text-white transition cursor-pointer"
          title="Reset SQUAWK database to pristine VT-SQK Delhi baseline"
        >
          <RotateCcw className="w-3 h-3 text-[#D9A62E]" />
          <span>RESET BASELINE</span>
        </button>

        {/* Judges & Safety Guide Button */}
        <button
          onClick={onOpenJudgesModal}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-gradient-to-r from-[#D9A62E] to-[#F0C75E] hover:from-[#F0C75E] hover:to-[#D9A62E] text-[#252820] text-[11px] font-mono font-bold transition border border-[#F0C75E] cursor-pointer shadow-md"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#252820]" />
          <span className="tracking-wide">SAFETY GOVERNANCE</span>
        </button>

        {/* User Operator Status */}
        <div className="flex items-center space-x-2 pl-2 border-l border-[rgba(255,210,100,0.25)]">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D9A62E] to-[#A87813] text-[#252820] font-mono font-black text-[11px] flex items-center justify-center border border-[#F0C75E] shadow-sm">
            OC
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-[11px] font-bold text-white leading-tight font-mono">DUTY CONTROLLER</div>
            <div className="text-[9px] text-[#D8D0BD] font-mono">STATION DEL · AUTH 2048</div>
          </div>
        </div>

      </div>

    </header>
  );
};
