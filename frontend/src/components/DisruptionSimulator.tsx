import React, { useState } from 'react';
import { 
  Zap, 
  RefreshCw, 
  PlaneTakeoff, 
  PackageX, 
  Clock,
  ShieldAlert
} from 'lucide-react';
import { api } from '../api';

interface DisruptionSimulatorProps {
  caseId: string;
  isDisrupted: boolean;
  replanCount: number;
  onDisruptionTriggered: () => void;
  onReplanTriggered: () => void;
}

export const DisruptionSimulator: React.FC<DisruptionSimulatorProps> = ({
  caseId,
  isDisrupted,
  replanCount,
  onDisruptionTriggered,
  onReplanTriggered
}) => {
  const [loadingType, setLoadingType] = useState<string | null>(null);

  const handleSimulate = async (type: string) => {
    setLoadingType(type);
    try {
      await api.simulateDisruption(caseId, type);
      onDisruptionTriggered();
    } catch (err: any) {
      alert('Error triggering disruption: ' + err.message);
    } finally {
      setLoadingType(null);
    }
  };

  const handleReplan = async () => {
    setLoadingType('REPLAN');
    try {
      await api.replanRecovery(caseId);
      onReplanTriggered();
    } catch (err: any) {
      alert('Error executing replan: ' + err.message);
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-[#151B23] border border-[#26313D]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wide">
              OPERATIONAL CONTINGENCY & DISRUPTION CONTROLLER
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Inject real-time operational contingencies to trigger autonomous agent replanning.
            </p>
          </div>
        </div>

        {isDisrupted && (
          <span className="px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-800/60 text-red-300 text-[10px] font-mono font-bold self-start sm:self-auto">
            ● DISRUPTION ACTIVE — REPLAN REQUIRED
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        
        {/* Button 1: Supplier Stockout */}
        <button
          onClick={() => handleSimulate('SUPPLIER_STOCKOUT')}
          disabled={loadingType !== null}
          className="p-3 rounded-lg bg-[#11161D] border border-[#26313D] hover:border-amber-500/60 text-left transition active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs mb-1">
            <PackageX className="w-4 h-4 text-amber-400" />
            <span>Supplier Stockout</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Zeros AeroParts (SIN) inventory in live database.
          </p>
        </button>

        {/* Button 2: Flight Cancelled */}
        <button
          onClick={() => handleSimulate('FLIGHT_CANCELLED')}
          disabled={loadingType !== null}
          className="p-3 rounded-lg bg-[#11161D] border border-[#26313D] hover:border-amber-500/60 text-left transition active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs mb-1">
            <PlaneTakeoff className="w-4 h-4 text-amber-400" />
            <span>Flight Cancelled</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Cancels Flight SQ-402 (SIN → DEL cargo).
          </p>
        </button>

        {/* Button 3: Customs Delay */}
        <button
          onClick={() => handleSimulate('CUSTOMS_HOLD')}
          disabled={loadingType !== null}
          className="p-3 rounded-lg bg-[#11161D] border border-[#26313D] hover:border-amber-500/60 text-left transition active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs mb-1">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Customs Delay</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Injects 6h import clearance hold at DEL.
          </p>
        </button>

        {/* Button 4: Autonomous Replan */}
        <button
          onClick={handleReplan}
          disabled={loadingType !== null}
          className="p-3 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black font-bold text-left transition active:scale-95 shadow-md shadow-amber-950/40 disabled:opacity-50 cursor-pointer"
        >
          <div className="flex items-center space-x-2 text-black font-extrabold text-xs mb-1">
            <RefreshCw className={`w-4 h-4 ${loadingType === 'REPLAN' ? 'animate-spin' : ''}`} />
            <span>Autonomous Replan</span>
          </div>
          <p className="text-[11px] text-black/90 font-medium leading-tight">
            Re-queries suppliers & selects SkySupply (BOM).
          </p>
        </button>

      </div>
    </div>
  );
};
