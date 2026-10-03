import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2
} from 'lucide-react';
import { ActivityLog } from '../types';
import { api } from '../api';

export const ActivityTimeline: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const data = await api.getActivity();
      setLogs(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto font-mono text-[#252820]">
      
      {/* Header */}
      <div className="p-5 rounded-xl bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(255,244,214,0.65)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div>
          <h2 className="text-base font-bold text-[#252820] flex items-center space-x-2 tracking-wide uppercase">
            <Activity className="w-4 h-4 text-[#D9A62E]" />
            <span>OPERATIONS & MULTI-AGENT AUDIT LOG</span>
          </h2>
          <p className="text-xs text-[#4A483E] font-sans mt-0.5">
            Immutable timeline of maintenance intakes, specialist computations, validator flags, and human approvals
          </p>
        </div>

        <button 
          onClick={fetchLogs}
          className="text-xs bg-[rgba(38,42,34,0.7)] hover:bg-[rgba(52,58,46,0.9)] text-[#F7F1E4] px-3.5 py-1.5 rounded-lg border border-[rgba(255,210,100,0.3)] font-bold transition cursor-pointer shadow-sm flex items-center space-x-1.5"
        >
          <span>REFRESH FEED</span>
        </button>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(217,166,46,0.3)] rounded-xl p-5 shadow-md">
        <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-[rgba(217,166,46,0.3)]">
          {logs.map((log) => {
            const date = new Date(log.timestamp);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            return (
              <div key={log.id} className="relative flex items-start space-x-3.5">
                
                {/* Dot marker */}
                <div className="w-6 h-6 rounded-full bg-[rgba(255,250,242,0.95)] border border-[#D9A62E] text-[#A87813] flex items-center justify-center text-xs font-bold shrink-0 z-10 shadow-sm">
                  {log.category === 'ACTION' ? <CheckCircle2 className="w-3.5 h-3.5 text-[#78966A]" /> :
                   log.category === 'VALIDATOR' ? <ShieldCheck className="w-3.5 h-3.5 text-[#A87813]" /> :
                   log.category === 'SPECIALIST' ? <Cpu className="w-3.5 h-3.5 text-[#D9A62E]" /> :
                   <Activity className="w-3.5 h-3.5 text-[#A87813]" />}
                </div>

                {/* Content */}
                <div className="flex-1 bg-[rgba(255,248,235,0.85)] border border-[rgba(217,166,46,0.25)] rounded-lg p-3 space-y-1 hover:border-[#D9A62E] transition shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#252820] flex items-center space-x-2">
                      <span className="font-sans font-bold">{log.title}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(217,166,46,0.15)] text-[#A87813] border border-[rgba(217,166,46,0.35)] uppercase font-mono font-bold">
                        {log.category}
                      </span>
                    </span>
                    <span className="text-[10px] text-[#8C8472] font-mono">{timeStr}</span>
                  </div>
                  {log.details && (
                    <p className="text-xs text-[#4A483E] font-sans leading-relaxed">{log.details}</p>
                  )}
                  {log.case_id && (
                    <span className="inline-block text-[10px] text-[#A87813] mt-0.5 font-bold font-mono">
                      Case: {log.case_id}
                    </span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
