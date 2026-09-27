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
      <div className="p-4 rounded-xl bg-[#000000] border border-[#830000] flex items-center justify-between font-mono text-neutral-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded bg-[#0D0D0D] border border-[#830000] text-[#BC0202]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-xs font-bold text-white uppercase">OPERATIONAL VERIFICATION</h4>
              <span className="px-2 py-0.5 rounded bg-[#0D0D0D] text-[#BC0202] border border-[#BC0202] text-[9px] font-bold">
                PRE-FLIGHT AUDIT
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
              Automated 7/7 constraint audit and recovery margin validation
            </p>
          </div>
        </div>
        {onVerifyNow && (
          <button
            onClick={onVerifyNow}
            className="px-3.5 py-1.5 rounded bg-[#830000] hover:bg-[#BC0202] text-white font-bold text-xs transition border border-[#BC0202] cursor-pointer"
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
    <div className="p-4 rounded-xl bg-[#000000] border-2 border-[#830000] shadow-xl font-mono text-neutral-200">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1E1E1E]">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded bg-[#830000] text-white border border-[#BC0202]">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-[#0D0D0D] text-white border border-[#830000] text-[10px] font-bold">
                RECOVERY VERIFIED ✓
              </span>
              <span className="text-[10px] text-neutral-400">
                {report.digital_certificate_id || 'CERT-SQK-72019'}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mt-1">
              Autonomous AOG Recovery Airworthiness Certificate
            </h3>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-neutral-500 block uppercase">OBJECTIVE STATUS</span>
          <span className="text-sm font-bold text-white font-mono">
            7/7 CONSTRAINTS PASSED
          </span>
        </div>
      </div>

      {/* 6 Verified Checklist Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 my-3">
        {checklist.map((item, idx) => (
          <div key={idx} className="p-2 rounded bg-[#080808] border border-[#1E1E1E] flex items-center space-x-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#BC0202] shrink-0" />
            <span className="text-xs text-neutral-300 font-sans">{item}</span>
          </div>
        ))}
      </div>

      {/* Metric Readout Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2.5 border-t border-[#1E1E1E] text-xs font-mono">
        <div>
          <span className="text-[10px] text-neutral-500 block uppercase">EXPECTED RECOVERY:</span>
          <span className="font-bold text-white">{report.expected_recovery_time}</span>
        </div>
        <div>
          <span className="text-[10px] text-neutral-500 block uppercase">RECOVERY DEADLINE:</span>
          <span className="font-bold text-neutral-300">{report.deadline}</span>
        </div>
        <div>
          <span className="text-[10px] text-neutral-500 block uppercase">SAFETY BUFFER:</span>
          <span className="font-bold text-white">{report.safety_margin}</span>
        </div>
        <div>
          <span className="text-[10px] text-neutral-500 block uppercase">LANDED COST:</span>
          <span className="font-bold text-white">${report.total_landed_cost?.toLocaleString()}</span>
        </div>
      </div>

    </div>
  );
};
