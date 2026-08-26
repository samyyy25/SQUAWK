import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Search, 
  FileText, 
  Truck, 
  ShieldCheck, 
  UserCheck, 
  Plane, 
  AlertTriangle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { SquawkCase } from '../types';

interface WorkflowTimelineProps {
  caseData: SquawkCase;
}

export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({ caseData }) => {
  const isApproved = caseData.status === 'Approved';
  const hasCandidates = caseData.candidates && caseData.candidates.length > 0;
  const flaggedCandidate = caseData.candidates?.find(c => c.is_flagged);
  const recommendedCand = caseData.candidates?.find(c => c.is_recommended) || caseData.candidates?.[0];

  const steps = [
    {
      id: 'ingestion',
      name: 'Defect Ingested',
      agent: 'Ingestion Webhook',
      status: 'COMPLETE',
      timestamp: '08:14:02 UTC',
      summary: `${caseData.tail_number || 'N42Q'} • ${caseData.location || 'ORD'} • Part ${caseData.part_number || 'HYD-PUMP-2901'}`,
      icon: Plane,
      color: 'text-cyan-400',
      borderColor: 'border-cyan-500',
      bgColor: 'bg-cyan-950/40'
    },
    {
      id: 'sourcing',
      name: 'Sourcing Specialist',
      agent: 'AI Sourcing Agent',
      status: 'COMPLETE',
      timestamp: '08:14:03 UTC',
      summary: `${caseData.candidates.length || 4} certified supplier candidates located across regional hubs`,
      icon: Search,
      color: 'text-blue-400',
      borderColor: 'border-blue-500',
      bgColor: 'bg-blue-950/40'
    },
    {
      id: 'docs',
      name: 'Documentation Specialist',
      agent: 'AI Docs Auditor',
      status: 'COMPLETE',
      timestamp: '08:14:03 UTC',
      summary: flaggedCandidate ? `Candidate '${flaggedCandidate.vendor_name}' flagged for missing 8130-3 airworthiness tag` : 'All candidates certified with full traceability',
      icon: FileText,
      color: 'text-amber-400',
      borderColor: 'border-amber-500',
      bgColor: 'bg-amber-950/40'
    },
    {
      id: 'logistics',
      name: 'Logistics Specialist',
      agent: 'AI Routing Engine',
      status: 'COMPLETE',
      timestamp: '08:14:04 UTC',
      summary: `Fastest viable compliant route: ${caseData.estimated_recovery_hours || 4.0} hrs to ${caseData.location || 'ORD'} gate`,
      icon: Truck,
      color: 'text-teal-400',
      borderColor: 'border-teal-500',
      bgColor: 'bg-teal-950/40'
    },
    {
      id: 'validator',
      name: 'Validator Agent',
      agent: 'AI Cross-Check Gate',
      status: 'COMPLETE',
      timestamp: '08:14:04 UTC',
      summary: `Rejected cheaper uncertified option; Recommended ${recommendedCand?.vendor_name || 'AeroParts Inc.'}`,
      icon: ShieldCheck,
      color: 'text-purple-400',
      borderColor: 'border-purple-500',
      bgColor: 'bg-purple-950/40'
    },
    {
      id: 'human',
      name: 'Human Review',
      agent: 'Tech Ops Controller',
      status: isApproved ? 'COMPLETE' : 'ACTION REQUIRED',
      timestamp: isApproved ? '08:15:30 UTC' : 'Awaiting Decision',
      summary: isApproved ? 'Capt. Marcus Vance authorized procurement & logistics dispatch' : 'Advisory recommendation ready for certified human controller sign-off',
      icon: UserCheck,
      color: isApproved ? 'text-emerald-400' : 'text-amber-400',
      borderColor: isApproved ? 'border-emerald-500' : 'border-amber-500',
      bgColor: isApproved ? 'bg-emerald-950/40' : 'bg-amber-950/40'
    },
    {
      id: 'recovery',
      name: 'Recovery Action',
      agent: 'Automated Dispatch',
      status: isApproved ? 'IN TRANSIT' : 'PENDING APPROVAL',
      timestamp: isApproved ? '08:16:00 UTC' : 'Holding Gate Standby',
      summary: isApproved ? `Courier en route to ${caseData.location || 'ORD'} gate. ETA: 4.0 hrs` : 'Dispatch queued pending certified controller sign-off',
      icon: CheckCircle2,
      color: isApproved ? 'text-emerald-400' : 'text-slate-500',
      borderColor: isApproved ? 'border-emerald-500' : 'border-slate-700',
      bgColor: isApproved ? 'bg-emerald-950/40' : 'bg-slate-900/40'
    }
  ];

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            End-to-End AOG Recovery Workflow Timeline
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          RocketRide Multi-Agent Orchestration
        </span>
      </div>

      {/* Responsive Step-by-Step Flow */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-2 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;

          return (
            <div 
              key={step.id} 
              className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 relative transition ${step.bgColor} ${step.borderColor}`}
            >
              {/* Top Step Number & Icon */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400">0{idx + 1}</span>
                <Icon className={`w-4 h-4 ${step.color}`} />
              </div>

              {/* Step Name & Agent */}
              <div>
                <div className="text-xs font-bold text-white leading-tight">{step.name}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{step.agent}</div>
              </div>

              {/* Status Badge */}
              <div className="pt-1 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[9px] font-mono">
                  <span className={`font-bold ${step.status === 'COMPLETE' ? 'text-emerald-400' : step.status === 'ACTION REQUIRED' ? 'text-amber-300 animate-pulse' : 'text-slate-400'}`}>
                    {step.status}
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 line-clamp-3 mt-1 leading-snug">
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
