import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Mic, 
  Image as ImageIcon, 
  Send, 
  Plane,
  Sparkles
} from 'lucide-react';
import { api } from '../api';
import { SquawkCase } from '../types';

interface IntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaseCreated: (createdCase: SquawkCase) => void;
}

export const IntakeModal: React.FC<IntakeModalProps> = ({
  isOpen,
  onClose,
  onCaseCreated
}) => {
  const [tailNumber, setTailNumber] = useState('VT-SQK');
  const [aircraftType, setAircraftType] = useState('Boeing 737-800');
  const [defectDescription, setDefectDescription] = useState(
    'Engine vibration reported during climb. Crew observed abnormal vibration indication. Aircraft grounded at DEL Terminal 3 MRO Hangar.'
  );
  const [ataChapter, setAtaChapter] = useState('72 - Engine / Propulsion');
  const [partNumber, setPartNumber] = useState('HP-2048');
  const [partName, setPartName] = useState('Vibration Sensor / Hydraulic Assembly');
  const [priority, setPriority] = useState<'AOG' | 'URGENT' | 'ROUTINE'>('AOG');
  const [location, setLocation] = useState('DEL');
  
  // Mixed media simulation states
  const [pdfAttached, setPdfAttached] = useState(true);
  const [imgAttached, setImgAttached] = useState(false);
  const [voiceAttached, setVoiceAttached] = useState(false);

  // Workflow progress simulation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pipelineStage, setPipelineStage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      setPipelineStage('Case received. Ingesting raw maintenance payload...');
      await new Promise((r) => setTimeout(r, 600));

      setPipelineStage('Parsing structured fields, documents, and memory context...');
      await new Promise((r) => setTimeout(r, 600));

      const payload = {
        tail_number: tailNumber,
        aircraft_type: aircraftType,
        defect_description: defectDescription,
        ata_chapter: ataChapter,
        part_number: partNumber,
        part_name: partName,
        priority: priority,
        location: location,
        raw_intake_payload: {
          source: 'AOG Control Center Webhook / Portal',
          pdf_attached: pdfAttached,
          img_attached: imgAttached,
          voice_attached: voiceAttached,
          logged_at: new Date().toISOString()
        }
      };

      const newCase = await api.createCase(payload);
      setPipelineStage('Executing Parallel AI Specialists (Sourcing, Docs, Logistics)...');
      await new Promise((r) => setTimeout(r, 700));

      onCaseCreated(newCase);
      setIsSubmitting(false);
      setPipelineStage(null);
      onClose();
    } catch (err: any) {
      alert('Error creating case: ' + (err.response?.data?.detail || err.message));
      setIsSubmitting(false);
      setPipelineStage(null);
    }
  };

  const loadVtSqkPreset = () => {
    setTailNumber('VT-SQK');
    setAircraftType('Boeing 737-800');
    setDefectDescription('Engine vibration reported during climb. Crew observed abnormal vibration indication. Aircraft grounded at DEL Terminal 3 MRO Hangar.');
    setAtaChapter('72 - Engine / Propulsion');
    setPartNumber('HP-2048');
    setPartName('Engine Vibration Sensor / EDP Rotable');
    setPriority('AOG');
    setLocation('DEL');
    setPdfAttached(true);
  };

  const loadHeroPreset = () => {
    setTailNumber('N42Q');
    setAircraftType('Boeing 737-800');
    setDefectDescription('System A Engine-Driven Hydraulic Pump low pressure warning on gate arrival. Metal contamination check clear. Requires replacement EDP pump assembly before flight dispatch.');
    setAtaChapter('29 - Hydraulic Power');
    setPartNumber('HYD-PUMP-2901');
    setPartName('Engine-Driven Hydraulic Pump EDP');
    setPriority('AOG');
    setLocation('ORD');
    setPdfAttached(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 overflow-y-auto font-mono">
      <div className="bg-[#000000] border-2 border-[#830000] rounded-xl w-full max-w-2xl text-neutral-200 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E1E1E] bg-[#080808]">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded bg-[#0D0D0D] border border-[#830000] text-[#BC0202]">
              <Plane className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2 uppercase tracking-wide">
                <span>AOG MAINTENANCE SQUAWK INTAKE</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#000000] text-[#BC0202] border border-[#830000]">
                  DISPATCH CONSOLE
                </span>
              </h2>
              <p className="text-xs text-neutral-400 font-sans mt-0.5">Ingest defect report into multi-agent orchestration pipeline</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="text-neutral-400 hover:text-white p-1 rounded hover:bg-[#0D0D0D] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="px-6 py-2 bg-[#080808] border-b border-[#1E1E1E] flex items-center justify-between text-xs">
          <span className="text-neutral-400 font-bold">PRESETS:</span>
          <div className="flex items-center space-x-2">
            <button 
              type="button" 
              onClick={loadVtSqkPreset}
              className="px-2.5 py-1 rounded bg-[#830000] hover:bg-[#BC0202] text-white border border-[#BC0202] transition font-bold text-[11px] cursor-pointer"
            >
              ⭐ VT-SQK (DELHI HERO AOG)
            </button>
            <button 
              type="button" 
              onClick={loadHeroPreset}
              className="px-2.5 py-1 rounded bg-[#0D0D0D] hover:bg-[#830000]/40 text-neutral-300 hover:text-white border border-[#1E1E1E] transition font-medium text-[11px] cursor-pointer"
            >
              ✈️ N42Q (ORD AOG)
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                AIRCRAFT REGISTRATION <span className="text-[#FF0000]">*</span>
              </label>
              <input 
                type="text" 
                value={tailNumber}
                onChange={(e) => setTailNumber(e.target.value)}
                placeholder="e.g. VT-SQK"
                className="w-full bg-[#080808] border border-[#1E1E1E] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#830000] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                AIRCRAFT MODEL / TYPE
              </label>
              <input 
                type="text" 
                value={aircraftType}
                onChange={(e) => setAircraftType(e.target.value)}
                placeholder="e.g. Boeing 737-800"
                className="w-full bg-[#080808] border border-[#1E1E1E] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#830000]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">
              DEFECT DESCRIPTION <span className="text-[#FF0000]">*</span>
            </label>
            <textarea 
              rows={3}
              value={defectDescription}
              onChange={(e) => setDefectDescription(e.target.value)}
              placeholder="Describe pilot squawk, CMC error code, or inspection findings..."
              className="w-full bg-[#080808] border border-[#1E1E1E] rounded p-3 text-xs text-white focus:outline-none focus:border-[#830000] font-sans"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                ATA CHAPTER
              </label>
              <input 
                type="text" 
                value={ataChapter}
                onChange={(e) => setAtaChapter(e.target.value)}
                placeholder="e.g. 72 - Engine"
                className="w-full bg-[#080808] border border-[#1E1E1E] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#830000]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                PART NUMBER (IPC)
              </label>
              <input 
                type="text" 
                value={partNumber}
                onChange={(e) => setPartNumber(e.target.value)}
                placeholder="e.g. HP-2048"
                className="w-full bg-[#080808] border border-[#1E1E1E] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#830000] font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                STATION (IATA)
              </label>
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. DEL"
                className="w-full bg-[#080808] border border-[#1E1E1E] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#830000] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                OPERATIONAL PRIORITY
              </label>
              <select 
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full bg-[#080808] border border-[#1E1E1E] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#830000]"
              >
                <option value="AOG">🔴 AOG (AIRCRAFT ON GROUND)</option>
                <option value="URGENT">🟡 URGENT (LINE STATION)</option>
                <option value="ROUTINE">🟢 ROUTINE (SCHEDULED)</option>
              </select>
            </div>
          </div>

          {/* Optional Attachments / Multi-Modal Evidence */}
          <div className="p-3 bg-[#080808] border border-[#1E1E1E] rounded space-y-2">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
              ATTACHED OPERATIONAL TELEMETRY
            </span>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPdfAttached(!pdfAttached)}
                className={`p-2 rounded border flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                  pdfAttached ? 'bg-[#830000] border-[#BC0202] text-white' : 'bg-[#000000] border-[#1E1E1E] text-neutral-400'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Tech Log PDF {pdfAttached ? '✓' : '+'}</span>
              </button>

              <button
                type="button"
                onClick={() => setImgAttached(!imgAttached)}
                className={`p-2 rounded border flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                  imgAttached ? 'bg-[#830000] border-[#BC0202] text-white' : 'bg-[#000000] border-[#1E1E1E] text-neutral-400'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Damage Photo {imgAttached ? '✓' : '+'}</span>
              </button>

              <button
                type="button"
                onClick={() => setVoiceAttached(!voiceAttached)}
                className={`p-2 rounded border flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                  voiceAttached ? 'bg-[#830000] border-[#BC0202] text-white' : 'bg-[#000000] border-[#1E1E1E] text-neutral-400'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Pilot Audio {voiceAttached ? '✓' : '+'}</span>
              </button>
            </div>
          </div>

          {/* Progress / Pipeline Status Banner */}
          {pipelineStage && (
            <div className="p-3 bg-[#080808] border border-[#830000] rounded space-y-1">
              <div className="flex items-center space-x-2 text-white text-xs font-bold">
                <Sparkles className="w-4 h-4 text-[#BC0202] animate-spin" />
                <span>AI Orchestrator Active</span>
              </div>
              <div className="text-[11px] text-neutral-300">{pipelineStage}</div>
            </div>
          )}

          {/* Primary CTA Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-[#1E1E1E]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded bg-[#080808] hover:bg-[#0D0D0D] text-neutral-300 text-xs font-semibold cursor-pointer border border-[#1E1E1E]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded bg-[#830000] hover:bg-[#BC0202] text-white text-xs font-bold transition border border-[#BC0202] flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>INITIALIZING ORCHESTRATION...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>START SQUAWK RECOVERY</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
