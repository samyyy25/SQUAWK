import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  Mic, 
  Image as ImageIcon, 
  Send, 
  AlertTriangle,
  Plane,
  Sparkles,
  CheckCircle2,
  Clock
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
  const [tailNumber, setTailNumber] = useState('N42Q');
  const [aircraftType, setAircraftType] = useState('Boeing 737-800');
  const [defectDescription, setDefectDescription] = useState(
    'System A Engine-Driven Hydraulic Pump low pressure warning on gate arrival. Metal contamination check clear. Requires replacement EDP pump assembly before flight dispatch.'
  );
  const [ataChapter, setAtaChapter] = useState('29 - Hydraulic Power');
  const [partNumber, setPartNumber] = useState('HYD-PUMP-2901');
  const [partName, setPartName] = useState('Engine-Driven Hydraulic Pump EDP');
  const [priority, setPriority] = useState<'AOG' | 'URGENT' | 'ROUTINE'>('AOG');
  const [location, setLocation] = useState('ORD');
  
  // Mixed media simulation states
  const [pdfAttached, setPdfAttached] = useState(false);
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

      setPipelineStage('RocketRide pipeline started: ingest_squawk.pipe running...');
      await new Promise((r) => setTimeout(r, 700));

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
    setDefectDescription('System A Engine-Driven Hydraulic Pump low pressure warning. EDP rotable replacement required before passenger flight dispatch.');
    setAtaChapter('29 - Hydraulic Power');
    setPartNumber('HP-2048');
    setPartName('Engine-Driven Hydraulic Pump EDP');
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

  const loadMalformedPreset = () => {
    setTailNumber('');
    setAircraftType('Airbus A320');
    setDefectDescription('Radio crackle during taxi. Unknown tail number parked at gate.');
    setAtaChapter('23 - Communications');
    setPartNumber('');
    setPartName('');
    setPriority('URGENT');
    setLocation('ATL');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-2xl text-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#111c33]">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>AOG Maintenance Case Intake</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  Webhook / Mixed Media
                </span>
              </h2>
              <p className="text-xs text-slate-400">Ingest defect report into RocketRide multi-agent orchestration pipeline</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="px-6 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">Quick Test Case Presets:</span>
          <div className="flex items-center space-x-2">
            <button 
              type="button" 
              onClick={loadVtSqkPreset}
              className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 transition font-medium text-[11px]"
            >
              ⭐ VT-SQK (Delhi AOG)
            </button>
            <button 
              type="button" 
              onClick={loadHeroPreset}
              className="px-2.5 py-1 rounded bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-800 transition font-medium text-[11px]"
            >
              ✈️ N42Q (ORD AOG)
            </button>
            <button 
              type="button" 
              onClick={loadMalformedPreset}
              className="px-2.5 py-1 rounded bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 transition font-medium text-[11px]"
            >
              ⚠️ Malformed (Missing Tail)
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Aircraft Tail Number <span className="text-red-400">*</span>
              </label>
              <input 
                type="text" 
                value={tailNumber}
                onChange={(e) => setTailNumber(e.target.value)}
                placeholder="e.g. N42Q"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Aircraft Model / Type
              </label>
              <input 
                type="text" 
                value={aircraftType}
                onChange={(e) => setAircraftType(e.target.value)}
                placeholder="e.g. Boeing 737-800"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Defect Description <span className="text-red-400">*</span>
            </label>
            <textarea 
              rows={3}
              value={defectDescription}
              onChange={(e) => setDefectDescription(e.target.value)}
              placeholder="Describe pilot squawk, CMC error code, or inspection findings..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ATA Chapter
              </label>
              <input 
                type="text" 
                value={ataChapter}
                onChange={(e) => setAtaChapter(e.target.value)}
                placeholder="e.g. 29 - Hydraulic Power"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Part Number (IPC)
              </label>
              <input 
                type="text" 
                value={partNumber}
                onChange={(e) => setPartNumber(e.target.value)}
                placeholder="e.g. HYD-PUMP-2901"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Current Location (IATA)
              </label>
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. ORD"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Priority Level
              </label>
              <select 
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full bg-[#14161a] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="AOG">🔴 AOG (Aircraft On Ground)</option>
                <option value="URGENT">🟡 URGENT (Line Station)</option>
                <option value="ROUTINE">🟢 ROUTINE (Scheduled)</option>
              </select>
            </div>
          </div>

          {/* Optional Attachments / Multi-Modal Evidence */}
          <div className="p-3 bg-[#111317] border border-slate-800 rounded-xl space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Optional Multi-Modal Ingestion Evidence
            </span>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPdfAttached(!pdfAttached)}
                className={`p-2 rounded-lg border flex items-center justify-center space-x-1.5 transition ${
                  pdfAttached ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Tech Log PDF {pdfAttached ? '✓' : '+'}</span>
              </button>

              <button
                type="button"
                onClick={() => setImgAttached(!imgAttached)}
                className={`p-2 rounded-lg border flex items-center justify-center space-x-1.5 transition ${
                  imgAttached ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Damage Photo {imgAttached ? '✓' : '+'}</span>
              </button>

              <button
                type="button"
                onClick={() => setVoiceAttached(!voiceAttached)}
                className={`p-2 rounded-lg border flex items-center justify-center space-x-1.5 transition ${
                  voiceAttached ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Pilot Audio {voiceAttached ? '✓' : '+'}</span>
              </button>
            </div>
          </div>

          {/* Progress / Pipeline Status Banner */}
          {pipelineStage && (
            <div className="p-3.5 bg-cyan-950/60 border border-cyan-800/80 rounded-xl space-y-1 animate-pulse">
              <div className="flex items-center space-x-2 text-cyan-300 text-xs font-bold font-mono">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>RocketRide Pipeline Active</span>
              </div>
              <div className="text-[11px] text-cyan-200 font-mono">{pipelineStage}</div>
            </div>
          )}

          {/* Primary CTA Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-cyan-500 hover:from-red-500 hover:to-cyan-400 text-white text-xs font-black transition shadow-lg shadow-red-950/50 flex items-center space-x-2 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>INITIALIZING ROCKETRIDE PIPELINE...</span>
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
