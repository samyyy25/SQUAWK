import React from 'react';
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Bell, 
  Moon, 
  ShieldAlert,
  PanelLeft,
  LayoutGrid,
  Radio
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
      case 'overview': return 'Overview';
      case 'cases': return 'AOG Cases Queue';
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
        <button className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
          <PanelLeft className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-800"></div>

        <div className="flex items-center space-x-2">
          <LayoutGrid className="w-4 h-4 text-slate-400" />
          <h1 className="text-sm font-bold text-white tracking-wide">{getTitle()}</h1>
        </div>
      </div>

      {/* Right Controls & Quick Actions */}
      <div className="flex items-center space-x-3">
        
        {/* New Flight / Case Button */}
        <button
          onClick={openIntakeModal}
          className="flex items-center space-x-1.5 bg-[#ffffff] hover:bg-slate-200 text-black px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>New flight / AOG</span>
        </button>

        {/* Quick icons */}
        <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition">
          <SlidersHorizontal className="w-4 h-4" />
        </button>

        <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition">
          <Radio className="w-4 h-4 text-emerald-400" />
        </button>

        <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition">
          <Moon className="w-4 h-4" />
        </button>

      </div>

    </header>
  );
};
