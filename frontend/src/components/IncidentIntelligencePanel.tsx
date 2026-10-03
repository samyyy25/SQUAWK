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
      <div className="bg-[rgba(26,29,23,0.95)] backdrop-blur-xl border border-[rgba(255,210,100,0.3)] rounded-xl p-6 text-center space-y-3 font-mono text-[#F7F1E4] shadow-md">
        <Cpu className="w-8 h-8 text-[#F0C75E] mx-auto animate-pulse" />
        <h3 className="text-sm font-mono font-bold text-[#F7F1E4]">INITIALIZING AI INCIDENT INTELLIGENCE...</h3>
        <p className="text-xs font-mono text-[#D8D0BD]">Extracting structured defect parameters and dependencies</p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#D9A62E] to-[#F0C75E] hover:from-[#E2B139] hover:to-[#F7D475] text-[#252820] text-xs font-mono font-bold transition border border-[#F0C75E] cursor-pointer shadow-md"
        >
          RUN ANALYSIS
        </button>
      </div>
    );
  }

  // Safe fallback if AI service failed
  if (intel.ai_failed) {
    return (
      <div className="bg-[rgba(26,29,23,0.95)] backdrop-blur-xl border border-[rgba(200,91,67,0.4)] rounded-xl p-6 space-y-4 shadow-xl text-[#F7F1E4] font-mono">
        <div className="flex items-center justify-between border-b border-[rgba(255,210,100,0.2)] pb-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-[#C85B43]/20 border border-[#C85B43]/50 text-[#E07A5F] shadow-sm">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-mono font-bold text-[#F7F1E4]">AI ANALYSIS TEMPORARILY UNAVAILABLE</h3>
                <span className="px-2 py-0.5 rounded bg-[#C85B43]/20 text-[#E07A5F] text-[10px] font-mono font-bold border border-[#C85B43]/50">
                  SAFE FALLBACK ACTIVE
                </span>
              </div>
              <p className="text-xs font-mono text-[#D8D0BD]">
                Rule-based categorization active. Case routed to human engineering controller for manual review.
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleFailure}
            disabled={isSimulatingFailure}
            className="px-3.5 py-1.5 rounded-lg bg-[rgba(38,42,34,0.7)] hover:bg-[rgba(52,58,46,0.9)] text-[#F7F1E4] text-xs font-mono font-bold transition flex items-center space-x-1.5 border border-[rgba(255,210,100,0.3)] cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingFailure ? 'animate-spin text-[#F0C75E]' : ''}`} />
            <span>RESTORE NORMAL AI</span>
          </button>
        </div>

        {/* Fallback details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-[rgba(30,33,26,0.75)] p-4 rounded-lg border border-[rgba(255,210,100,0.2)] font-mono">
          <div>
            <span className="text-[10px] text-[#A8A28E] uppercase block font-bold">Reported Defect</span>
            <div className="text-[#F7F1E4] font-medium mt-1">{caseData.defect_description}</div>
          </div>
          <div>
            <span className="text-[10px] text-[#A8A28E] uppercase block font-bold">Station / Aircraft</span>
            <div className="text-[#F7F1E4] font-bold mt-1">{caseData.location} • {caseData.tail_number || 'VT-SQK'}</div>
          </div>
          <div>
            <span className="text-[10px] text-[#A8A28E] uppercase block font-bold">System Recommendation</span>
            <div className="text-[#E07A5F] font-semibold mt-1">Manual TechOps Triage & Physical Inspection</div>
          </div>
        </div>

        <div className="p-3 bg-[#C85B43]/10 border border-[#C85B43]/35 rounded-lg text-xs font-mono text-[#D8D0BD]">
          <strong className="text-[#E07A5F] font-semibold block mb-0.5">SAFETY GUARANTEE:</strong>
          In the event of network disruption or malformed AI output, SQUAWK never fabricates data. The system automatically preserves the defect report and transitions to manual engineering authorization.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans text-[#252820]">
      
      {/* 1. SAFETY & DECISION-SUPPORT HEADER BANNER */}
      <div className="bg-[rgba(30,33,26,0.88)] backdrop-blur-xl border border-[rgba(255,210,100,0.3)] rounded-xl p-4 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-[#F7F1E4]">
        <div className="flex items-start space-x-3">
          <div className="p-2 rounded bg-[rgba(38,42,34,0.7)] border border-[rgba(255,210,100,0.25)] text-[#F0C75E] shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-mono font-bold text-white tracking-wide">
                AI INCIDENT INTELLIGENCE SYSTEM
              </h2>
              <span className="px-2 py-0.5 rounded bg-[rgba(217,166,46,0.2)] text-[#F0C75E] border border-[rgba(217,166,46,0.4)] text-[10px] font-mono font-bold uppercase">
                DECISION SUPPORT ONLY
              </span>
            </div>
            <p className="text-xs font-mono text-[#D8D0BD] mt-0.5">
              Structured defect extraction. Human review required before operational action.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleToggleFailure}
            disabled={isSimulatingFailure}
            title="Demonstrate graceful handling when AI service is unavailable"
            className="px-3 py-1.5 rounded bg-[rgba(38,42,34,0.7)] hover:bg-[rgba(52,58,46,0.9)] text-[#D8D0BD] hover:text-white border border-[rgba(255,210,100,0.25)] text-xs font-mono font-bold transition flex items-center space-x-1.5 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#F0C75E]" />
            <span>Simulate AI Failure</span>
          </button>

          <button
            onClick={() => setShowExplainabilityModal(true)}
            className="px-3 py-1.5 rounded bg-gradient-to-r from-[#D9A62E] to-[#F0C75E] hover:from-[#F0C75E] hover:to-[#D9A62E] text-[#252820] border border-[#F0C75E] text-xs font-mono font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-md"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#252820]" />
            <span>Why This Recommendation?</span>
          </button>
        </div>
      </div>

      {/* 2. THREE-PANEL DEFECT INTELLIGENCE SECTION (Translucent Warm Ivory Glass) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        
        {/* Panel 1: AI Defect Summary */}
        <div className="bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(255,244,214,0.65)] rounded-xl p-4 space-y-3 shadow-lg text-[#252820]">
          <div className="flex items-center justify-between border-b border-[rgba(217,166,46,0.3)] pb-2">
            <span className="text-xs font-mono font-bold text-[#252820] uppercase tracking-wider flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-[#A87813]" />
              <span>DEFECT SUMMARY</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-[#C85B43]/15 text-[#C85B43] border border-[#C85B43]/30 text-[10px] font-mono font-bold">
              {intel.severity}
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div>
              <span className="text-[10px] text-[#8C8472] uppercase block">AIRCRAFT / REGISTRATION</span>
              <div className="text-[#252820] font-bold text-sm mt-0.5">{caseData.tail_number || 'VT-SQK'} ({caseData.aircraft_type || 'Boeing 737-800'})</div>
            </div>

            <div>
              <span className="text-[10px] text-[#8C8472] uppercase block">LOCATION STATION</span>
              <div className="text-[#252820] font-semibold mt-0.5">{caseData.location || 'DEL Terminal 3 MRO Hangar'}</div>
            </div>

            <div>
              <span className="text-[10px] text-[#8C8472] uppercase block">REPORTED DEFECT</span>
              <div className="text-[#252820] font-mono mt-0.5 leading-relaxed bg-[rgba(255,248,235,0.75)] p-2.5 rounded border border-[rgba(217,166,46,0.25)]">
                "{intel.summary}"
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              <div>
                <span className="text-[10px] text-[#8C8472] uppercase block">TIME REPORTED</span>
                <span className="text-[#252820] font-semibold">14:02 UTC (Demo)</span>
              </div>
              <div>
                <span className="text-[10px] text-[#8C8472] uppercase block">AOG STATUS</span>
                <span className="text-[#C85B43] font-bold">🔴 GROUNDED</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: AI Incident Intelligence & Classification */}
        <div className="bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(255,244,214,0.65)] rounded-xl p-4 space-y-3 shadow-lg text-[#252820]">
          <div className="flex items-center justify-between border-b border-[rgba(217,166,46,0.3)] pb-2">
            <span className="text-xs font-mono font-bold text-[#252820] uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#A87813]" />
              <span>DEFECT CATEGORY & EVIDENCE</span>
            </span>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] text-[#8C8472] font-mono">CONFIDENCE:</span>
              <span className="px-2 py-0.5 rounded bg-[rgba(217,166,46,0.18)] text-[#A87813] border border-[#D9A62E] text-[11px] font-mono font-bold">
                {Math.round(intel.confidence * 100)}%
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div>
              <span className="text-[10px] text-[#8C8472] uppercase block">DEFECT CATEGORY</span>
              <div className="text-[#252820] font-bold mt-0.5">{intel.category}</div>
            </div>

            <div>
              <span className="text-[10px] text-[#8C8472] uppercase block">OPERATIONAL IMPACT</span>
              <div className="text-[#4A483E] leading-snug mt-0.5">{intel.operational_impact}</div>
            </div>

            <div>
              <span className="text-[10px] text-[#8C8472] uppercase block mb-1">EVIDENCE ({intel.evidence.length})</span>
              <ul className="space-y-1">
                {intel.evidence.slice(0, 3).map((ev, i) => (
                  <li key={i} className="text-[11px] text-[#4A483E] flex items-start space-x-1.5">
                    <span className="text-[#A87813] shrink-0 font-bold">•</span>
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-2 rounded bg-[rgba(255,248,235,0.75)] border border-[rgba(217,166,46,0.25)]">
              <span className="text-[10px] text-[#8C8472] uppercase block">RECOMMENDATION</span>
              <span className="text-[#A87813] font-bold text-[11px]">
                Human review required before operational action.
              </span>
            </div>
          </div>
        </div>

        {/* Panel 3: Missing Information & Contributing Factors */}
        <div className="bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(255,244,214,0.65)] rounded-xl p-4 space-y-3 shadow-lg text-[#252820]">
          <div className="flex items-center justify-between border-b border-[rgba(217,166,46,0.3)] pb-2">
            <span className="text-xs font-mono font-bold text-[#252820] uppercase tracking-wider flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#A87813]" />
              <span>MISSING INFORMATION</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-[rgba(217,166,46,0.15)] text-[#A87813] border border-[#D9A62E] text-[10px] font-mono font-bold">
              VERIFICATION REQD
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div>
              <span className="text-[10px] text-[#8C8472] uppercase block mb-1">
                UNVERIFIED TELEMETRY / DATA ({intel.missing_information.length})
              </span>
              <div className="space-y-1">
                {intel.missing_information.map((item, idx) => (
                  <div key={idx} className="bg-[rgba(255,248,235,0.75)] p-1.5 rounded border border-[rgba(217,166,46,0.25)] flex items-center justify-between text-[11px]">
                    <span className="text-[#4A483E]">• {item}</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[rgba(217,166,46,0.2)] text-[#A87813] border border-[#D9A62E]">
                      Requires verification
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-1">
              <span className="text-[10px] text-[#8C8472] uppercase block mb-1">
                POTENTIAL CONTRIBUTING FACTORS
              </span>
              <ul className="space-y-1">
                {intel.contributing_factors.slice(0, showAllFactors ? undefined : 2).map((factor, i) => (
                  <li key={i} className="text-[11px] text-[#4A483E] flex items-start space-x-1.5">
                    <span className="text-[#A87813] shrink-0 font-bold">▸</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
              {intel.contributing_factors.length > 2 && (
                <button
                  onClick={() => setShowAllFactors(!showAllFactors)}
                  className="text-[10px] text-[#A87813] hover:underline mt-1 font-semibold flex items-center space-x-1 cursor-pointer"
                >
                  <span>{showAllFactors ? 'Show less' : `+${intel.contributing_factors.length - 2} more factors`}</span>
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 3. RECOVERY OPTIONS MATRIX (OPTION A, B, C) (Warm Frosted Glass Cards) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between border-b border-[rgba(217,166,46,0.3)] pb-2">
          <div className="flex items-center space-x-2">
            <h3 className="text-xs font-mono font-bold text-[#252820] uppercase tracking-wider">
              EVALUATED RECOVERY OPTIONS (OPTION A / B / C)
            </h3>
            <span className="text-[10px] font-mono text-[#8C8472]">
              • Multiple options displayed (No single absolute truth)
            </span>
          </div>
          <span className="text-[11px] text-[#4A483E] font-mono font-bold">
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
                    ? 'bg-[rgba(255,248,235,0.95)] border-2 border-[#D9A62E] shadow-xl'
                    : 'bg-[rgba(255,250,242,0.85)] border border-[rgba(217,166,46,0.3)] hover:border-[#D9A62E]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono text-[#252820] uppercase">
                      {opt.option_id.replace('_', ' ')}
                    </span>
                    {isRec ? (
                      <span className="px-2 py-0.5 rounded bg-[#D9A62E] text-[#252820] border border-[#F0C75E] text-[10px] font-mono font-bold shadow-sm">
                        RECOMMENDED #1
                      </span>
                    ) : isHighRisk ? (
                      <span className="px-2 py-0.5 rounded bg-[#C85B43]/15 text-[#C85B43] border border-[#C85B43]/30 text-[10px] font-mono font-bold">
                        CRITICAL RISK
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-[rgba(217,166,46,0.15)] text-[#A87813] border border-[rgba(217,166,46,0.3)] text-[10px] font-mono">
                        SECONDARY
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-mono font-bold text-[#252820] leading-snug">{opt.title}</h4>
                  <p className="text-[11px] font-mono text-[#4A483E] leading-snug">{opt.strategy}</p>

                  <div className="pt-2 border-t border-[rgba(217,166,46,0.2)] space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[#8C8472] text-[10px]">OPERATIONAL IMPACT:</span>
                      <span className="font-bold text-[#252820]">{opt.expected_operational_impact || 'High'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#8C8472] text-[10px]">CONFIDENCE:</span>
                      <span className="font-bold text-[#252820]">
                        {Math.round(opt.confidence * 100)}% ({opt.confidence > 0.75 ? 'High' : 'Medium'})
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#8C8472] text-[10px]">ESTIMATED WINDOW:</span>
                      <span className="font-bold text-[#252820]">{opt.estimated_recovery_window}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#8C8472] text-[10px]">ESTIMATED COST:</span>
                      <span className="font-bold text-[#252820]">${opt.total_cost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-[rgba(217,166,46,0.2)] text-[10px] font-mono">
                  {opt.risks.length > 0 && (
                    <div className="text-[#C85B43] leading-tight">
                      <strong>Dependencies: </strong>{opt.risks[0]}
                    </div>
                  )}
                  <div className="text-[#4A483E] pt-1">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[rgba(26,29,23,0.96)] border border-[rgba(255,210,100,0.35)] rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl text-[#F7F1E4] font-mono">
            <div className="flex items-center justify-between border-b border-[rgba(255,210,100,0.2)] pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-[rgba(217,166,46,0.18)] border border-[#D9A62E] text-[#F0C75E] shadow-sm">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F7F1E4] font-sans">WHY THIS RECOMMENDATION?</h3>
                  <p className="text-xs text-[#D8D0BD] font-sans">Transparent AI decision-support explanation matrix</p>
                </div>
              </div>
              <button
                onClick={() => setShowExplainabilityModal(false)}
                className="text-[#D8D0BD] hover:text-[#F7F1E4] p-1.5 rounded-lg hover:bg-[rgba(38,42,34,0.7)] text-xs font-bold transition cursor-pointer"
              >
                ✕ CLOSE
              </button>
            </div>

            {/* Evidence Considered */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#F7F1E4] uppercase tracking-wider flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#78966A]" />
                <span>EVIDENCE & FACTORS CONSIDERED:</span>
              </h4>
              <div className="bg-[rgba(30,33,26,0.75)] p-3.5 rounded-lg border border-[rgba(255,210,100,0.2)] space-y-1.5 text-xs text-[#D8D0BD]">
                {intel.why_recommendation.evidence_considered.map((ev, i) => (
                  <div key={i} className="flex items-start space-x-2">
                    <span className="text-[#78966A] shrink-0 font-bold">✓</span>
                    <span>{ev}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Not Considered Because Unavailable */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#E07A5F] uppercase tracking-wider flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-[#E07A5F]" />
                <span>UNAVAILABLE DATA (TRANSPARENT LIMITATIONS):</span>
              </h4>
              <div className="bg-[rgba(30,33,26,0.75)] p-3.5 rounded-lg border border-[rgba(255,210,100,0.2)] space-y-1.5 text-xs text-[#A8A28E]">
                {intel.why_recommendation.not_considered_unavailable.map((item, i) => (
                  <div key={i} className="flex items-start space-x-2">
                    <span className="text-[#E07A5F] shrink-0 font-bold">✕</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-[rgba(217,166,46,0.12)] border border-[rgba(217,166,46,0.3)] rounded-lg text-xs text-[#D8D0BD]">
              <strong className="text-[#F0C75E] font-semibold block mb-0.5 font-sans">AVIATION COMPLIANCE GUARANTEE:</strong>
              SQUAWK does not invent uncertified maintenance instructions or claim autonomous dispatch authority. All recovery actions require licensed human controller approval.
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowExplainabilityModal(false)}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#D9A62E] to-[#F0C75E] hover:from-[#E2B139] hover:to-[#F7D475] text-[#252820] text-xs font-bold transition border border-[#F0C75E] cursor-pointer shadow-md"
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
