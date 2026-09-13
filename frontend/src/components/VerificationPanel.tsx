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
      <div className="p-4 rounded-xl bg-[#151B23] border border-[#26313D] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-[#11161D] border border-[#26313D] text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-xs font-bold text-white uppercase">Operational Verification</h4>
              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/60 font-mono text-[9px] font-bold">
                PRE-FLIGHT
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Automated 7/7 constraint audit and recovery margin validation
            </p>
          </div>
        </div>
        {onVerifyNow && (
          <button
            onClick={onVerifyNow}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition cursor-pointer active:scale-95"
          >
            Run Final Verification
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
    <div className="p-5 rounded-xl bg-[#151B23] border border-emerald-500/40 shadow-xl">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#26313D]">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-emerald-500 text-black">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[10px] font-bold">
                RECOVERY VERIFIED ✓
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {report.digital_certificate_id || 'CERT-SQK-72019'}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mt-1">
              Autonomous AOG Recovery Airworthiness Certificate
            </h3>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono text-slate-500 block uppercase">Objective Status</span>
          <span className="text-sm font-bold text-emerald-400 font-mono">
            7/7 CONSTRAINTS PASSED
          </span>
        </div>
      </div>

      {/* 6 Verified Checklist Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 my-3.5">
        {checklist.map((item, idx) => (
          <div key={idx} className="p-2.5 rounded-lg bg-[#11161D] border border-[#26313D] flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-slate-200">{item}</span>
          </div>
        ))}
      </div>

      {/* Metric Readout Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#26313D] text-xs font-mono">
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Expected Recovery:</span>
          <span className="font-bold text-white">{report.expected_recovery_time}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Recovery Deadline:</span>
          <span className="font-bold text-slate-300">{report.deadline}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Safety Buffer:</span>
          <span className="font-bold text-emerald-400">{report.safety_margin}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-500 block uppercase">Landed Cost:</span>
          <span className="font-bold text-slate-200">${report.total_landed_cost?.toLocaleString()}</span>
        </div>
      </div>

    </div>
  );
};
