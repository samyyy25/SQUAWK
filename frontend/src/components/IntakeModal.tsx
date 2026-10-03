import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Mic, 
  Image as ImageIcon, 
  Send, 
  Plane,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { api } from '../api';
import { SquawkCase, VakhIntakePayload } from '../types';

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
  // Structured Vakh Intake Fields
  const [aircraftRegistration, setAircraftRegistration] = useState('VT-SQK');
  const [aircraftType, setAircraftType] = useState('Boeing 737-800');
  const [operator, setOperator] = useState('Air Indigo Wings');
  const [airport, setAirport] = useState('DEL');
  const [flightNumber, setFlightNumber] = useState('SQ-204');
  const [defectCategory, setDefectCategory] = useState('Hydraulic System / EDP');
  const [defectDescription, setDefectDescription] = useState(
    'Engine vibration reported during climb. Crew observed abnormal vibration indication. Hydraulic System A EDP low pressure warning.'
  );
  const [reportedSymptoms, setReportedSymptoms] = useState(
    'Hydraulic System A pressure dropping below 2,400 PSI on descent; EDP casing hot to touch.'
  );
  const [operationalImpact, setOperationalImpact] = useState(
    'Aircraft grounded at DEL T3 MRO Hangar. Scheduled turnaround flight SQ-205 to BOM held.'
  );
  const [departureTime, setDepartureTime] = useState('3h 20m');
  const [estimatedTimeAvailableHours, setEstimatedTimeAvailableHours] = useState(4.0);
  const [melCdlInfo, setMelCdlInfo] = useState('MEL 29-11-01 Non-deferrable for CAT III operations');
  const [requiredMaintenanceTeam, setRequiredMaintenanceTeam] = useState('Hydraulic Line Specialist');
  const [requiredParts, setRequiredParts] = useState('HP-2048 (Engine-Driven Hydraulic Pump EDP)');
  const [reporterName, setReporterName] = useState('Capt. R. Sharma (Air Indigo Wings)');
  const [contactInformation, setContactInformation] = useState('ops.del@indigoair.in | +91 11 4963 8000');

  // Multi-modal evidence attachments
  const [pdfAttached, setPdfAttached] = useState(true);
  const [imgAttached, setImgAttached] = useState(true);
  const [voiceAttached, setVoiceAttached] = useState(false);

  // Submission pipeline state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pipelineStage, setPipelineStage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      setPipelineStage('Vakh structured intake submitting to operational schema...');
      await new Promise((r) => setTimeout(r, 450));

      setPipelineStage('Generating immutable Vakh submission record and assigning tracking ID...');
      await new Promise((r) => setTimeout(r, 400));

      const vakhPayload: VakhIntakePayload = {
        aircraft_registration: aircraftRegistration,
        aircraft_type: aircraftType,
        operator: operator,
        airport: airport,
        flight_number: flightNumber,
        defect_category: defectCategory,
        defect_description: defectDescription,
        reported_symptoms: reportedSymptoms,
        operational_impact: operationalImpact,
        departure_time: departureTime,
        estimated_time_available_hours: Number(estimatedTimeAvailableHours),
        mel_cdl_info: melCdlInfo,
        required_maintenance_team: requiredMaintenanceTeam,
        required_parts: requiredParts,
        reporter_name: reporterName,
        contact_information: contactInformation
      };

      setPipelineStage('SQUAWK AI analyzing incident: classifying severity, constraints, and recovery options...');
      const createdCase = await api.submitVakhIntake(vakhPayload);

      setPipelineStage('8-step recovery plan generated and synchronized with Vakh operational workspace...');
      await new Promise((r) => setTimeout(r, 400));

      onCaseCreated(createdCase);
      setIsSubmitting(false);
      setPipelineStage(null);
      onClose();
    } catch (err: any) {
      alert('Error during Vakh intake: ' + (err.response?.data?.detail || err.message));
      setIsSubmitting(false);
      setPipelineStage(null);
    }
  };

  const loadVtSqkPreset = () => {
    setAircraftRegistration('VT-SQK');
    setAircraftType('Boeing 737-800');
    setOperator('Air Indigo Wings');
    setAirport('DEL');
    setFlightNumber('SQ-204');
    setDefectCategory('Hydraulic System / EDP');
    setDefectDescription('Engine vibration reported during climb. Crew observed abnormal vibration indication. Hydraulic System A EDP low pressure warning.');
    setReportedSymptoms('Hydraulic System A pressure dropping below 2,400 PSI on descent; EDP casing hot to touch.');
    setOperationalImpact('Aircraft grounded at DEL T3 MRO Hangar. Scheduled turnaround flight SQ-205 to BOM held.');
    setDepartureTime('3h 20m');
    setEstimatedTimeAvailableHours(4.0);
    setMelCdlInfo('MEL 29-11-01 Non-deferrable for CAT III operations');
    setRequiredMaintenanceTeam('Hydraulic Line Specialist');
    setRequiredParts('HP-2048 (Engine-Driven Hydraulic Pump EDP)');
    setReporterName('Capt. R. Sharma (Air Indigo Wings)');
    setContactInformation('ops.del@indigoair.in | +91 11 4963 8000');
    setPdfAttached(true);
    setImgAttached(true);
    setVoiceAttached(false);
  };

  const loadHeroPreset = () => {
    setAircraftRegistration('N42Q');
    setAircraftType('Boeing 737-800');
    setOperator('Skyline Airways');
    setAirport('ORD');
    setFlightNumber('SK-442');
    setDefectCategory('Hydraulic Power (ATA 29)');
    setDefectDescription('System A Engine-Driven Hydraulic Pump low pressure warning on gate arrival. Metal contamination check clear. Requires replacement EDP pump assembly.');
    setReportedSymptoms('Intermittent EDP low pressure caution light during taxi.');
    setOperationalImpact('Grounded at ORD Terminal 1 Gate B8. Turnaround flight to DFW delayed.');
    setDepartureTime('2h 45m');
    setEstimatedTimeAvailableHours(3.5);
    setMelCdlInfo('MEL 29-10-01 EDP System A Inoperative - No Go');
    setRequiredMaintenanceTeam('ORD Line Maintenance Crew 4');
    setRequiredParts('HYD-PUMP-2901');
    setReporterName('Lead Tech D. Evans');
    setContactInformation('techops.ord@skyline.aero | +1 773 555 0192');
    setPdfAttached(true);
    setImgAttached(false);
    setVoiceAttached(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto font-mono">
      <div className="bg-[rgba(26,29,23,0.96)] border-2 border-[rgba(255,210,100,0.4)] rounded-xl w-full max-w-3xl text-[#F7F1E4] shadow-2xl overflow-hidden my-6">
        
        {/* Header with Vakh Integration Indicator */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,210,100,0.2)] bg-[rgba(34,38,30,0.95)]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-[rgba(217,166,46,0.2)] border border-[#D9A62E] text-[#F0C75E]">
              <Plane className="w-5 h-5 -rotate-45" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wide">
                  AOG INCIDENT INTAKE CONSOLE
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(217,166,46,0.18)] text-[#F0C75E] border border-[rgba(217,166,46,0.4)] flex items-center space-x-1 font-bold">
                  <span>Powered by Vakh</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[rgba(38,42,34,0.7)] text-[#D8D0BD] border border-[rgba(255,210,100,0.25)]">
                  DISPATCH MODE
                </span>
              </div>
              <p className="text-xs text-[#D8D0BD] font-sans mt-0.5">
                Vakh structured operational intake · Feeds directly into SQUAWK AI recovery pipeline
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

        {/* Quick Presets Bar */}
        <div className="px-6 py-2.5 bg-[rgba(20,22,17,0.75)] border-b border-[rgba(255,210,100,0.15)] flex items-center justify-between text-xs">
          <span className="text-[#D8D0BD] font-bold flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#F0C75E]" />
            <span>QUICK PRESETS:</span>
          </span>
          <div className="flex items-center space-x-2">
            <button 
              type="button" 
              onClick={loadVtSqkPreset}
              className="px-2.5 py-1 rounded bg-gradient-to-r from-[#D9A62E] to-[#F0C75E] text-[#252820] border border-[#F0C75E] transition font-bold text-[11px] cursor-pointer shadow-sm"
            >
              ⭐ VT-SQK · DEL (Flagship Hero AOG)
            </button>
            <button 
              type="button" 
              onClick={loadHeroPreset}
              className="px-2.5 py-1 rounded bg-[rgba(38,42,34,0.7)] hover:bg-[rgba(52,58,46,0.9)] text-[#D8D0BD] hover:text-white border border-[rgba(255,210,100,0.25)] transition font-medium text-[11px] cursor-pointer"
            >
              ✈️ N42Q · ORD (Hydraulic AOG)
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Section: Aircraft & Location Info */}
          <div>
            <span className="text-[10px] font-bold text-[#F0C75E] uppercase tracking-wider block mb-2">
              1. AIRCRAFT & FLIGHT TELEMETRY (VAKH STRUCTURED RECORD)
            </span>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#D8D0BD] mb-1">
                  REGISTRATION <span className="text-[#C85B43]">*</span>
                </label>
                <input 
                  type="text" 
                  value={aircraftRegistration}
                  onChange={(e) => setAircraftRegistration(e.target.value)}
                  placeholder="e.g. VT-SQK"
                  className="w-full bg-[rgba(20,22,17,0.7)] border border-[rgba(255,210,100,0.25)] rounded px-2.5 py-1.5 text-xs text-[#F7F1E4] focus:outline-none focus:border-[#D9A62E] font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#D8D0BD] mb-1">
                  AIRCRAFT MODEL <span className="text-[#C85B43]">*</span>
                </label>
                <input 
                  type="text" 
                  value={aircraftType}
                  onChange={(e) => setAircraftType(e.target.value)}
                  placeholder="e.g. Boeing 737-800"
                  className="w-full bg-[rgba(20,22,17,0.7)] border border-[rgba(255,210,100,0.25)] rounded px-2.5 py-1.5 text-xs text-[#F7F1E4] focus:outline-none focus:border-[#D9A62E]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#D8D0BD] mb-1">
                  OPERATOR / AIRLINE
                </label>
                <input 
                  type="text" 
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  placeholder="e.g. Air Indigo Wings"
                  className="w-full bg-[rgba(20,22,17,0.7)] border border-[rgba(255,210,100,0.25)] rounded px-2.5 py-1.5 text-xs text-[#F7F1E4] focus:outline-none focus:border-[#D9A62E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#D8D0BD] mb-1">
                  LOCATION (IATA) <span className="text-[#C85B43]">*</span>
                </label>
                <input 
                  type="text" 
                  value={airport}
                  onChange={(e) => setAirport(e.target.value)}
                  placeholder="e.g. DEL"
                  className="w-full bg-[rgba(20,22,17,0.7)] border border-[rgba(255,210,100,0.25)] rounded px-2.5 py-1.5 text-xs text-[#F7F1E4] focus:outline-none focus:border-[#D9A62E] font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[#D8D0BD] mb-1">
                  FLIGHT NUMBER
                </label>
                <input 
                  type="text" 
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                  placeholder="e.g. SQ-204"
                  className="w-full bg-[rgba(20,22,17,0.7)] border border-[rgba(255,210,100,0.25)] rounded px-2.5 py-1.5 text-xs text-[#F7F1E4] focus:outline-none focus:border-[#D9A62E] font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#D8D0BD] mb-1">
                  TIME TO DEPARTURE
                </label>
                <input 
                  type="text" 
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  placeholder="e.g. 3h 20m"
                  className="w-full bg-[rgba(20,22,17,0.7)] border border-[rgba(255,210,100,0.25)] rounded px-2.5 py-1.5 text-xs text-[#F7F1E4] focus:outline-none focus:border-[#D9A62E] font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#D8D0BD] mb-1">
                  HOURS AVAILABLE
                </label>
                <input 
                  type="number" 
                  step="0.5"
                  value={estimatedTimeAvailableHours}
                  onChange={(e) => setEstimatedTimeAvailableHours(Number(e.target.value))}
                  placeholder="4.0"
                  className="w-full bg-[rgba(20,22,17,0.7)] border border-[rgba(255,210,100,0.25)] rounded px-2.5 py-1.5 text-xs text-[#F7F1E4] focus:outline-none focus:border-[#D9A62E] font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section: Defect & Operational Impact */}
          <div className="pt-3 border-t border-[rgba(255,210,100,0.2)]">
            <span className="text-[10px] font-bold text-[#F0C75E] uppercase tracking-wider block mb-2">
              2. DEFECT DETAILS & OPERATIONAL IMPACT
            </span>
            <div className="grid grid-cols-2 gap-3 mb-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[#D8D0BD] mb-1">
                  DEFECT CATEGORY <span className="text-[#C85B43]">*</span>
                </label>
                <input 
                  type="text" 
                  value={defectCategory}
                  onChange={(e) => setDefectCategory(e.target.value)}
                  placeholder="e.g. Hydraulic System / EDP"
                  className="w-full bg-[rgba(20,22,17,0.7)] border border-[rgba(255,210,100,0.25)] rounded px-2.5 py-1.5 text-xs text-[#F7F1E4] focus:outline-none focus:border-[#D9A62E]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#D8D0BD] mb-1">
                  MEL / CDL PROVISION
                </label>
                <input 
                  type="text" 
                  value={melCdlInfo}
                  onChange={(e) => setMelCdlInfo(e.target.value)}
                  placeholder="e.g. MEL 29-11-01 Non-deferrable"
                  className="w-full bg-[rgba(20,22,17,0.7)] border border-[rgba(255,210,100,0.25)] rounded px-2.5 py-1.5 text-xs text-[#F7F1E4] focus:outline-none focus:border-[#D9A62E] font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-bold text-[#D8D0BD] mb-1">
                  DEFECT DESCRIPTION <span className="text-[#C85B43]">*</span>
                </label>
                <textarea 
                  rows={2}
                  value={defectDescription}
                  onChange={(e) => setDefectDescription(e.target.value)}
                  placeholder="Describe pilot squawk, CMC error code, or inspection findings..."
                  className="w-full bg-[rgba(20,22,17,0.7)] border border-[rgba(255,210,100,0.25)] rounded p-2.5 text-xs text-[#F7F1E4] focus:outline-none focus:border-[#D9A62E] font-sans"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#D8D0BD] mb-1">
                    REPORTED SYMPTOMS
                  </label>
                  <input 
                    type="text" 
                    value={reportedSymptoms}
                    onChange={(e) => setReportedSymptoms(e.target.value)}
                    placeholder="e.g. EDP casing hot, pressure below 2,400 PSI"
                    className="w-full bg-[rgba(20,22,17,0.7)] border border-[rgba(255,210,100,0.25)] rounded px-2.5 py-1.5 text-xs text-[#F7F1E4] focus:outline-none focus:border-[#D9A62E] font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#D8D0BD] mb-1">
                    OPERATIONAL IMPACT
                  </label>
                  <input 
                    type="text" 
                    value={operationalImpact}
                    onChange={(e) => setOperationalImpact(e.target.value)}
                    placeholder="e.g. Flight held at gate, 160 pax impacted"
                    className="w-full bg-[rgba(20,22,17,0.7)] border border-[rgba(255,210,100,0.25)] rounded px-2.5 py-1.5 text-xs text-[#F7F1E4] focus:outline-none focus:border-[#D9A62E] font-sans"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Maintenance & Resources */}
          <div className="pt-3 border-t border-[rgba(255,210,100,0.2)]">
            <span className="text-[10px] font-bold text-[#F0C75E] uppercase tracking-wider block mb-2">
              3. MAINTENANCE REQUIREMENTS & CONTACT
            </span>
            <div className="grid grid-cols-2 gap-3 mb-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[#D8D0BD] mb-1">
                  REQUIRED MAINTENANCE TEAM
                </label>
                <input 
                  type="text" 
                  value={requiredMaintenanceTeam}
                  onChange={(e) => setRequiredMaintenanceTeam(e.target.value)}
                  placeholder="e.g. Hydraulic Line Specialist"
                  className="w-full bg-[rgba(20,22,17,0.7)] border border-[rgba(255,210,100,0.25)] rounded px-2.5 py-1.5 text-xs text-[#F7F1E4] focus:outline-none focus:border-[#D9A62E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#D8D0BD] mb-1">
                  REQUIRED PART(S) IF KNOWN
                </label>
                <input 
                  type="text" 
                  value={requiredParts}
                  onChange={(e) => setRequiredParts(e.target.value)}
                  placeholder="e.g. HP-2048 (EDP Assembly)"
                  className="w-full bg-[rgba(20,22,17,0.7)] border border-[rgba(255,210,100,0.25)] rounded px-2.5 py-1.5 text-xs text-[#F7F1E4] focus:outline-none focus:border-[#D9A62E] font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#D8D0BD] mb-1">
                  REPORTER NAME / ROLE <span className="text-[#C85B43]">*</span>
                </label>
                <input 
                  type="text" 
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="e.g. Capt. R. Sharma"
                  className="w-full bg-[rgba(20,22,17,0.7)] border border-[rgba(255,210,100,0.25)] rounded px-2.5 py-1.5 text-xs text-[#F7F1E4] focus:outline-none focus:border-[#D9A62E]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#D8D0BD] mb-1">
                  CONTACT INFORMATION <span className="text-[#C85B43]">*</span>
                </label>
                <input 
                  type="text" 
                  value={contactInformation}
                  onChange={(e) => setContactInformation(e.target.value)}
                  placeholder="ops.del@indigoair.in | +91 11 4963 8000"
                  className="w-full bg-[rgba(20,22,17,0.7)] border border-[rgba(255,210,100,0.25)] rounded px-2.5 py-1.5 text-xs text-[#F7F1E4] focus:outline-none focus:border-[#D9A62E] font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section: Evidence Attachments */}
          <div className="p-3 bg-[rgba(20,22,17,0.6)] border border-[rgba(255,210,100,0.2)] rounded space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#D8D0BD] uppercase tracking-wider block">
                ATTACHED OPERATIONAL TELEMETRY & EVIDENCE (VAKH ATTACHMENTS)
              </span>
              <span className="text-[10px] text-[#F0C75E]">Synced to Vakh Record</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPdfAttached(!pdfAttached)}
                className={`p-2 rounded border flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                  pdfAttached ? 'bg-[rgba(217,166,46,0.2)] border-[#D9A62E] text-[#F0C75E] font-bold' : 'bg-[rgba(26,29,23,0.7)] border-[rgba(255,210,100,0.2)] text-[#D8D0BD]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Tech Log PDF {pdfAttached ? '✓' : '+'}</span>
              </button>

              <button
                type="button"
                onClick={() => setImgAttached(!imgAttached)}
                className={`p-2 rounded border flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                  imgAttached ? 'bg-[rgba(217,166,46,0.2)] border-[#D9A62E] text-[#F0C75E] font-bold' : 'bg-[rgba(26,29,23,0.7)] border-[rgba(255,210,100,0.2)] text-[#D8D0BD]'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Damage Photo {imgAttached ? '✓' : '+'}</span>
              </button>

              <button
                type="button"
                onClick={() => setVoiceAttached(!voiceAttached)}
                className={`p-2 rounded border flex items-center justify-center space-x-1.5 transition cursor-pointer ${
                  voiceAttached ? 'bg-[rgba(217,166,46,0.2)] border-[#D9A62E] text-[#F0C75E] font-bold' : 'bg-[rgba(26,29,23,0.7)] border-[rgba(255,210,100,0.2)] text-[#D8D0BD]'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Pilot Audio {voiceAttached ? '✓' : '+'}</span>
              </button>
            </div>
          </div>

          {/* Progress / Pipeline Status Banner */}
          {pipelineStage && (
            <div className="p-3 bg-[rgba(38,42,34,0.95)] border border-[#D9A62E] rounded space-y-1">
              <div className="flex items-center space-x-2 text-white text-xs font-bold">
                <Sparkles className="w-4 h-4 text-[#F0C75E] animate-spin" />
                <span>Vakh ↔ SQUAWK Orchestration Pipeline Active</span>
              </div>
              <div className="text-[11px] text-[#F0C75E]">{pipelineStage}</div>
            </div>
          )}

          {/* Primary CTA Buttons */}
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
              className="px-6 py-2.5 rounded bg-gradient-to-r from-[#D9A62E] to-[#F0C75E] hover:from-[#E2B139] hover:to-[#F7D475] text-[#252820] text-xs font-bold transition border border-[#F0C75E] flex items-center space-x-2 cursor-pointer disabled:opacity-50 shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-[#252820]" />
                  <span>ORCHESTRATING RECOVERY...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>SUBMIT VAKH INTAKE & ORCHESTRATE</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
