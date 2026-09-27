import React, { useState } from 'react';
import { 
  Zap, 
  RefreshCw, 
  PlaneTakeoff, 
  PackageX, 
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
    <div className="p-4 rounded-xl bg-[#000000] border border-[#830000] font-mono text-neutral-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded bg-[#0D0D0D] text-[#BC0202]">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wide">
              OPERATIONAL CONTINGENCY & DISRUPTION CONTROLLER
            </h3>
            <p className="text-[11px] text-neutral-400 font-sans">
              Inject real-time operational contingencies to trigger autonomous agent replanning
            </p>
          </div>
        </div>

        {isDisrupted && (
          <span className="px-2.5 py-0.5 rounded bg-[#000000] border border-[#FF0000] text-[#FF0000] text-[10px] font-bold self-start sm:self-auto">
            ● DISRUPTION ACTIVE — REPLAN REQUIRED
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        
        {/* Button 1: Supplier Stockout */}
        <button
          onClick={() => handleSimulate('SUPPLIER_STOCKOUT')}
          disabled={loadingType !== null}
          className="p-3 rounded bg-[#080808] border border-[#1E1E1E] hover:border-[#830000] text-left transition active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <div className="flex items-center space-x-2 text-[#BC0202] font-bold text-xs mb-1">
            <PackageX className="w-4 h-4" />
            <span>Supplier Stockout</span>
          </div>
          <p className="text-[10px] text-neutral-400 leading-tight font-sans">
            Zeros AeroParts (SIN) inventory in live database.
          </p>
        </button>

        {/* Button 2: Flight Cancelled */}
        <button
          onClick={() => handleSimulate('FLIGHT_CANCELLED')}
          disabled={loadingType !== null}
          className="p-3 rounded bg-[#080808] border border-[#1E1E1E] hover:border-[#830000] text-left transition active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <div className="flex items-center space-x-2 text-[#BC0202] font-bold text-xs mb-1">
            <PlaneTakeoff className="w-4 h-4" />
            <span>Flight Cancelled</span>
          </div>
          <p className="text-[10px] text-neutral-400 leading-tight font-sans">
            Cancels Flight SQ-402 (SIN → DEL cargo).
          </p>
        </button>

        {/* Button 3: Customs Delay */}
        <button
          onClick={() => handleSimulate('CUSTOMS_HOLD')}
          disabled={loadingType !== null}
          className="p-3 rounded bg-[#080808] border border-[#1E1E1E] hover:border-[#830000] text-left transition active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <div className="flex items-center space-x-2 text-[#BC0202] font-bold text-xs mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Customs Delay</span>
          </div>
          <p className="text-[10px] text-neutral-400 leading-tight font-sans">
            Injects 6h import clearance hold at DEL.
          </p>
        </button>

        {/* Button 4: Autonomous Replan */}
        <button
          onClick={handleReplan}
          disabled={loadingType !== null}
          className="p-3 rounded bg-[#830000] hover:bg-[#BC0202] text-white font-bold text-left transition active:scale-95 border border-[#BC0202] shadow-md disabled:opacity-50 cursor-pointer"
        >
          <div className="flex items-center space-x-2 text-white font-bold text-xs mb-1">
            <RefreshCw className={`w-4 h-4 ${loadingType === 'REPLAN' ? 'animate-spin' : ''}`} />
            <span>Autonomous Replan</span>
          </div>
          <p className="text-[10px] text-neutral-200 leading-tight font-sans">
            Re-queries suppliers & selects SkySupply (BOM).
          </p>
        </button>

      </div>
    </div>
  );
};
