import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  Clock, 
  DollarSign, 
  Hourglass, 
  ShieldCheck, 
  CheckCircle2, 
  Cpu, 
  Rocket, 
  Check, 
  AlertTriangle, 
  ArrowRight,
  Plane,
  ChevronRight
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
    <div className="p-4 space-y-3 font-sans text-slate-200">
      
      {/* 1. AOG CASE HEADER CARD */}
      <div className="w-full bg-[#080C14] border border-[#151D2A] rounded-xl p-3.5 shadow-xl flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        
        {/* Left Flight & AOG Metadata */}
        <div className="flex flex-wrap items-center gap-4">
          
          {/* Aircraft Thumbnail Image Badge */}
          <div className="w-16 h-12 rounded-lg bg-gradient-to-br from-blue-900/60 to-cyan-950/80 border border-cyan-500/40 p-1 flex items-center justify-center relative overflow-hidden shrink-0 shadow-md">
            <Plane className="w-8 h-8 text-cyan-300 transform -rotate-12 drop-shadow-md" />
            <div className="absolute inset-0 bg-blue-500/10 pointer-events-none"></div>
          </div>

          {/* Aircraft Reg & Type */}
          <div className="pr-2 border-r border-[#172233]">
            <div className="flex items-center space-x-2">
              <span className="text-base font-black text-white tracking-wide">VT-SQK</span>
              <span className="px-1.5 py-0.2 rounded bg-[#0284c7] text-white text-[10px] font-mono font-bold">
                SQ-402
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">Boeing 737-800</div>
          </div>

          {/* AOG Case ID & Location */}
          <div className="pr-2 border-r border-[#172233]">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-cyan-400 font-mono">AOG CASE #SQK-2048</span>
              <span className="px-1.5 py-0.2 rounded bg-[#ef4444] text-white text-[9px] font-mono font-extrabold uppercase">
                AIRCRAFT GROUNDED
              </span>
            </div>
            <div className="text-[11px] text-slate-300 font-medium flex items-center gap-1 mt-0.5">
              <span>DEL · Indira Gandhi International Airport</span>
              <span className="text-slate-500 text-[10px]">Terminal 3</span>
            </div>
          </div>

          {/* DEFECT */}
          <div className="pr-2 border-r border-[#172233]">
            <div className="text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider">DEFECT</div>
            <div className="text-xs font-semibold text-slate-200">Hydraulic System A</div>
            <div className="text-[10px] text-slate-400">EDP Low Pressure</div>
          </div>

          {/* REQUIRED PART */}
          <div className="pr-2 border-r border-[#172233]">
            <div className="text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider">REQUIRED PART</div>
            <div className="text-xs font-bold text-white font-mono">HP-2048</div>
            <div className="text-[10px] text-slate-400 font-mono">Qty: 1</div>
          </div>

          {/* RECOVERY DEADLINE */}
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider">RECOVERY DEADLINE</div>
            <div className="text-xs font-bold text-white flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>18 hours</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">(14 required)</div>
          </div>

        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center space-x-2.5 shrink-0">
          
          {/* Start AOG Recovery Button */}
          <button
            onClick={runAogRecoveryDemo}
            disabled={demoRunning}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-extrabold shadow-lg transition cursor-pointer active:scale-95 ${
              demoRunning 
                ? 'bg-cyan-700 text-slate-300 cursor-not-allowed' 
                : 'bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-cyan-900/40'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{demoRunning ? 'Recovery In Progress...' : 'Start AOG Recovery'}</span>
          </button>

          {/* Reset Scenario Button */}
          <button
            onClick={resetScenario}
            disabled={demoRunning}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#111A28] hover:bg-[#1A283D] border border-[#233348] text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Scenario</span>
          </button>

        </div>

      </div>

      {/* 2. KPI METRICS STRIP (7 Compact Cards in a Single Row) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        
        {/* KPI 1: RECOVERY ETA */}
        <div className="bg-[#080C14] border border-[#151D2A] rounded-xl p-3 shadow-md flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-[#091C2C] border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Plane className="w-4 h-4 -rotate-45" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">RECOVERY ETA</div>
            <div className="text-sm font-black text-white">11h 10m</div>
            <div className="text-[10px] text-emerald-400 font-medium">● 6h 50m buffer</div>
          </div>
        </div>

        {/* KPI 2: COST */}
        <div className="bg-[#080C14] border border-[#151D2A] rounded-xl p-3 shadow-md flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-[#091C2C] border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">COST</div>
            <div className="text-sm font-black text-white">$14,700</div>
            <div className="text-[10px] text-emerald-400 font-medium">vs $18,200 (saved)</div>
          </div>
        </div>

        {/* KPI 3: TIME BUFFER */}
        <div className="bg-[#080C14] border border-[#151D2A] rounded-xl p-3 shadow-md flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-[#091C2C] border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Hourglass className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">TIME BUFFER</div>
            <div className="text-sm font-black text-white">6h 50m</div>
            <div className="text-[10px] text-slate-400 font-medium">before deadline</div>
          </div>
        </div>

        {/* KPI 4: RELIABILITY */}
        <div className="bg-[#080C14] border border-[#151D2A] rounded-xl p-3 shadow-md flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-[#091C2C] border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">RELIABILITY</div>
            <div className="text-sm font-black text-white">91%</div>
            <div className="text-[10px] text-slate-400 font-medium">verified deliveries</div>
          </div>
        </div>

        {/* KPI 5: TOOL CALLS */}
        <div className="bg-[#080C14] border border-[#151D2A] rounded-xl p-3 shadow-md flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-[#091C2C] border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">TOOL CALLS</div>
            <div className="text-sm font-black text-white">14</div>
            <div className="text-[10px] text-slate-400 font-mono">/ 14 total</div>
          </div>
        </div>

        {/* KPI 6: REPLANS */}
        <div className="bg-[#080C14] border border-[#151D2A] rounded-xl p-3 shadow-md flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-[#091C2C] border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <Rocket className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">REPLANS</div>
            <div className="text-sm font-black text-white">{isDisrupted ? '1' : '0'}</div>
            <div className="text-[10px] text-slate-400 font-mono">/ 1 required</div>
          </div>
        </div>

        {/* KPI 7: STATUS */}
        <div className="bg-[#080C14] border border-[#151D2A] rounded-xl p-3 shadow-md flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-[#07241A] border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">STATUS</div>
            <div className="mt-1">
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-black flex items-center gap-1 border ${
                isVerified 
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/80'
                  : 'bg-cyan-950 text-cyan-300 border-cyan-500/80'
              }`}>
                <Check className="w-2.5 h-2.5 stroke-[3]" />
                {isVerified ? 'RECOVERY VERIFIED' : 'AWAITING APPROVAL'}
              </span>
            </div>
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

      {/* 4. BOTTOM 3-COLUMN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        
        {/* COLUMN 1: INITIAL EXECUTION TIMELINE & TOOL TIMELINE */}
        <div className="bg-[#080C14] border border-[#151D2A] rounded-xl p-3.5 shadow-xl flex flex-col justify-between space-y-3">
          
          {/* Top Section: Initial Execution Timeline */}
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#151D2A]">
              <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider">
                INITIAL EXECUTION TIMELINE
              </span>
              <span className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono cursor-pointer">
                View All &gt;
              </span>
            </div>

            {/* 3-Step Sequence Flow */}
            <div className="pt-2.5 flex items-center justify-between gap-1.5 text-[10px]">
              
              {/* Step 1: Initial Plan */}
              <div className="flex-1 p-2 rounded-lg bg-[#0D1420] border border-[#1E293B] space-y-0.5">
                <div className="text-[9px] font-bold text-cyan-400 font-mono uppercase">INITIAL PLAN</div>
                <div className="font-bold text-white text-[11px]">AeroParts</div>
                <div className="text-slate-400 font-mono text-[9px]">SIN → DEL</div>
                <div className="text-slate-400 font-mono text-[9px]">ETA: 8h 20m</div>
                <div className="text-slate-400 font-mono text-[9px]">Cost: $18,200</div>
                <div className="text-slate-400 font-mono text-[9px]">Reliability: 96%</div>
                <div className="pt-1">
                  <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 text-[8px] font-bold">
                    ✓ Recommended
                  </span>
                </div>
              </div>

              {/* Arrow 1 */}
              <ArrowRight className="w-3.5 h-3.5 text-amber-500 shrink-0" />

              {/* Step 2: Disruption */}
              <div className="w-24 p-2 rounded-lg bg-[#190D11] border border-red-500/50 space-y-1 text-center shrink-0">
                <div className="text-[9px] font-bold text-red-400 font-mono uppercase">DISRUPTION</div>
                <div className="text-[10px] font-bold text-red-200 leading-tight">Supplier A Stockout</div>
                <div className="pt-0.5">
                  <span className="px-1 py-0.2 rounded bg-red-950 text-red-400 border border-red-800 text-[8px] font-bold">
                    ⚠ Plan Invalidated
                  </span>
                </div>
              </div>

              {/* Arrow 2 */}
              <ArrowRight className="w-3.5 h-3.5 text-cyan-500 shrink-0" />

              {/* Step 3: Replanned Plan */}
              <div className="flex-1 p-2 rounded-lg bg-[#061814] border border-emerald-500/60 space-y-0.5">
                <div className="text-[9px] font-bold text-emerald-400 font-mono uppercase">REPLANNED PLAN</div>
                <div className="font-bold text-white text-[11px]">SkySupply Global</div>
                <div className="text-slate-400 font-mono text-[9px]">BOM → DEL</div>
                <div className="text-slate-400 font-mono text-[9px]">ETA: 11h 10m</div>
                <div className="text-slate-400 font-mono text-[9px]">Cost: $14,700</div>
                <div className="text-slate-400 font-mono text-[9px]">Carbon: 510 kg CO₂e</div>
                <div className="pt-1">
                  <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500 text-[8px] font-bold">
                    ✓ PASS
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Section: Tool Execution Timeline */}
          <div className="pt-2 border-t border-[#151D2A]">
            <div className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-wider mb-2">
              TOOL EXECUTION TIMELINE
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-[9px] font-mono">
              <div className="p-1.5 rounded bg-[#0A101A] border border-[#1A2536] text-center">
                <div className="text-slate-500 text-[8px]">08:10</div>
                <div className="text-slate-200 font-bold truncate">get-aircraft()</div>
                <div className="text-emerald-400 text-[8px] font-bold">SUCCESS</div>
              </div>
              <div className="p-1.5 rounded bg-[#0A101A] border border-[#1A2536] text-center">
                <div className="text-slate-500 text-[8px]">08:15</div>
                <div className="text-slate-200 font-bold truncate">get-inventory()</div>
                <div className="text-emerald-400 text-[8px] font-bold">SUCCESS</div>
              </div>
              <div className="p-1.5 rounded bg-[#0A101A] border border-[#1A2536] text-center">
                <div className="text-slate-500 text-[8px]">08:22</div>
                <div className="text-slate-200 font-bold truncate">search-suppliers()</div>
                <div className="text-emerald-400 text-[8px] font-bold">SUCCESS</div>
              </div>
              <div className="p-1.5 rounded bg-[#0A101A] border border-[#1A2536] text-center">
                <div className="text-slate-500 text-[8px]">08:41</div>
                <div className="text-slate-200 font-bold truncate">verify-part()</div>
                <div className="text-emerald-400 text-[8px] font-bold">SUCCESS</div>
              </div>
              <div className="p-1.5 rounded bg-[#0A101A] border border-[#1A2536] text-center">
                <div className="text-slate-500 text-[8px]">09:05</div>
                <div className="text-slate-200 font-bold truncate">calculate-route()</div>
                <div className="text-emerald-400 text-[8px] font-bold">SUCCESS</div>
              </div>
              <div className="p-1.5 rounded bg-[#0A101A] border border-[#1A2536] text-center">
                <div className="text-slate-500 text-[8px]">09:32</div>
                <div className="text-slate-200 font-bold truncate">optimize-recovery()</div>
                <div className="text-emerald-400 text-[8px] font-bold">SUCCESS</div>
              </div>
              <div className="p-1.5 rounded bg-[#0A101A] border border-[#1A2536] text-center">
                <div className="text-slate-500 text-[8px]">11:05</div>
                <div className="text-slate-200 font-bold truncate">reserve-part()</div>
                <div className="text-emerald-400 text-[8px] font-bold">SUCCESS</div>
              </div>
              <div className="p-1.5 rounded bg-[#0A101A] border border-[#1A2536] text-center">
                <div className="text-slate-500 text-[8px]">11:20</div>
                <div className="text-slate-200 font-bold truncate">create-timeline()</div>
                <div className="text-cyan-400 text-[8px] font-bold">RUNNING</div>
              </div>
            </div>
          </div>

        </div>

        {/* COLUMN 2: DECISION TRACE */}
        <div className="bg-[#080C14] border border-[#151D2A] rounded-xl p-3.5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#151D2A]">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Cpu className="w-3 h-3" />
                </div>
                <span className="text-[10px] font-bold text-white font-mono uppercase tracking-wider">
                  DECISION TRACE
                </span>
              </div>
              <span className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono cursor-pointer">
                View All &gt;
              </span>
            </div>

            {/* Vertical Audit Trace */}
            <div className="pt-2.5 space-y-2 text-[11px]">
              
              {/* GOAL */}
              <div className="flex items-start space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/60 flex items-center justify-center text-cyan-400 font-mono font-bold text-[9px] shrink-0 mt-0.5">
                  G
                </div>
                <div>
                  <span className="font-mono font-bold text-cyan-400 text-[10px] mr-1.5">GOAL</span>
                  <span className="text-slate-300">Recover aircraft within 18h deadline</span>
                </div>
              </div>

              {/* OBSERVATION */}
              <div className="flex items-start space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 font-mono font-bold text-[9px] shrink-0 mt-0.5">
                  O
                </div>
                <div>
                  <span className="font-mono font-bold text-slate-400 text-[10px] mr-1.5">OBSERVATION</span>
                  <span className="text-slate-300">Local inventory unavailable</span>
                </div>
              </div>

              {/* ACTION */}
              <div className="flex items-start space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-950 border border-blue-600 flex items-center justify-center text-blue-400 font-mono font-bold text-[9px] shrink-0 mt-0.5">
                  A
                </div>
                <div>
                  <span className="font-mono font-bold text-blue-400 text-[10px] mr-1.5">ACTION</span>
                  <span className="text-slate-300">Search external suppliers</span>
                </div>
              </div>

              {/* OUTCOME */}
              <div className="flex items-start space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-600 flex items-center justify-center text-emerald-400 font-mono font-bold text-[9px] shrink-0 mt-0.5">
                  O
                </div>
                <div>
                  <span className="font-mono font-bold text-emerald-400 text-[10px] mr-1.5">OUTCOME</span>
                  <span className="text-slate-300">3 suppliers found → AeroParts selected</span>
                </div>
              </div>

              {/* DISRUPTION */}
              <div className="flex items-start space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-red-950 border border-red-600 flex items-center justify-center text-red-400 font-mono font-bold text-[9px] shrink-0 mt-0.5">
                  D
                </div>
                <div>
                  <span className="font-mono font-bold text-red-400 text-[10px] mr-1.5">DISRUPTION</span>
                  <span className="text-red-300">AeroParts stockout detected</span>
                </div>
              </div>

              {/* ACTION */}
              <div className="flex items-start space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-blue-950 border border-blue-600 flex items-center justify-center text-blue-400 font-mono font-bold text-[9px] shrink-0 mt-0.5">
                  A
                </div>
                <div>
                  <span className="font-mono font-bold text-blue-400 text-[10px] mr-1.5">ACTION</span>
                  <span className="text-slate-300">Replan and search again</span>
                </div>
              </div>

              {/* OUTCOME */}
              <div className="flex items-start space-x-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-600 flex items-center justify-center text-emerald-400 font-mono font-bold text-[9px] shrink-0 mt-0.5">
                  O
                </div>
                <div>
                  <span className="font-mono font-bold text-emerald-400 text-[10px] mr-1.5">OUTCOME</span>
                  <span className="text-slate-300">SkySupply selected → New route active</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* COLUMN 3: VERIFICATION */}
        <div className="bg-[#080C14] border border-[#151D2A] rounded-xl p-3.5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#151D2A]">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-bold text-white font-mono uppercase tracking-wider">
                  VERIFICATION
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                7 / 7 constraints
              </span>
            </div>

            {/* Status Pill Badge */}
            <div className="pt-2 pb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/80 text-emerald-300 text-[10px] font-mono font-bold">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {isVerified ? 'RECOVERY VERIFIED' : 'PENDING'}
              </span>
            </div>

            {/* Verification Checklist */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center space-x-2 text-slate-200">
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span>Part verified</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-200">
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span>Supplier verified</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-200">
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span>Compliance verified</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-200">
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span>Route verified</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-200">
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span>Deadline satisfied</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-200">
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span>Shipment created</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-200">
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span>Recovery validated</span>
              </div>
            </div>
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
