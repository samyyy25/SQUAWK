import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  CheckCircle2, 
  Cpu, 
  Check, 
  AlertTriangle, 
  ArrowRight,
  Plane,
  AlertCircle,
  FileCheck2,
  Boxes,
  Users
} from 'lucide-react';
import { SquawkCase } from '../types';
import { FlightRecoveryMap } from './FlightRecoveryMap';
import { HumanApprovalModal } from './HumanApprovalModal';
import { api } from '../api';

interface DashboardOverviewProps {
  cases: SquawkCase[];
  onSelectCase?: (caseItem: SquawkCase) => void;
  onOpenIntake?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  cases,
  onSelectCase
}) => {
  const heroCase = cases.find(c => c.tail_number === 'VT-SQK' || c.id === 'CASE-SQK-2048') || cases[0];
  const [activeCase, setActiveCase] = useState<SquawkCase | null>(heroCase || null);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoStep, setDemoStep] = useState<number>(0);

  useEffect(() => {
    if (heroCase && (!activeCase || activeCase.id !== heroCase.id)) {
      setActiveCase(heroCase);
    }
  }, [cases, heroCase]);

  // Demo Runner: Fully automated sequence with live backend mutation
  const runAogRecoveryDemo = async () => {
    if (!activeCase) return;
    setDemoRunning(true);
    setDemoStep(1);

    try {
      // Step 1: Reset database baseline
      await api.resetDemo();
      let cur = await api.getCase('CASE-SQK-2048');
      setActiveCase(cur);
      setDemoStep(2);
      await new Promise(r => setTimeout(r, 1200));

      // Step 2: Approve initial plan
      setDemoStep(3);
      cur = await api.approveCase(cur.id, {
        approver_name: 'Lead Engineer (MCC Delhi)',
        approver_license: 'A&P-884920',
        decision: 'APPROVED',
        notes: 'Authorized initial AeroParts Singapore recovery plan.'
      });
      setActiveCase(cur);
      await new Promise(r => setTimeout(r, 1400));

      // Step 3: Trigger Controlled Disruption (Stockout)
      setDemoStep(4);
      await api.simulateDisruption(cur.id, 'SUPPLIER_STOCKOUT');
      cur = await api.getCase(cur.id);
      setActiveCase(cur);
      await new Promise(r => setTimeout(r, 1600));

      // Step 4: Autonomous Replan
      setDemoStep(5);
      await api.replanRecovery(cur.id);
      cur = await api.getCase(cur.id);
      setActiveCase(cur);
      await new Promise(r => setTimeout(r, 1600));

      // Step 5: Verify 7/7 constraints & issue digital recovery certificate
      setDemoStep(6);
      await api.verifyRecovery(cur.id);
      cur = await api.getCase(cur.id);
      setActiveCase(cur);
      await new Promise(r => setTimeout(r, 1200));

      // Step 6: Engineer Approves Replanned Recovery
      setDemoStep(7);
      cur = await api.approveCase(cur.id, {
        approver_name: 'Lead Engineer (MCC Delhi)',
        approver_license: 'A&P-884920',
        decision: 'APPROVED',
        notes: 'Authorized replanned recovery with SkySupply Global Mumbai (4.5h ETA).'
      });
      setActiveCase(cur);
      setDemoStep(8);
    } catch (err) {
      console.error('Demo execution error:', err);
    } finally {
      setDemoRunning(false);
    }
  };

  const resetScenario = async () => {
    try {
      await api.resetDemo();
      const fresh = await api.getCase('CASE-SQK-2048');
      setActiveCase(fresh);
      setDemoStep(0);
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  const isVerified = (activeCase?.verification_report !== null && activeCase?.verification_report !== undefined) || demoStep >= 6;
  const isDisrupted = (activeCase?.disruptions_log && activeCase.disruptions_log.length > 0) || demoStep >= 4;

  return (
    <div className="space-y-4 font-sans text-[#252820] min-h-full">
      
      {/* Aviation Hero Tagline from Reference Image */}
      <div className="pt-1 pb-1">
        <h1 className="text-xl md:text-2xl font-black font-mono tracking-tight text-[#252820] drop-shadow-sm">
          FROM DEFECT REPORT TO RECOVERY PLAN —
        </h1>
        <div className="text-xs md:text-sm font-bold font-mono tracking-wider text-[#A87813] mt-0.5">
          BEFORE THE CLOCK GETS EXPENSIVE.
        </div>
      </div>

      {/* 1. SQUAWK AOG STATUS HERO CARD (Cockpit Command Center Styling) */}
      <div className="w-full bg-[rgba(30,33,26,0.85)] backdrop-blur-xl border border-[rgba(255,210,100,0.3)] rounded-xl p-4 shadow-2xl relative overflow-hidden text-[#F7F1E4]">
        {/* Warm golden background glow */}
        <div className="absolute top-0 right-0 w-96 h-32 bg-[rgba(217,166,46,0.12)] blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          
          {/* Left AOG Metadata */}
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Critical AOG Indicator Badge */}
            <div className="px-3 py-2 rounded bg-[rgba(200,91,67,0.18)] border border-[#C85B43] flex items-center space-x-2 shrink-0 shadow-md">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C85B43] animate-pulse shadow-[0_0_8px_#C85B43]"></span>
              <span className="text-xs font-mono font-black text-[#F0856E] tracking-widest">
                AOG ACTIVE
              </span>
            </div>

            {/* Aircraft Reg & Type */}
            <div className="pr-4 border-r border-[rgba(255,210,100,0.2)]">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-mono font-black text-white tracking-wider">VT-SQK</span>
                <span className="px-2 py-0.5 rounded bg-[#D9A62E] text-[#252820] text-[10px] font-mono font-bold shadow-sm">
                  737-800
                </span>
              </div>
              <div className="text-[11px] text-[#D8D0BD] font-mono mt-0.5">
                DEL Terminal 3 MRO Hangar
              </div>
            </div>

            {/* Defect Description */}
            <div className="pr-4 border-r border-[rgba(255,210,100,0.2)] max-w-xs">
              <div className="text-[10px] font-mono font-bold text-[#A8A28E] uppercase tracking-widest">
                REPORTED DEFECT
              </div>
              <div className="text-xs font-bold text-white mt-0.5 font-mono">
                ENGINE VIBRATION REPORTED
              </div>
              <div className="text-[10px] text-[#F0C75E] font-mono">
                Abnormal climb indication · Grounded
              </div>
            </div>

            {/* Human Review State */}
            <div className="pr-4 border-r border-[rgba(255,210,100,0.2)]">
              <div className="text-[10px] font-mono font-bold text-[#A8A28E] uppercase tracking-widest">
                GOVERNANCE STATUS
              </div>
              <div className="mt-0.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-[rgba(217,166,46,0.15)] border border-[rgba(217,166,46,0.45)] text-[#F0C75E] text-[11px] font-mono font-bold tracking-wide">
                  ⚠ HUMAN REVIEW REQUIRED
                </span>
              </div>
            </div>

            {/* Target Recovery Window */}
            <div>
              <div className="text-[10px] font-mono font-bold text-[#A8A28E] uppercase tracking-widest">
                RECOVERY WINDOW
              </div>
              <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-[#F0C75E]" />
                <span>18h Target (11h 10m ETA)</span>
              </div>
            </div>

          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2.5 shrink-0">
            {/* View Full Incident Detail Button */}
            {onSelectCase && activeCase && (
              <button
                onClick={() => onSelectCase(activeCase)}
                className="px-3 py-2 rounded bg-[rgba(38,42,34,0.7)] hover:bg-[rgba(52,58,46,0.9)] border border-[rgba(255,210,100,0.3)] text-xs font-mono font-semibold text-[#F7F1E4] transition cursor-pointer"
              >
                VIEW CASE DETAILS →
              </button>
            )}

            {/* Start AOG Recovery Button (Golden Aviation Primary) */}
            <button
              onClick={runAogRecoveryDemo}
              disabled={demoRunning}
              className={`flex items-center space-x-2 px-4 py-2 rounded text-xs font-mono font-bold transition cursor-pointer shadow-md ${
                demoRunning 
                  ? 'bg-[#D9A62E]/50 text-neutral-800 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-[#D9A62E] to-[#F0C75E] hover:from-[#F0C75E] hover:to-[#D9A62E] text-[#252820] border border-[#F0C75E]'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current text-[#252820]" />
              <span>{demoRunning ? 'RECOVERING...' : 'START AOG RECOVERY'}</span>
            </button>

            {/* Reset Scenario Button */}
            <button
              onClick={resetScenario}
              disabled={demoRunning}
              className="flex items-center space-x-1.5 px-3 py-2 rounded bg-[rgba(28,31,24,0.6)] hover:bg-[rgba(44,48,37,0.8)] border border-[rgba(255,210,100,0.2)] text-xs font-mono text-[#D8D0BD] hover:text-white transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#D9A62E]" />
              <span>RESET</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. FOUR MAJOR OPERATIONAL METRIC CARDS (Translucent Warm Ivory Glass) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Metric 1: ACTIVE AOG */}
        <div className="bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(255,244,214,0.65)] rounded-xl p-3.5 shadow-lg relative overflow-hidden text-[#252820]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#4A483E] uppercase tracking-widest">
              ACTIVE AOG
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#C85B43] shadow-[0_0_6px_#C85B43]"></span>
          </div>
          <div className="text-2xl font-mono font-black text-[#252820] mt-1">
            01 <span className="text-xs font-normal text-[#C85B43] font-mono bg-[#C85B43]/15 border border-[#C85B43]/30 px-1.5 py-0.5 rounded">CRITICAL</span>
          </div>
          <div className="text-[11px] font-mono text-[#4A483E] mt-1 flex items-center justify-between">
            <span>VT-SQK (DEL Hub)</span>
            <span className="text-[#C85B43] font-bold">AIRCRAFT GROUNDED</span>
          </div>
        </div>

        {/* Metric 2: PENDING REVIEW */}
        <div className="bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(255,244,214,0.65)] rounded-xl p-3.5 shadow-lg relative overflow-hidden text-[#252820]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#4A483E] uppercase tracking-widest">
              PENDING REVIEW
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#D9A62E] shadow-[0_0_6px_#D9A62E]"></span>
          </div>
          <div className="text-2xl font-mono font-black text-[#252820] mt-1">
            01 <span className="text-xs font-normal text-[#A87813] font-mono bg-[#D9A62E]/15 border border-[#D9A62E]/30 px-1.5 py-0.5 rounded">ACTION REQ</span>
          </div>
          <div className="text-[11px] font-mono text-[#4A483E] mt-1 flex items-center justify-between">
            <span>Lead Engineer Sign-off</span>
            <span className="text-[#A87813] font-bold">Option A/B Ready</span>
          </div>
        </div>

        {/* Metric 3: RECOVERY PLANS */}
        <div className="bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(255,244,214,0.65)] rounded-xl p-3.5 shadow-lg relative overflow-hidden text-[#252820]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#4A483E] uppercase tracking-widest">
              RECOVERY PLANS
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#78966A] shadow-[0_0_6px_#78966A]"></span>
          </div>
          <div className="text-2xl font-mono font-black text-[#252820] mt-1">
            03 <span className="text-xs font-normal text-[#547348] font-mono bg-[#78966A]/20 border border-[#78966A]/30 px-1.5 py-0.5 rounded">CANDIDATES</span>
          </div>
          <div className="text-[11px] font-mono text-[#4A483E] mt-1 flex items-center justify-between">
            <span>Multi-option synthesis</span>
            <span className="text-[#252820] font-bold">11h 10m ETA</span>
          </div>
        </div>

        {/* Metric 4: RESOURCE BOTTLENECKS */}
        <div className="bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(255,244,214,0.65)] rounded-xl p-3.5 shadow-lg relative overflow-hidden text-[#252820]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#4A483E] uppercase tracking-widest">
              RESOURCE BOTTLENECKS
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#D9A62E] shadow-[0_0_6px_#D9A62E]"></span>
          </div>
          <div className="text-2xl font-mono font-black text-[#252820] mt-1">
            02 <span className="text-xs font-normal text-[#A87813] font-mono bg-[#D9A62E]/15 border border-[#D9A62E]/30 px-1.5 py-0.5 rounded">CONSTRAINTS</span>
          </div>
          <div className="text-[11px] font-mono text-[#4A483E] mt-1 flex items-center justify-between">
            <span>DEL Hub stockout</span>
            <span className="text-[#A87813] font-bold">External dispatch</span>
          </div>
        </div>

      </div>

      {/* 3. MAIN CENTERPIECE: FLIGHT & RECOVERY MAP */}
      <FlightRecoveryMap 
        caseData={activeCase}
        demoRunning={demoRunning}
        demoStep={demoStep}
        isDisrupted={isDisrupted}
        isVerified={isVerified}
      />

      {/* 4. BOTTOM 3-COLUMN OPERATIONAL PANELS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        
        {/* COLUMN 1: SIMULATED DEMO TIMELINE (Translucent Warm Ivory Card) */}
        <div className="bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(255,244,214,0.65)] rounded-xl p-4 shadow-xl flex flex-col justify-between space-y-3 text-[#252820]">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(217,166,46,0.3)]">
              <div className="flex items-center space-x-2">
                <Clock className="w-3.5 h-3.5 text-[#A87813]" />
                <span className="text-[10px] font-mono font-bold text-[#252820] uppercase tracking-wider">
                  SIMULATED DEMO TIMELINE
                </span>
              </div>
              <span className="text-[9px] font-mono text-[#A87813] font-bold border border-[rgba(217,166,46,0.5)] px-1.5 py-0.5 rounded bg-[rgba(217,166,46,0.1)]">
                ORCHESTRATION TRACE
              </span>
            </div>

            {/* Timeline Events List */}
            <div className="pt-3 space-y-2 text-[11px] font-mono">
              <div className="flex items-start space-x-3 p-2 rounded bg-[rgba(255,248,235,0.75)] border border-[rgba(217,166,46,0.2)]">
                <span className="text-[#A87813] font-bold w-12 shrink-0">14:02</span>
                <div>
                  <div className="text-[#252820] font-bold">SQUAWK RECEIVED</div>
                  <div className="text-[10px] text-[#4A483E]">VT-SQK reported engine vibration at DEL</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-2 rounded bg-[rgba(255,248,235,0.75)] border border-[rgba(217,166,46,0.2)]">
                <span className="text-[#A87813] font-bold w-12 shrink-0">14:03</span>
                <div>
                  <div className="text-[#252820] font-bold">AI ANALYSIS COMPLETED</div>
                  <div className="text-[10px] text-[#4A483E]">82% confidence · Human review mandated</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-2 rounded bg-[rgba(255,248,235,0.75)] border border-[rgba(217,166,46,0.2)]">
                <span className="text-[#A87813] font-bold w-12 shrink-0">14:04</span>
                <div>
                  <div className="text-[#252820] font-bold">RESOURCE CHECK</div>
                  <div className="text-[10px] text-[#C85B43] font-semibold">Local stockout · Tech available at DEL T3</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-2 rounded bg-[rgba(255,248,235,0.75)] border border-[rgba(217,166,46,0.2)]">
                <span className="text-[#A87813] font-bold w-12 shrink-0">14:05</span>
                <div>
                  <div className="text-[#252820] font-bold">RECOVERY OPTIONS GENERATED</div>
                  <div className="text-[10px] text-[#4A483E]">Option A (AeroParts SIN) / Option B (SkySupply BOM)</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-2 rounded bg-[rgba(217,166,46,0.18)] border border-[#D9A62E]">
                <span className="text-[#A87813] font-bold w-12 shrink-0">14:07</span>
                <div>
                  <div className="text-[#252820] font-bold flex items-center gap-1">
                    <span>HUMAN REVIEW</span>
                    <span className="text-[9px] text-[#A87813] font-bold">● ACTIVE</span>
                  </div>
                  <div className="text-[10px] text-[#4A483E]">Awaiting A&P Licensed Engineer Authorization</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-2 rounded bg-[rgba(255,248,235,0.75)] border border-[rgba(217,166,46,0.2)]">
                <span className="text-[#A87813] font-bold w-12 shrink-0">14:09</span>
                <div>
                  <div className="text-[#252820] font-bold">PLAN APPROVED</div>
                  <div className="text-[10px] text-[#4A483E]">A&P-884920 digital certificate verified</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2: RESOURCE ORCHESTRATION (Translucent Warm Ivory Card) */}
        <div className="bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(255,244,214,0.65)] rounded-xl p-4 shadow-xl flex flex-col justify-between space-y-3 text-[#252820]">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(217,166,46,0.3)]">
              <div className="flex items-center space-x-2">
                <Boxes className="w-3.5 h-3.5 text-[#A87813]" />
                <span className="text-[10px] font-mono font-bold text-[#252820] uppercase tracking-wider">
                  RESOURCE ORCHESTRATION
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#4A483E]">
                DEL MRO HANGAR
              </span>
            </div>

            {/* Resource Cards */}
            <div className="pt-3 space-y-2.5">
              
              {/* TECHNICIAN */}
              <div className="p-2.5 rounded bg-[rgba(255,248,235,0.75)] border border-[rgba(217,166,46,0.2)] flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded bg-[rgba(217,166,46,0.15)] border border-[rgba(217,166,46,0.3)] flex items-center justify-center text-[#A87813]">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono font-bold text-[#4A483E]">TECHNICIAN</div>
                    <div className="text-xs font-bold text-[#252820] font-mono">Lead A&P (MCC Delhi)</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#78966A]/20 border border-[#78966A]/40 text-[#4E6B42] text-[10px] font-mono font-bold">
                  AVAILABLE
                </span>
              </div>

              {/* FACILITY */}
              <div className="p-2.5 rounded bg-[rgba(255,248,235,0.75)] border border-[rgba(217,166,46,0.2)] flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded bg-[rgba(217,166,46,0.15)] border border-[rgba(217,166,46,0.3)] flex items-center justify-center text-[#A87813]">
                    <Plane className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono font-bold text-[#4A483E]">FACILITY</div>
                    <div className="text-xs font-bold text-[#252820] font-mono">DEL Terminal 3 Bay 42</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#78966A]/20 border border-[#78966A]/40 text-[#4E6B42] text-[10px] font-mono font-bold">
                  AVAILABLE
                </span>
              </div>

              {/* PART */}
              <div className="p-2.5 rounded bg-[rgba(217,166,46,0.12)] border border-[#D9A62E] flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded bg-[#D9A62E]/25 border border-[#D9A62E] flex items-center justify-center text-[#A87813]">
                    <Boxes className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono font-bold text-[#4A483E]">PART: HP-2048 / VIB-SNS</div>
                    <div className="text-xs font-bold text-[#252820] font-mono">Hydraulic EDP / Vibration Sensor</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#D9A62E]/20 border border-[#D9A62E] text-[#A87813] text-[10px] font-mono font-bold">
                  VERIFICATION REQ
                </span>
              </div>

            </div>
          </div>

          <div className="pt-2 border-t border-[rgba(217,166,46,0.3)] text-[10px] font-mono text-[#4A483E] flex items-center justify-between">
            <span>Logistics Channel: Express Air Freight</span>
            <span className="text-[#A87813] font-bold">DEL Hub Synchronized</span>
          </div>
        </div>

        {/* COLUMN 3: HUMAN-IN-THE-LOOP SAFETY VERIFICATION (Cockpit Glass Panel) */}
        <div className="bg-[rgba(30,33,26,0.88)] backdrop-blur-xl border border-[rgba(255,210,100,0.25)] rounded-xl p-4 shadow-xl flex flex-col justify-between space-y-3 text-[#F7F1E4]">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[rgba(255,210,100,0.2)]">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F0C75E]" />
                <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                  HUMAN-IN-THE-LOOP CONTROL
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#F0C75E] font-bold">
                7/7 CONSTRAINTS
              </span>
            </div>

            {/* Step Sequence: AI -> HUMAN -> APPROVE */}
            <div className="pt-2.5 pb-2 text-[11px] font-mono space-y-2">
              <div className="p-2 rounded bg-[rgba(38,42,34,0.65)] border border-[rgba(255,210,100,0.2)] flex items-center justify-between">
                <span className="text-[#D8D0BD]">1. AI RECOMMENDATION</span>
                <span className="text-white font-bold">Option A Generated</span>
              </div>

              <div className="p-2 rounded bg-[rgba(217,166,46,0.2)] border border-[#D9A62E] flex items-center justify-between">
                <span className="text-[#F0C75E] font-bold">2. HUMAN REVIEW</span>
                <span className="px-2 py-0.5 rounded bg-[#D9A62E] text-[#252820] text-[10px] font-bold">REQUIRED</span>
              </div>

              <div className="p-2 rounded bg-[rgba(38,42,34,0.65)] border border-[rgba(255,210,100,0.2)] flex items-center justify-between">
                <span className="text-[#D8D0BD]">3. RECOVERY DECISION</span>
                <span className="text-neutral-300">APPROVE · MODIFY · REJECT</span>
              </div>
            </div>

            {/* Quick Action Button for Engineer */}
            <div className="pt-1">
              <button
                onClick={() => setIsApprovalOpen(true)}
                className="w-full py-2 px-3 rounded bg-gradient-to-r from-[#D9A62E] to-[#F0C75E] hover:from-[#F0C75E] hover:to-[#D9A62E] text-[#252820] text-xs font-mono font-bold transition border border-[#F0C75E] cursor-pointer shadow-md text-center"
              >
                [ REVIEW & AUTHORIZE PLAN ]
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-[rgba(255,210,100,0.2)] text-[10px] font-mono text-[#D8D0BD] text-center">
            Autonomous execution disabled · Licensed engineer required
          </div>
        </div>

      </div>

      {/* Human Approval Modal */}
      {activeCase && (
        <HumanApprovalModal 
          isOpen={isApprovalOpen}
          onClose={() => setIsApprovalOpen(false)}
          caseData={activeCase}
          candidate={activeCase.candidates?.find(c => c.is_recommended) || activeCase.candidates?.[0]}
          onApprove={async (data) => {
            await api.approveCase(activeCase.id, {
              approver_name: data.approverName,
              approver_license: data.approverLicense,
              decision: 'APPROVED',
              notes: data.notes
            });
            setIsApprovalOpen(false);
            const updated = await api.getCase(activeCase.id);
            setActiveCase(updated);
          }}
          onReject={async (data) => {
            await api.rejectCase(activeCase.id, {
              approver_name: data.approverName,
              approver_license: data.approverLicense,
              decision: 'REJECTED',
              notes: data.notes
            });
            setIsApprovalOpen(false);
            const updated = await api.getCase(activeCase.id);
            setActiveCase(updated);
          }}
        />
      )}

    </div>
  );
};
