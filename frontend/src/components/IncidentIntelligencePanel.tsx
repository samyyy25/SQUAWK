import React, { useState } from 'react';
import {
  ShieldAlert,
  Sparkles,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  RefreshCw,
  AlertOctagon,
  HelpCircle,
  Info,
  Wrench,
  Users,
  Warehouse,
  Boxes,
  ShieldCheck
} from 'lucide-react';
import { SquawkCase, RecoveryOptionItem } from '../types';
import { api } from '../api';

interface IncidentIntelligencePanelProps {
  caseData: SquawkCase;
  onRefresh: () => void;
}

export const IncidentIntelligencePanel: React.FC<IncidentIntelligencePanelProps> = ({
  caseData,
  onRefresh
}) => {
  const [isSimulatingFailure, setIsSimulatingFailure] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('OPTION_A');
  const [showExplainabilityModal, setShowExplainabilityModal] = useState(false);
  const [showAllFactors, setShowAllFactors] = useState(false);

  const intel = caseData.incident_intelligence;

  const handleToggleFailure = async () => {
    setIsSimulatingFailure(true);
    try {
      if (intel?.ai_failed) {
        await api.analyzeCase(caseData.id);
      } else {
        await api.simulateFailure(caseData.id);
      }
      onRefresh();
    } catch (e: any) {
      alert('Simulation error: ' + e.message);
    } finally {
      setIsSimulatingFailure(false);
    }
  };

  if (!intel) {
    return (
      <div className="bg-[#000000] border-2 border-[#830000] rounded-xl p-6 text-center space-y-3">
        <Cpu className="w-8 h-8 text-[#BC0202] mx-auto animate-pulse" />
        <h3 className="text-sm font-mono font-bold text-white">INITIALIZING AI INCIDENT INTELLIGENCE...</h3>
        <p className="text-xs font-mono text-neutral-400">Extracting structured defect parameters and dependencies</p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 rounded bg-[#830000] hover:bg-[#BC0202] text-white text-xs font-mono font-bold transition border border-[#BC0202] cursor-pointer"
        >
          RUN ANALYSIS
        </button>
      </div>
    );
  }

  // Safe fallback if AI service failed
  if (intel.ai_failed) {
    return (
      <div className="bg-[#000000] border-2 border-[#FF0000] rounded-xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-[#000000] border border-[#FF0000] text-[#FF0000]">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-mono font-bold text-white">AI ANALYSIS TEMPORARILY UNAVAILABLE</h3>
                <span className="px-2 py-0.5 rounded bg-[#000000] text-[#FF0000] text-[10px] font-mono font-bold border border-[#FF0000]">
                  SAFE FALLBACK ACTIVE
                </span>
              </div>
              <p className="text-xs font-mono text-neutral-400">
                Rule-based categorization active. Case routed to human engineering controller for manual review.
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleFailure}
            disabled={isSimulatingFailure}
            className="px-3.5 py-1.5 rounded bg-[#0D0D0D] hover:bg-[#830000]/40 text-white text-xs font-mono font-bold transition flex items-center space-x-1.5 border border-[#830000] cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingFailure ? 'animate-spin text-[#BC0202]' : ''}`} />
            <span>RESTORE NORMAL AI</span>
          </button>
        </div>

        {/* Fallback details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-[#080808] p-4 rounded border border-[#1E1E1E] font-mono">
          <div>
            <span className="text-[10px] text-neutral-500 uppercase block">Reported Defect</span>
            <div className="text-white font-medium mt-1">{caseData.defect_description}</div>
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 uppercase block">Station / Aircraft</span>
            <div className="text-white font-bold mt-1">{caseData.location} • {caseData.tail_number || 'VT-SQK'}</div>
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 uppercase block">System Recommendation</span>
            <div className="text-[#BC0202] font-semibold mt-1">Manual TechOps Triage & Physical Inspection</div>
          </div>
        </div>

        <div className="p-3 bg-[#080808] border border-[#FF0000] rounded text-xs font-mono text-neutral-300">
          <strong className="text-[#FF0000] font-semibold block mb-0.5">SAFETY GUARANTEE:</strong>
          In the event of network disruption or malformed AI output, SQUAWK never fabricates data. The system automatically preserves the defect report and transitions to manual engineering authorization.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans text-neutral-200">
      
      {/* 1. SAFETY & DECISION-SUPPORT HEADER BANNER */}
      <div className="bg-[#000000] border-2 border-[#830000] rounded-xl p-4 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded bg-[#0D0D0D] border border-[#830000] text-[#BC0202] shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-mono font-bold text-white tracking-wide">
                AI INCIDENT INTELLIGENCE SYSTEM
              </h2>
              <span className="px-2 py-0.5 rounded bg-[#0D0D0D] text-[#BC0202] border border-[#830000] text-[10px] font-mono font-bold uppercase">
                DECISION SUPPORT ONLY
              </span>
            </div>
            <p className="text-xs font-mono text-neutral-400 mt-0.5">
              Structured defect extraction. Human review required before operational action.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleToggleFailure}
            disabled={isSimulatingFailure}
            title="Demonstrate graceful handling when AI service is unavailable"
            className="px-3 py-1.5 rounded bg-[#0D0D0D] hover:bg-[#830000]/30 text-neutral-300 hover:text-white border border-[#1E1E1E] hover:border-[#830000] text-xs font-mono font-bold transition flex items-center space-x-1.5 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#BC0202]" />
            <span>Simulate AI Failure</span>
          </button>

          <button
            onClick={() => setShowExplainabilityModal(true)}
            className="px-3 py-1.5 rounded bg-[#830000] hover:bg-[#BC0202] text-white border border-[#BC0202] text-xs font-mono font-bold transition flex items-center space-x-1.5 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Why This Recommendation?</span>
          </button>
        </div>
      </div>

      {/* 2. THREE-PANEL DEFECT INTELLIGENCE SECTION (Section 9 Spec) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        
        {/* Panel 1: AI Defect Summary */}
        <div className="bg-[#000000] border border-[#830000] rounded-xl p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-2">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-[#BC0202]" />
              <span>DEFECT SUMMARY</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-[#000000] text-[#FF0000] border border-[#FF0000] text-[10px] font-mono font-bold">
              {intel.severity}
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">AIRCRAFT / REGISTRATION</span>
              <div className="text-white font-bold text-sm mt-0.5">{caseData.tail_number || 'VT-SQK'} ({caseData.aircraft_type || 'Boeing 737-800'})</div>
            </div>

            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">LOCATION STATION</span>
              <div className="text-neutral-200 font-semibold mt-0.5">{caseData.location || 'DEL Terminal 3 MRO Hangar'}</div>
            </div>

            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">REPORTED DEFECT</span>
              <div className="text-neutral-300 font-mono mt-0.5 leading-relaxed bg-[#080808] p-2.5 rounded border border-[#1E1E1E]">
                "{intel.summary}"
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase block">TIME REPORTED</span>
                <span className="text-neutral-300 font-semibold">14:02 UTC (Demo)</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase block">AOG STATUS</span>
                <span className="text-[#FF0000] font-bold">🔴 GROUNDED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: AI Incident Intelligence & Classification */}
        <div className="bg-[#000000] border border-[#830000] rounded-xl p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-2">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#BC0202]" />
              <span>DEFECT CATEGORY & EVIDENCE</span>
            </span>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] text-neutral-400 font-mono">CONFIDENCE:</span>
              <span className="px-2 py-0.5 rounded bg-[#0D0D0D] text-white border border-[#830000] text-[11px] font-mono font-bold">
                {Math.round(intel.confidence * 100)}%
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">DEFECT CATEGORY</span>
              <div className="text-white font-bold mt-0.5">{intel.category}</div>
            </div>

            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">OPERATIONAL IMPACT</span>
              <div className="text-neutral-300 leading-snug mt-0.5">{intel.operational_impact}</div>
            </div>

            <div>
              <span className="text-[10px] text-neutral-500 uppercase block mb-1">EVIDENCE ({intel.evidence.length})</span>
              <ul className="space-y-1">
                {intel.evidence.slice(0, 3).map((ev, i) => (
                  <li key={i} className="text-[11px] text-neutral-300 flex items-start space-x-1.5">
                    <span className="text-[#BC0202] shrink-0 font-bold">•</span>
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-2 rounded bg-[#080808] border border-[#1E1E1E]">
              <span className="text-[10px] text-neutral-500 uppercase block">RECOMMENDATION</span>
              <span className="text-[#BC0202] font-bold text-[11px]">
                Human review required before operational action.
              </span>
            </div>
          </div>
        </div>

        {/* Panel 3: Missing Information & Contributing Factors */}
        <div className="bg-[#000000] border border-[#830000] rounded-xl p-4 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-2">
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#BC0202]" />
              <span>MISSING INFORMATION</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-[#000000] text-[#BC0202] border border-[#BC0202] text-[10px] font-mono font-bold">
              VERIFICATION REQD
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block mb-1">
                UNVERIFIED TELEMETRY / DATA ({intel.missing_information.length})
              </span>
              <div className="space-y-1">
                {intel.missing_information.map((item, idx) => (
                  <div key={idx} className="bg-[#080808] p-1.5 rounded border border-[#1E1E1E] flex items-center justify-between text-[11px]">
                    <span className="text-neutral-300">• {item}</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#000000] text-[#BC0202] border border-[#830000]">
                      Requires verification
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-1">
              <span className="text-[10px] text-neutral-500 uppercase block mb-1">
                POTENTIAL CONTRIBUTING FACTORS
              </span>
              <ul className="space-y-1">
                {intel.contributing_factors.slice(0, showAllFactors ? undefined : 2).map((factor, i) => (
                  <li key={i} className="text-[11px] text-neutral-300 flex items-start space-x-1.5">
                    <span className="text-[#830000] shrink-0 font-bold">▸</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
              {intel.contributing_factors.length > 2 && (
                <button
                  onClick={() => setShowAllFactors(!showAllFactors)}
                  className="text-[10px] text-[#BC0202] hover:underline mt-1 font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <span>{showAllFactors ? 'Show less' : `+${intel.contributing_factors.length - 2} more factors`}</span>
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 3. RECOVERY OPTIONS MATRIX (OPTION A, B, C) (Section 10 Spec) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-2">
          <div className="flex items-center space-x-2">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              EVALUATED RECOVERY OPTIONS (OPTION A / B / C)
            </h3>
            <span className="text-[10px] font-mono text-neutral-400">
              • Multiple options displayed (No single absolute truth)
            </span>
          </div>
          <span className="text-[11px] text-neutral-400 font-mono">
            Target 18.0h Deadline
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {intel.recovery_options.map((opt: RecoveryOptionItem) => {
            const isSelected = selectedOptionId === opt.option_id;
            const isRec = opt.is_recommended;
            const isHighRisk = opt.confidence < 0.5;

            return (
              <div
                key={opt.option_id}
                onClick={() => setSelectedOptionId(opt.option_id)}
                className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-[#0D0D0D] border-2 border-[#830000] shadow-lg'
                    : 'bg-[#000000] border border-[#1E1E1E] hover:border-[#830000]/60'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-white uppercase">
                      {opt.option_id.replace('_', ' ')}
                    </span>
                    {isRec ? (
                      <span className="px-2 py-0.5 rounded bg-[#830000] text-white border border-[#BC0202] text-[10px] font-mono font-bold">
                        RECOMMENDED #1
                      </span>
                    ) : isHighRisk ? (
                      <span className="px-2 py-0.5 rounded bg-[#000000] text-[#FF0000] border border-[#FF0000] text-[10px] font-mono font-bold">
                        CRITICAL RISK
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-[#080808] text-neutral-400 border border-[#1E1E1E] text-[10px] font-mono">
                        SECONDARY
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-mono font-bold text-white leading-snug">{opt.title}</h4>
                  <p className="text-[11px] font-mono text-neutral-400 leading-snug">{opt.strategy}</p>

                  <div className="pt-2 border-t border-[#1E1E1E] space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 text-[10px]">OPERATIONAL IMPACT:</span>
                      <span className="font-bold text-white">{opt.expected_operational_impact || 'High'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 text-[10px]">CONFIDENCE:</span>
                      <span className="font-bold text-white">
                        {Math.round(opt.confidence * 100)}% ({opt.confidence > 0.75 ? 'High' : 'Medium'})
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 text-[10px]">ESTIMATED WINDOW:</span>
                      <span className="font-bold text-white">{opt.estimated_recovery_window}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 text-[10px]">ESTIMATED COST:</span>
                      <span className="font-bold text-white">${opt.total_cost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-[#1E1E1E] text-[10px] font-mono">
                  {opt.risks.length > 0 && (
                    <div className="text-[#BC0202] leading-tight">
                      <strong>Dependencies: </strong>{opt.risks[0]}
                    </div>
                  )}
                  <div className="text-neutral-400 pt-1">
                    ✓ Human review required before action
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* EXPLAINABILITY MODAL: WHY THIS RECOMMENDATION? */}
      {showExplainabilityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="bg-[#000000] border-2 border-[#830000] rounded-xl w-full max-w-2xl p-6 space-y-4 shadow-2xl text-neutral-200 font-mono">
            <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded bg-[#0D0D0D] border border-[#830000] text-[#BC0202]">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">WHY THIS RECOMMENDATION?</h3>
                  <p className="text-xs text-neutral-400">Transparent AI decision-support explanation matrix</p>
                </div>
              </div>
              <button
                onClick={() => setShowExplainabilityModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded hover:bg-[#0D0D0D] text-xs font-bold"
              >
                ✕ CLOSE
              </button>
            </div>

            {/* Evidence Considered */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#BC0202]" />
                <span>EVIDENCE & FACTORS CONSIDERED:</span>
              </h4>
              <div className="bg-[#080808] p-3.5 rounded border border-[#1E1E1E] space-y-1.5 text-xs text-neutral-300">
                {intel.why_recommendation.evidence_considered.map((ev, i) => (
                  <div key={i} className="flex items-start space-x-2">
                    <span className="text-[#BC0202] shrink-0">✓</span>
                    <span>{ev}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Not Considered Because Unavailable */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#BC0202] uppercase tracking-wider flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-[#BC0202]" />
                <span>UNAVAILABLE DATA (TRANSPARENT LIMITATIONS):</span>
              </h4>
              <div className="bg-[#080808] p-3.5 rounded border border-[#1E1E1E] space-y-1.5 text-xs text-neutral-400">
                {intel.why_recommendation.not_considered_unavailable.map((item, i) => (
                  <div key={i} className="flex items-start space-x-2">
                    <span className="text-[#FF0000] shrink-0">✕</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-[#080808] border border-[#830000] rounded text-xs text-neutral-300">
              <strong className="text-white font-semibold block mb-0.5">AVIATION COMPLIANCE GUARANTEE:</strong>
              SQUAWK does not invent uncertified maintenance instructions or claim autonomous dispatch authority. All recovery actions require licensed human controller approval.
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowExplainabilityModal(false)}
                className="px-5 py-2 rounded bg-[#830000] hover:bg-[#BC0202] text-white text-xs font-bold transition border border-[#BC0202] cursor-pointer"
              >
                DONE
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
