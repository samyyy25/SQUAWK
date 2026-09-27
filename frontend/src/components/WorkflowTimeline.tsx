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
      name: 'Defect Ingested',
      agent: 'Ingestion Webhook',
      status: 'COMPLETE',
      timestamp: '14:02 UTC',
      summary: `${caseData.tail_number || 'VT-SQK'} • ${caseData.location || 'DEL'} • Part ${caseData.part_number || 'HP-2048'}`,
      icon: Plane,
      statusClass: 'text-white'
    },
    {
      id: 'sourcing',
      name: 'Sourcing Specialist',
      agent: 'AI Sourcing Agent',
      status: 'COMPLETE',
      timestamp: '14:03 UTC',
      summary: `${caseData.candidates.length || 3} certified supplier candidates located across hubs`,
      icon: Search,
      statusClass: 'text-white'
    },
    {
      id: 'docs',
      name: 'Docs Auditor',
      agent: 'AI Compliance',
      status: 'COMPLETE',
      timestamp: '14:03 UTC',
      summary: flaggedCandidate ? `Candidate '${flaggedCandidate.vendor_name}' flagged for missing 8130-3 tag` : 'Traceability & 8130-3 tags verified',
      icon: FileText,
      statusClass: 'text-white'
    },
    {
      id: 'logistics',
      name: 'Logistics Router',
      agent: 'AI Routing Engine',
      status: 'COMPLETE',
      timestamp: '14:04 UTC',
      summary: `Fastest viable compliant route: ${caseData.estimated_recovery_hours || 4.5} hrs to ${caseData.location || 'DEL'} gate`,
      icon: Truck,
      statusClass: 'text-white'
    },
    {
      id: 'validator',
      name: 'Validator Agent',
      agent: 'AI Cross-Check',
      status: 'COMPLETE',
      timestamp: '14:04 UTC',
      summary: `Rejected uncertified candidate; Recommended ${recommendedCand?.vendor_name || 'SkySupply Global'}`,
      icon: ShieldCheck,
      statusClass: 'text-white'
    },
    {
      id: 'human',
      name: 'Human Review',
      agent: 'Lead A&P Controller',
      status: isApproved ? 'AUTHORIZED' : 'ACTION REQUIRED',
      timestamp: isApproved ? '14:09 UTC' : 'Awaiting Review',
      summary: isApproved ? 'Lead Engineer authorized procurement & logistics dispatch' : 'Advisory recommendation ready for certified human sign-off',
      icon: UserCheck,
      statusClass: isApproved ? 'text-white font-bold' : 'text-[#BC0202] font-bold'
    },
    {
      id: 'recovery',
      name: 'Recovery Action',
      agent: 'Automated Dispatch',
      status: isApproved ? 'IN TRANSIT' : 'PENDING APPROVAL',
      timestamp: isApproved ? '14:10 UTC' : 'Holding Standby',
      summary: isApproved ? `Courier en route to ${caseData.location || 'DEL'} bay. ETA: 4.5 hrs` : 'Dispatch queued pending certified controller sign-off',
      icon: CheckCircle2,
      statusClass: isApproved ? 'text-white font-bold' : 'text-neutral-500'
    }
  ];

  return (
    <div className="bg-[#000000] border border-[#830000] rounded-xl p-4 space-y-3 shadow-xl font-mono">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-2.5">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-[#BC0202]" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            END-TO-END AOG RECOVERY WORKFLOW TIMELINE
          </h3>
        </div>
        <span className="text-[10px] text-[#BC0202] font-bold">
          SIMULATED DEMO TIMELINE
        </span>
      </div>

      {/* Responsive Step-by-Step Flow */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
        {steps.map((step, idx) => {
          const Icon = step.icon;

          return (
            <div 
              key={step.id} 
              className="p-2.5 rounded bg-[#080808] border border-[#1E1E1E] hover:border-[#830000] flex flex-col justify-between space-y-1.5 transition"
            >
              {/* Top Step Number & Icon */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-neutral-500 font-bold">0{idx + 1}</span>
                <Icon className="w-3.5 h-3.5 text-[#BC0202]" />
              </div>

              {/* Step Name & Agent */}
              <div>
                <div className="text-xs font-bold text-white leading-tight font-sans">{step.name}</div>
                <div className="text-[9px] text-neutral-400 mt-0.5">{step.agent}</div>
              </div>

              {/* Status Badge */}
              <div className="pt-1 border-t border-[#1E1E1E]">
                <div className="text-[9px]">
                  <span className={step.statusClass}>
                    {step.status}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400 line-clamp-3 mt-0.5 leading-tight font-sans">
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
