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
    <div className="p-4 space-y-4 font-sans text-neutral-200 bg-[#000000] min-h-full">
      
      {/* 1. SQUAWK AOG STATUS HERO CARD (Section 7 Spec) */}
      <div className="w-full bg-[#000000] border-2 border-[#830000] rounded-xl p-4 shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-32 bg-[#830000]/10 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          
          {/* Left AOG Metadata */}
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Critical AOG Indicator Badge */}
            <div className="px-3 py-2 rounded bg-[#000000] border-2 border-[#FF0000] flex items-center space-x-2 shrink-0 shadow-lg shadow-[#FF0000]/10">
              <span className="w-3 h-3 rounded-full bg-[#FF0000] animate-pulse"></span>
              <span className="text-xs font-mono font-black text-[#FF0000] tracking-widest">
                🔴 AOG ACTIVE
              </span>
            </div>

            {/* Aircraft Reg & Type */}
            <div className="pr-4 border-r border-[#1E1E1E]">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-mono font-black text-white tracking-wider">VT-SQK</span>
                <span className="px-1.5 py-0.5 rounded bg-[#830000] text-white text-[10px] font-mono font-bold">
                  737-800
                </span>
              </div>
              <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                DEL Terminal 3 MRO Hangar
              </div>
            </div>

            {/* Defect Description */}
            <div className="pr-4 border-r border-[#1E1E1E] max-w-xs">
              <div className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
                REPORTED DEFECT
              </div>
              <div className="text-xs font-bold text-[#FFFFFF] mt-0.5 font-mono">
                ENGINE VIBRATION REPORTED
              </div>
              <div className="text-[10px] text-[#BC0202] font-mono">
                Abnormal climb indication · Grounded
              </div>
            </div>

            {/* Human Review State */}
            <div className="pr-4 border-r border-[#1E1E1E]">
              <div className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
                GOVERNANCE STATUS
              </div>
              <div className="mt-0.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#000000] border border-[#BC0202] text-[#BC0202] text-[11px] font-mono font-bold tracking-wide">
                  ⚠ HUMAN REVIEW REQUIRED
                </span>
              </div>
            </div>

            {/* Target Recovery Window */}
            <div>
              <div className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
                RECOVERY WINDOW
              </div>
              <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-[#BC0202]" />
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
                className="px-3 py-2 rounded bg-[#0D0D0D] hover:bg-[#830000]/40 border border-[#830000] text-xs font-mono font-semibold text-white transition cursor-pointer"
              >
                VIEW CASE DETAILS →
              </button>
            )}

            {/* Start AOG Recovery Button */}
            <button
              onClick={runAogRecoveryDemo}
              disabled={demoRunning}
              className={`flex items-center space-x-2 px-4 py-2 rounded text-xs font-mono font-bold transition cursor-pointer shadow-md ${
                demoRunning 
                  ? 'bg-[#830000]/60 text-neutral-300 cursor-not-allowed' 
                  : 'bg-[#830000] hover:bg-[#BC0202] text-white border border-[#BC0202]'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{demoRunning ? 'RECOVERING...' : 'START AOG RECOVERY'}</span>
            </button>

            {/* Reset Scenario Button */}
            <button
              onClick={resetScenario}
              disabled={demoRunning}
              className="flex items-center space-x-1.5 px-3 py-2 rounded bg-[#000000] hover:bg-[#0D0D0D] border border-[#1E1E1E] hover:border-[#830000] text-xs font-mono text-neutral-400 hover:text-white transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#BC0202]" />
              <span>RESET</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. FOUR MAJOR OPERATIONAL METRIC CARDS (Section 8 Spec) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Metric 1: ACTIVE AOG (#FF0000) */}
        <div className="bg-[#000000] border border-[#830000] rounded-xl p-3.5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
              ACTIVE AOG
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF0000] shadow-sm shadow-[#FF0000]"></span>
          </div>
          <div className="text-2xl font-mono font-black text-white mt-1">
            01 <span className="text-xs font-normal text-[#FF0000] font-mono">CRITICAL</span>
          </div>
          <div className="text-[11px] font-mono text-neutral-400 mt-1 flex items-center justify-between">
            <span>VT-SQK (DEL Hub)</span>
            <span className="text-[#FF0000] font-bold">AIRCRAFT GROUNDED</span>
          </div>
        </div>

        {/* Metric 2: PENDING REVIEW (#BC0202) */}
        <div className="bg-[#000000] border border-[#830000] rounded-xl p-3.5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
              PENDING REVIEW
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#BC0202]"></span>
          </div>
          <div className="text-2xl font-mono font-black text-white mt-1">
            01 <span className="text-xs font-normal text-[#BC0202] font-mono">ACTION REQ</span>
          </div>
          <div className="text-[11px] font-mono text-neutral-400 mt-1 flex items-center justify-between">
            <span>Lead Engineer Sign-off</span>
            <span className="text-[#BC0202] font-bold">Option A/B Ready</span>
          </div>
        </div>

        {/* Metric 3: RECOVERY PLANS (#830000) */}
        <div className="bg-[#000000] border border-[#830000] rounded-xl p-3.5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
              RECOVERY PLANS
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#830000]"></span>
          </div>
          <div className="text-2xl font-mono font-black text-white mt-1">
            03 <span className="text-xs font-normal text-neutral-300 font-mono">CANDIDATES</span>
          </div>
          <div className="text-[11px] font-mono text-neutral-400 mt-1 flex items-center justify-between">
            <span>Multi-option synthesis</span>
            <span className="text-white font-bold">11h 10m ETA</span>
          </div>
        </div>

        {/* Metric 4: RESOURCE BOTTLENECKS (#BC0202 / Attention) */}
        <div className="bg-[#000000] border border-[#830000] rounded-xl p-3.5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest">
              RESOURCE BOTTLENECKS
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#BC0202]"></span>
          </div>
          <div className="text-2xl font-mono font-black text-white mt-1">
            02 <span className="text-xs font-normal text-[#BC0202] font-mono">CONSTRAINTS</span>
          </div>
          <div className="text-[11px] font-mono text-neutral-400 mt-1 flex items-center justify-between">
            <span>DEL Hub stockout</span>
            <span className="text-[#BC0202] font-bold">External dispatch</span>
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
        
        {/* COLUMN 1: SIMULATED DEMO TIMELINE (Section 12 Spec) */}
        <div className="bg-[#000000] border border-[#830000] rounded-xl p-4 shadow-xl flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#1E1E1E]">
              <div className="flex items-center space-x-2">
                <Clock className="w-3.5 h-3.5 text-[#BC0202]" />
                <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                  SIMULATED DEMO TIMELINE
                </span>
              </div>
              <span className="text-[9px] font-mono text-[#BC0202] font-bold border border-[#830000] px-1.5 py-0.5 rounded">
                ORCHESTRATION TRACE
              </span>
            </div>

            {/* Timeline Events List */}
            <div className="pt-3 space-y-2 text-[11px] font-mono">
              <div className="flex items-start space-x-3 p-1.5 rounded bg-[#080808] border border-[#1E1E1E]">
                <span className="text-neutral-400 font-bold w-12 shrink-0">14:02</span>
                <div>
                  <div className="text-white font-bold">SQUAWK RECEIVED</div>
                  <div className="text-[10px] text-neutral-400">VT-SQK reported engine vibration at DEL</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-1.5 rounded bg-[#080808] border border-[#1E1E1E]">
                <span className="text-neutral-400 font-bold w-12 shrink-0">14:03</span>
                <div>
                  <div className="text-white font-bold">AI ANALYSIS COMPLETED</div>
                  <div className="text-[10px] text-neutral-400">82% confidence · Human review mandated</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-1.5 rounded bg-[#080808] border border-[#1E1E1E]">
                <span className="text-neutral-400 font-bold w-12 shrink-0">14:04</span>
                <div>
                  <div className="text-white font-bold">RESOURCE CHECK</div>
                  <div className="text-[10px] text-[#BC0202]">Local stockout · Tech available at DEL T3</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-1.5 rounded bg-[#080808] border border-[#1E1E1E]">
                <span className="text-neutral-400 font-bold w-12 shrink-0">14:05</span>
                <div>
                  <div className="text-white font-bold">RECOVERY OPTIONS GENERATED</div>
                  <div className="text-[10px] text-neutral-400">Option A (AeroParts SIN) / Option B (SkySupply BOM)</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-1.5 rounded bg-[#0D0D0D] border border-[#830000]">
                <span className="text-[#BC0202] font-bold w-12 shrink-0">14:07</span>
                <div>
                  <div className="text-white font-bold flex items-center gap-1">
                    <span>HUMAN REVIEW</span>
                    <span className="text-[9px] text-[#BC0202]">● ACTIVE</span>
                  </div>
                  <div className="text-[10px] text-neutral-400">Awaiting A&P Licensed Engineer Authorization</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-1.5 rounded bg-[#080808] border border-[#1E1E1E]">
                <span className="text-neutral-400 font-bold w-12 shrink-0">14:09</span>
                <div>
                  <div className="text-white font-bold">PLAN APPROVED</div>
                  <div className="text-[10px] text-neutral-400">A&P-884920 digital certificate verified</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2: RESOURCE ORCHESTRATION (Section 13 Spec) */}
        <div className="bg-[#000000] border border-[#830000] rounded-xl p-4 shadow-xl flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#1E1E1E]">
              <div className="flex items-center space-x-2">
                <Boxes className="w-3.5 h-3.5 text-[#830000]" />
                <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                  RESOURCE ORCHESTRATION
                </span>
              </div>
              <span className="text-[10px] font-mono text-neutral-400">
                DEL MRO HANGAR
              </span>
            </div>

            {/* Resource Cards */}
            <div className="pt-3 space-y-2.5">
              
              {/* TECHNICIAN */}
              <div className="p-2.5 rounded bg-[#080808] border border-[#1E1E1E] flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded bg-[#0D0D0D] border border-[#1E1E1E] flex items-center justify-center text-white">
                    <Users className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono font-bold text-neutral-400">TECHNICIAN</div>
                    <div className="text-xs font-bold text-white font-mono">Lead A&P (MCC Delhi)</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#0D0D0D] border border-[#1E1E1E] text-white text-[10px] font-mono font-bold">
                  AVAILABLE
                </span>
              </div>

              {/* FACILITY */}
              <div className="p-2.5 rounded bg-[#080808] border border-[#1E1E1E] flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded bg-[#0D0D0D] border border-[#1E1E1E] flex items-center justify-center text-white">
                    <Plane className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono font-bold text-neutral-400">FACILITY</div>
                    <div className="text-xs font-bold text-white font-mono">DEL Terminal 3 Bay 42</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#0D0D0D] border border-[#1E1E1E] text-white text-[10px] font-mono font-bold">
                  AVAILABLE
                </span>
              </div>

              {/* PART */}
              <div className="p-2.5 rounded bg-[#0D0D0D] border border-[#BC0202] flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded bg-[#830000]/30 border border-[#BC0202] flex items-center justify-center text-[#BC0202]">
                    <Boxes className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono font-bold text-neutral-400">PART: HP-2048 / VIB-SNS</div>
                    <div className="text-xs font-bold text-white font-mono">Hydraulic EDP / Vibration Sensor</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#000000] border border-[#BC0202] text-[#BC0202] text-[10px] font-mono font-bold">
                  VERIFICATION REQ
                </span>
              </div>

            </div>
          </div>

          <div className="pt-2 border-t border-[#1E1E1E] text-[10px] font-mono text-neutral-400 flex items-center justify-between">
            <span>Logistics Channel: Express Air Freight</span>
            <span className="text-[#BC0202] font-bold">DEL Hub Synchronized</span>
          </div>
        </div>

        {/* COLUMN 3: HUMAN-IN-THE-LOOP SAFETY VERIFICATION (Section 11 Spec) */}
        <div className="bg-[#000000] border border-[#830000] rounded-xl p-4 shadow-xl flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#1E1E1E]">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#BC0202]" />
                <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                  HUMAN-IN-THE-LOOP CONTROL
                </span>
              </div>
              <span className="text-[10px] font-mono text-white font-bold">
                7/7 CONSTRAINTS
              </span>
            </div>

            {/* Step Sequence: AI -> HUMAN -> APPROVE */}
            <div className="pt-2.5 pb-2 text-[11px] font-mono space-y-2">
              <div className="p-2 rounded bg-[#080808] border border-[#1E1E1E] flex items-center justify-between">
                <span className="text-neutral-400">1. AI RECOMMENDATION</span>
                <span className="text-white font-bold">Option A Generated</span>
              </div>

              <div className="p-2 rounded bg-[#0D0D0D] border border-[#BC0202] flex items-center justify-between">
                <span className="text-[#BC0202] font-bold">2. HUMAN REVIEW</span>
                <span className="px-2 py-0.5 rounded bg-[#830000] text-white text-[10px] font-bold">REQUIRED</span>
              </div>

              <div className="p-2 rounded bg-[#080808] border border-[#1E1E1E] flex items-center justify-between">
                <span className="text-neutral-400">3. RECOVERY DECISION</span>
                <span className="text-neutral-300">APPROVE · MODIFY · REJECT</span>
              </div>
            </div>

            {/* Quick Action Button for Engineer */}
            <div className="pt-1">
              <button
                onClick={() => setIsApprovalOpen(true)}
                className="w-full py-2 px-3 rounded bg-[#830000] hover:bg-[#BC0202] text-white text-xs font-mono font-bold transition border border-[#BC0202] cursor-pointer shadow-sm text-center"
              >
                [ REVIEW & AUTHORIZE PLAN ]
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-[#1E1E1E] text-[10px] font-mono text-neutral-400 text-center">
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
