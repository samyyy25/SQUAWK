import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  Wrench, 
  AlertCircle, 
  ShieldCheck, 
  BookOpen,
  Send
} from 'lucide-react';
import { api } from '../api';
import { SquawkCase } from '../types';

interface ResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  squawkCase: SquawkCase;
  onResolved: (updatedCase: SquawkCase) => void;
}

export const ResolutionModal: React.FC<ResolutionModalProps> = ({
  isOpen,
  onClose,
  squawkCase,
  onResolved
}) => {
  const [actualResolution, setActualResolution] = useState(
    'Replaced Engine-Driven Hydraulic Pump Assembly (HP-2048) with Factory New unit from AeroParts Singapore. System pressurized to 3,000 PSI; no leakage observed during 30-min ground test run.'
  );
  const [actualRecoveryTimeHours, setActualRecoveryTimeHours] = useState(8.0);
  const [partsUsed, setPartsUsed] = useState('HP-2048 (SN-HPT-99411), SK-737-HYD-04 Seal Kit');
  const [rootCause, setRootCause] = useState(
    'EDP main shaft seal high-pressure fatigue failure causing intermittent internal cavity leakage and vibration indication.'
  );
  const [delayMinutes, setDelayMinutes] = useState(45);
  const [maintenanceTeam, setMaintenanceTeam] = useState('DEL Terminal 3 Rapid Response Hangar Crew 2');
  const [additionalObservations, setAdditionalObservations] = useState(
    'All ground test parameters within AMM 29-11-00 limits. Borescope inspection of engine accessories compartment clean.'
  );
  const [lessonsLearned, setLessonsLearned] = useState(
    'Shaft seal wear accelerates in high-frequency turnaround operations. Recommend scheduled borescope inspection at 1,200 flight hours rather than 1,500.'
  );
  const [resolvedBy, setResolvedBy] = useState('Chief Inspector M. Chawla (A&P-440192)');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const partsList = partsUsed.split(',').map(s => s.trim()).filter(Boolean);
      await api.resolveIncident(squawkCase.id, {
        actual_resolution: actualResolution,
        actual_recovery_time_hours: Number(actualRecoveryTimeHours),
        parts_used: partsList,
        root_cause: rootCause,
        delay_minutes: Number(delayMinutes),
        maintenance_team: maintenanceTeam,
        additional_observations: additionalObservations,
        lessons_learned: lessonsLearned,
        resolved_by: resolvedBy
      });

      const updated = await api.getCase(squawkCase.id);
      onResolved(updated);
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      alert('Failed to resolve incident: ' + (err.response?.data?.detail || err.message));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto font-mono">
      <div className="bg-[rgba(26,29,23,0.96)] border-2 border-[rgba(120,150,106,0.5)] rounded-xl w-full max-w-2xl text-[#F7F1E4] shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,210,100,0.2)] bg-[rgba(34,38,30,0.95)]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-[rgba(120,150,106,0.25)] border border-[rgba(120,150,106,0.5)] text-[#A0C49D]">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                  AOG INCIDENT CLOSURE & RESOLUTION
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(120,150,106,0.25)] text-[#A0C49D] border border-[rgba(120,150,106,0.4)] font-bold">
                  {squawkCase.tail_number || 'VT-SQK'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(217,166,46,0.2)] text-[#F0C75E] border border-[rgba(217,166,46,0.4)] font-bold">
                  VAKH ARCHIVE
                </span>
              </div>
              <p className="text-xs text-[#D8D0BD] font-sans mt-0.5">
                Capture final recovery telemetry, root cause, and lessons learned for historical learning
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="text-[#D8D0BD] hover:text-white p-1 rounded hover:bg-[rgba(255,210,100,0.15)] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          <div>
            <label className="block text-xs font-bold text-[#D8D0BD] mb-1">
              ACTUAL RESOLUTION PERFORMED <span className="text-[#C85B43]">*</span>
            </label>
            <textarea
              rows={2}
              value={actualResolution}
              onChange={(e) => setActualResolution(e.target.value)}
              placeholder="Describe maintenance action, testing completed, and airworthiness release..."
              className="w-full bg-[rgba(20,22,17,0.7)] border border-[rgba(255,210,100,0.25)] rounded p-2.5 text-xs text-[#F7F1E4] focus:outline-none focus:border-[#D9A62E] font-sans"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#D8D0BD] mb-1">
                ACTUAL RECOVERY TIME (HOURS) <span className="text-[#C85B43]">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={actualRecoveryTimeHours}
                onChange={(e) => setActualRecoveryTimeHours(Number(e.target.value))}
                className="w-full bg-[rgba(20,22,17,0.7)] border border-[rgba(255,210,100,0.25)] rounded px-3 py-2 text-xs text-[#F7F1E4] focus:outline-none focus:border-[#D9A62E] font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#D8D0BD] mb-1">
                OPERATIONAL DELAY CAUSED (MINUTES)
              </label>
              <input
                type="number"
                value={delayMinutes}
                onChange={(e) => setDelayMinutes(Number(e.target.value))}
                className="w-full bg-[rgba(20,22,17,0.7)] border border-[rgba(255,210,100,0.25)] rounded px-3 py-2 text-xs text-[#F7F1E4] focus:outline-none focus:border-[#D9A62E] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#D8D0BD] mb-1">
              ROOT CAUSE IDENTIFIED <span className="text-[#C85B43]">*</span>
            </label>
            <textarea
              rows={2}
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              placeholder="Primary defect mechanism (e.g. seal fatigue, thermal degradation, electrical short)..."
              className="w-full bg-[rgba(20,22,17,0.7)] border border-[rgba(255,210,100,0.25)] rounded p-2.5 text-xs text-[#F7F1E4] focus:outline-none focus:border-[#D9A62E] font-sans"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#D8D0BD] mb-1">
                PARTS UTILIZED (COMMA-SEPARATED)
              </label>
              <input
                type="text"
                value={partsUsed}
                onChange={(e) => setPartsUsed(e.target.value)}
                placeholder="e.g. HP-2048, O-Ring Seal Kit"
                className="w-full bg-[rgba(20,22,17,0.7)] border border-[rgba(255,210,100,0.25)] rounded px-3 py-2 text-xs text-[#F7F1E4] focus:outline-none focus:border-[#D9A62E] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#D8D0BD] mb-1">
                MAINTENANCE CREW / STATION
              </label>
              <input
                type="text"
                value={maintenanceTeam}
                onChange={(e) => setMaintenanceTeam(e.target.value)}
                placeholder="e.g. DEL Hangar Crew 2"
                className="w-full bg-[rgba(20,22,17,0.7)] border border-[rgba(255,210,100,0.25)] rounded px-3 py-2 text-xs text-[#F7F1E4] focus:outline-none focus:border-[#D9A62E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#D8D0BD] mb-1 flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#F0C75E]" />
              <span>LESSONS LEARNED (SAVED TO HISTORICAL LEARNING ARCHIVE)</span>
            </label>
            <textarea
              rows={2}
              value={lessonsLearned}
              onChange={(e) => setLessonsLearned(e.target.value)}
              placeholder="Insights to prevent recurrence and improve future automated recommendations..."
              className="w-full bg-[rgba(20,22,17,0.7)] border border-[rgba(255,210,100,0.25)] rounded p-2.5 text-xs text-[#F7F1E4] focus:outline-none focus:border-[#D9A62E] font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#D8D0BD] mb-1">
              AUTHORIZED RELEASE SIGNATORY <span className="text-[#C85B43]">*</span>
            </label>
            <input
              type="text"
              value={resolvedBy}
              onChange={(e) => setResolvedBy(e.target.value)}
              placeholder="e.g. Chief Inspector M. Chawla (A&P-440192)"
              className="w-full bg-[rgba(20,22,17,0.7)] border border-[rgba(255,210,100,0.25)] rounded px-3 py-2 text-xs text-[#F7F1E4] focus:outline-none focus:border-[#D9A62E] font-mono"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-[rgba(255,210,100,0.2)]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded bg-[rgba(38,42,34,0.7)] hover:bg-[rgba(52,58,46,0.9)] text-[#D8D0BD] text-xs font-semibold cursor-pointer border border-[rgba(255,210,100,0.25)] transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded bg-gradient-to-r from-[#78966A] to-[#8FA880] hover:from-[#84A575] hover:to-[#9CB78D] text-white text-xs font-bold transition border border-[#9CB78D] flex items-center space-x-2 cursor-pointer disabled:opacity-50 shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'CLOSING INCIDENT...' : 'CONFIRM RESOLUTION & ARCHIVE TO VAKH'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
