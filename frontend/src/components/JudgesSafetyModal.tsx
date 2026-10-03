import React from 'react';
import { 
  ShieldCheck, 
  X, 
  Users, 
  ServerCrash, 
  Database, 
  Award,
  CheckCircle2
} from 'lucide-react';

interface JudgesSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JudgesSafetyModal: React.FC<JudgesSafetyModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const faqs = [
    {
      q: "What happens if AI is wrong?",
      shortAns: "AI is decision support, not the final authority.",
      fullAns: "SQUAWK is strictly designed with Human-in-the-Loop gating. No purchase order, technician dispatch, or aircraft release can occur without explicit sign-off from a certified A&P / Part 66 engineer who reviews the AI's evidence, assumptions, and risks.",
      icon: Users
    },
    {
      q: "Where does your knowledge come from?",
      shortAns: "Production deployment uses authorized OEM docs; prototype uses simulated demo data.",
      fullAns: "A certified production deployment connects to airline-controlled AMM, IPC, and authorized vendor databases. For this hackathon prototype, SQUAWK uses controlled, clearly labelled SIMULATED DEMO DATA.",
      icon: Database
    },
    {
      q: "What happens if AI goes down?",
      shortAns: "Graceful fallback to structured defect data and manual human review.",
      fullAns: "The system never crashes or guesses. If LLM or network APIs fail, SQUAWK automatically preserves the raw defect intake, runs rule-based categorization, and flags the case for manual engineering triage.",
      icon: ServerCrash
    },
    {
      q: "Can this replace aircraft engineers or controllers?",
      shortAns: "No. It assists licensed personnel before the clock gets expensive.",
      fullAns: "SQUAWK automates fragmented data collation (searching multi-vendor inventory, computing logistics ETAs, checking 8130-3 certification tags) so human engineers can make rapid, explainable recovery decisions.",
      icon: ShieldCheck
    },
    {
      q: "Is this system aviation-certified?",
      shortAns: "No. This is a hackathon decision-support prototype.",
      fullAns: "SQUAWK does not provide certified airworthiness releases or autonomous dispatch instructions. All outputs are advisory recommendations for operations controllers.",
      icon: Award
    },
    {
      q: "How do you prevent AI hallucination?",
      shortAns: "Structured outputs, validator cross-checks, evidence mapping, and missing-data detection.",
      fullAns: "Every recommendation requires strict JSON validation, explicit evidence attribution, identification of missing telemetry ('Requires human verification'), and an AI-checking-AI validator that rejects non-compliant options.",
      icon: CheckCircle2
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto font-mono">
      <div className="bg-[rgba(26,29,23,0.96)] border-2 border-[rgba(255,210,100,0.4)] rounded-xl w-full max-w-3xl text-[#F7F1E4] shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(255,210,100,0.2)] bg-[rgba(34,38,30,0.95)]">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-[rgba(217,166,46,0.2)] border border-[#D9A62E] text-[#F0C75E]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>JUDGES & AVIATION SAFETY GOVERNANCE</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[rgba(217,166,46,0.18)] text-[#F0C75E] border border-[rgba(217,166,46,0.4)] font-bold">
                  COMPLIANCE AUDIT
                </span>
              </h2>
              <p className="text-xs text-[#D8D0BD] font-sans mt-0.5">
                Core AI safety principles, human-in-the-loop safeguards, and architecture answers
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#D8D0BD] hover:text-white p-1 rounded hover:bg-[rgba(255,210,100,0.15)] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tagline Banner */}
        <div className="px-6 py-2.5 bg-[rgba(20,22,17,0.85)] border-b border-[rgba(255,210,100,0.15)] text-xs flex items-center justify-between">
          <span className="text-[#F7F1E4] font-semibold">
            "AI suggests · Human decides · High-contrast aviation mission control."
          </span>
          <span className="text-[10px] font-mono text-[#E07A63] font-bold">
            SIMULATED DEMO DATA
          </span>
        </div>

        {/* FAQ Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[65vh] overflow-y-auto">
          {faqs.map((faq, idx) => {
            const Icon = faq.icon;
            return (
              <div key={idx} className="bg-[rgba(20,22,17,0.7)] p-3.5 rounded border border-[rgba(255,210,100,0.2)] space-y-2">
                <div className="flex items-center space-x-2">
                  <Icon className="w-4 h-4 text-[#F0C75E] shrink-0" />
                  <h3 className="text-xs font-bold text-white leading-snug">{faq.q}</h3>
                </div>

                <div className="p-2 rounded bg-[rgba(28,31,24,0.9)] border border-[rgba(217,166,46,0.4)] text-[11px] font-semibold text-[#F7F1E4]">
                  ⚡ {faq.shortAns}
                </div>

                <p className="text-[11px] text-[#D8D0BD] leading-relaxed font-sans">
                  {faq.fullAns}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-[rgba(255,210,100,0.2)] bg-[rgba(20,22,17,0.95)] text-xs text-[#D8D0BD]">
          <span>Safety guarantee: AI is advisory; final authority is certified human engineering.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded bg-gradient-to-r from-[#D9A62E] to-[#F0C75E] hover:from-[#E2B139] hover:to-[#F7D475] text-[#252820] font-bold transition text-xs border border-[#F0C75E] cursor-pointer shadow-md"
          >
            UNDERSTOOD
          </button>
        </div>

      </div>
    </div>
  );
};
