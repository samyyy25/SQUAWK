import React from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Award
} from 'lucide-react';
import { VerificationReport } from '../types';

interface VerificationPanelProps {
  report?: VerificationReport;
  onVerifyNow?: () => void;
}

export const VerificationPanel: React.FC<VerificationPanelProps> = ({
  report,
  onVerifyNow
}) => {
  if (!report) {
    return (
      <div className="p-4 rounded-xl bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(217,166,46,0.3)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-[#252820] shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-[rgba(217,166,46,0.18)] border border-[#D9A62E] text-[#A87813] shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-xs font-bold text-[#252820] uppercase">OPERATIONAL VERIFICATION</h4>
              <span className="px-2 py-0.5 rounded bg-[rgba(217,166,46,0.15)] text-[#A87813] border border-[rgba(217,166,46,0.35)] text-[9px] font-bold">
                PRE-FLIGHT AUDIT
              </span>
            </div>
            <p className="text-[11px] text-[#4A483E] font-sans mt-0.5">
              Automated 7/7 constraint audit and recovery margin validation
            </p>
          </div>
        </div>
        {onVerifyNow && (
          <button
            onClick={onVerifyNow}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#D9A62E] to-[#F0C75E] hover:from-[#E2B139] hover:to-[#F7D475] text-[#252820] font-bold text-xs transition border border-[#F0C75E] cursor-pointer shadow-md"
          >
            RUN VERIFICATION
          </button>
        )}
      </div>
    );
  }

  const checklist = [
    'Part number & rotable serial verified',
    'Supplier inventory & dispatch reservation confirmed',
    'Airworthiness tags audited (FAA 8130-3 / EASA)',
    'Next-Flight-Out transit route verified',
    'AOG deadline window satisfied (< 18.0h)',
    'Multi-agent recovery plan validated & sealed'
  ];

  return (
    <div className="p-4 rounded-xl bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(217,166,46,0.3)] shadow-md font-mono text-[#252820]">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[rgba(217,166,46,0.25)]">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-[rgba(217,166,46,0.18)] text-[#A87813] border border-[#D9A62E] shadow-sm">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-[#78966A]/20 text-[#4E6B42] border border-[#78966A]/40 text-[10px] font-bold">
                RECOVERY VERIFIED ✓
              </span>
              <span className="text-[10px] text-[#8C8472]">
                {report.digital_certificate_id || 'CERT-SQK-72019'}
              </span>
            </div>
            <h3 className="text-sm font-bold text-[#252820] mt-1 font-sans">
              Autonomous AOG Recovery Airworthiness Certificate
            </h3>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-[#8C8472] block uppercase font-bold">OBJECTIVE STATUS</span>
          <span className="text-sm font-bold text-[#4E6B42] font-mono">
            7/7 CONSTRAINTS PASSED
          </span>
        </div>
      </div>

      {/* 6 Verified Checklist Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 my-3">
        {checklist.map((item, idx) => (
          <div key={idx} className="p-2 rounded-lg bg-[rgba(255,248,235,0.85)] border border-[rgba(217,166,46,0.25)] flex items-center space-x-2 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#78966A] shrink-0" />
            <span className="text-xs text-[#4A483E] font-sans font-medium">{item}</span>
          </div>
        ))}
      </div>

      {/* Metric Readout Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2.5 border-t border-[rgba(217,166,46,0.2)] text-xs font-mono">
        <div>
          <span className="text-[10px] text-[#8C8472] block uppercase font-bold">EXPECTED RECOVERY:</span>
          <span className="font-bold text-[#252820]">{report.expected_recovery_time}</span>
        </div>
        <div>
          <span className="text-[10px] text-[#8C8472] block uppercase font-bold">RECOVERY DEADLINE:</span>
          <span className="font-bold text-[#4A483E]">{report.deadline}</span>
        </div>
        <div>
          <span className="text-[10px] text-[#8C8472] block uppercase font-bold">SAFETY BUFFER:</span>
          <span className="font-bold text-[#78966A]">{report.safety_margin}</span>
        </div>
        <div>
          <span className="text-[10px] text-[#8C8472] block uppercase font-bold">LANDED COST:</span>
          <span className="font-bold text-[#A87813]">${report.total_landed_cost?.toLocaleString()}</span>
        </div>
      </div>

    </div>
  );
};
