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
    <div className="p-4 rounded-xl bg-[rgba(26,29,23,0.92)] border border-[rgba(255,210,100,0.3)] font-mono text-[#F7F1E4] backdrop-blur-xl shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded bg-[rgba(217,166,46,0.18)] text-[#F0C75E]">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wide">
              OPERATIONAL CONTINGENCY & DISRUPTION CONTROLLER
            </h3>
            <p className="text-[11px] text-[#D8D0BD] font-sans">
              Inject real-time operational contingencies to trigger autonomous agent replanning
            </p>
          </div>
        </div>

        {isDisrupted && (
          <span className="px-2.5 py-0.5 rounded bg-[rgba(200,91,67,0.2)] border border-[#C85B43] text-[#E07A63] text-[10px] font-bold self-start sm:self-auto">
            ● DISRUPTION ACTIVE — REPLAN REQUIRED
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        
        {/* Button 1: Supplier Stockout */}
        <button
          onClick={() => handleSimulate('SUPPLIER_STOCKOUT')}
          disabled={loadingType !== null}
          className="p-3 rounded-lg bg-[rgba(16,18,14,0.7)] border border-[rgba(255,210,100,0.2)] hover:border-[#D9A62E] text-left transition active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <div className="flex items-center space-x-2 text-[#F0C75E] font-bold text-xs mb-1">
            <PackageX className="w-4 h-4" />
            <span>Supplier Stockout</span>
          </div>
          <p className="text-[10px] text-[#D8D0BD] leading-tight font-sans">
            Zeros AeroParts (SIN) inventory in live database.
          </p>
        </button>

        {/* Button 2: Flight Cancelled */}
        <button
          onClick={() => handleSimulate('FLIGHT_CANCELLED')}
          disabled={loadingType !== null}
          className="p-3 rounded-lg bg-[rgba(16,18,14,0.7)] border border-[rgba(255,210,100,0.2)] hover:border-[#D9A62E] text-left transition active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <div className="flex items-center space-x-2 text-[#F0C75E] font-bold text-xs mb-1">
            <PlaneTakeoff className="w-4 h-4" />
            <span>Flight Cancelled</span>
          </div>
          <p className="text-[10px] text-[#D8D0BD] leading-tight font-sans">
            Cancels Flight SQ-402 (SIN → DEL cargo).
          </p>
        </button>

        {/* Button 3: Customs Delay */}
        <button
          onClick={() => handleSimulate('CUSTOMS_HOLD')}
          disabled={loadingType !== null}
          className="p-3 rounded-lg bg-[rgba(16,18,14,0.7)] border border-[rgba(255,210,100,0.2)] hover:border-[#D9A62E] text-left transition active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <div className="flex items-center space-x-2 text-[#F0C75E] font-bold text-xs mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Customs Delay</span>
          </div>
          <p className="text-[10px] text-[#D8D0BD] leading-tight font-sans">
            Injects 6h import clearance hold at DEL.
          </p>
        </button>

        {/* Button 4: Autonomous Replan */}
        <button
          onClick={handleReplan}
          disabled={loadingType !== null}
          className="p-3 rounded-lg bg-gradient-to-r from-[#D9A62E] to-[#F0C75E] hover:from-[#E2B139] hover:to-[#F7D475] text-[#252820] font-bold text-left transition active:scale-95 border border-[#F0C75E] shadow-md disabled:opacity-50 cursor-pointer"
        >
          <div className="flex items-center space-x-2 text-[#252820] font-bold text-xs mb-1">
            <RefreshCw className={`w-4 h-4 ${loadingType === 'REPLAN' ? 'animate-spin' : ''}`} />
            <span>Autonomous Replan</span>
          </div>
          <p className="text-[10px] text-[#252820]/80 leading-tight font-sans font-medium">
            Re-queries suppliers & selects SkySupply (BOM).
          </p>
        </button>

      </div>
    </div>
  );
};
