import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Search, 
  FileText, 
  Truck, 
  ShieldCheck, 
  UserCheck, 
  Plane
} from 'lucide-react';
import { SquawkCase } from '../types';

interface WorkflowTimelineProps {
  caseData: SquawkCase;
}

export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({ caseData }) => {
  const isApproved = caseData.status === 'Approved';
  const flaggedCandidate = caseData.candidates?.find(c => c.is_flagged);
  const recommendedCand = caseData.candidates?.find(c => c.is_recommended) || caseData.candidates?.[0];

  const steps = [
    {
      id: 'ingestion',
      name: 'Vakh Structured Intake',
      agent: 'Vakh Intake Shape',
      origin: 'VAKH',
      status: 'COMPLETE',
      timestamp: '14:02 UTC',
      summary: `${caseData.tail_number || 'VT-SQK'} • ${caseData.location || 'DEL'} • Ref: ${caseData.vakh_submission_id || 'vakh_sub_active'}`,
      icon: Plane,
      statusClass: 'text-[#547348] font-bold'
    },
    {
      id: 'sourcing',
      name: 'Sourcing Specialist',
      agent: 'AI Sourcing Agent',
      origin: 'SQUAWK AI',
      status: 'COMPLETE',
      timestamp: '14:03 UTC',
      summary: `${caseData.candidates.length || 3} certified supplier candidates located across hubs`,
      icon: Search,
      statusClass: 'text-[#547348] font-bold'
    },
    {
      id: 'docs',
      name: 'Docs Auditor',
      agent: 'AI Compliance',
      origin: 'SQUAWK AI',
      status: 'COMPLETE',
      timestamp: '14:03 UTC',
      summary: flaggedCandidate ? `Candidate '${flaggedCandidate.vendor_name}' flagged for missing 8130-3 tag` : 'Traceability & 8130-3 tags verified',
      icon: FileText,
      statusClass: 'text-[#547348] font-bold'
    },
    {
      id: 'logistics',
      name: 'Logistics Router',
      agent: 'AI Routing Engine',
      origin: 'SQUAWK AI',
      status: 'COMPLETE',
      timestamp: '14:04 UTC',
      summary: `Fastest viable compliant route: ${caseData.estimated_recovery_hours || 4.5} hrs to ${caseData.location || 'DEL'} gate`,
      icon: Truck,
      statusClass: 'text-[#547348] font-bold'
    },
    {
      id: 'validator',
      name: 'Validator Agent',
      agent: 'AI Cross-Check',
      origin: 'SQUAWK AI',
      status: 'COMPLETE',
      timestamp: '14:04 UTC',
      summary: `Rejected uncertified candidate; Recommended ${recommendedCand?.vendor_name || 'SkySupply Global'}`,
      icon: ShieldCheck,
      statusClass: 'text-[#547348] font-bold'
    },
    {
      id: 'human',
      name: 'Human Review',
      agent: 'Lead A&P Controller',
      origin: 'HUMAN LEAD',
      status: isApproved ? 'AUTHORIZED' : 'ACTION REQUIRED',
      timestamp: isApproved ? '14:09 UTC' : 'Awaiting Review',
      summary: isApproved ? 'Lead Engineer authorized procurement & logistics dispatch' : 'Advisory recommendation ready for certified human sign-off',
      icon: UserCheck,
      statusClass: isApproved ? 'text-[#547348] font-bold' : 'text-[#C85B43] font-bold'
    },
    {
      id: 'recovery',
      name: 'Vakh Operational Sync',
      agent: 'Vakh Shared Workspace',
      origin: 'VAKH ↔ SQUAWK',
      status: isApproved ? 'IN TRANSIT' : 'ACTIVE WORKSPACE',
      timestamp: isApproved ? '14:10 UTC' : 'Live Sync',
      summary: isApproved ? `Courier en route to ${caseData.location || 'DEL'} bay. ETA: 4.5 hrs` : '8-step recovery actions synchronized to Vakh board',
      icon: CheckCircle2,
      statusClass: isApproved ? 'text-[#547348] font-bold' : 'text-[#A87813] font-bold'
    }
  ];

  return (
    <div className="bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(255,244,214,0.65)] rounded-xl p-4 space-y-3 shadow-xl font-mono text-[#252820]">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-[rgba(217,166,46,0.3)] pb-2.5">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-[#A87813]" />
          <h3 className="text-xs font-bold text-[#252820] uppercase tracking-wider">
            END-TO-END AOG RECOVERY WORKFLOW TIMELINE
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[rgba(217,166,46,0.18)] text-[#A87813] border border-[#D9A62E] font-bold">
            [VAKH] ↔ [SQUAWK AI] DUAL ORIGIN TRACE
          </span>
        </div>
        <span className="text-[10px] text-[#8C8472] font-bold">
          IMMUTABLE TRACE
        </span>
      </div>

      {/* Responsive Step-by-Step Flow */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;

          return (
            <div 
              key={step.id} 
              className="p-2.5 rounded bg-[rgba(255,248,235,0.75)] border border-[rgba(217,166,46,0.25)] hover:border-[#D9A62E] flex flex-col justify-between space-y-1.5 transition text-[#252820] shadow-sm"
            >
              {/* Top Step Number & Icon */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#8C8472] font-bold">0{idx + 1}</span>
                <span className={`text-[8px] font-mono px-1 py-0.2 rounded font-bold ${
                  step.origin === 'VAKH' 
                    ? 'bg-sky-100 text-sky-800 border border-sky-300' 
                    : step.origin === 'SQUAWK AI'
                    ? 'bg-[rgba(217,166,46,0.18)] text-[#A87813] border border-[#D9A62E]'
                    : step.origin === 'HUMAN LEAD'
                    ? 'bg-[#C85B43]/15 text-[#C85B43] border border-[#C85B43]/30'
                    : 'bg-[#78966A]/20 text-[#4E6B42] border border-[#78966A]/40'
                }`}>
                  [{step.origin}]
                </span>
                <Icon className="w-3.5 h-3.5 text-[#A87813]" />
              </div>

              {/* Step Name & Agent */}
              <div>
                <div className="text-xs font-bold text-[#252820] leading-tight font-sans">{step.name}</div>
                <div className="text-[9px] text-[#8C8472] mt-0.5">{step.agent}</div>
              </div>

              {/* Status Badge */}
              <div className="pt-1 border-t border-[rgba(217,166,46,0.2)]">
                <div className="text-[9px]">
                  <span className={step.statusClass}>
                    {step.status}
                  </span>
                </div>
                <p className="text-[10px] text-[#4A483E] line-clamp-3 mt-0.5 leading-tight font-sans">
                  {step.summary}
                </p>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
