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
    <div className="p-4 space-y-4 max-w-7xl mx-auto bg-[#000000] font-mono text-neutral-200">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2 tracking-wide uppercase">
            <Activity className="w-4 h-4 text-[#BC0202]" />
            <span>OPERATIONS & MULTI-AGENT AUDIT LOG</span>
          </h2>
          <p className="text-xs text-neutral-400 font-sans mt-0.5">
            Immutable timeline of maintenance intakes, specialist computations, validator flags, and human approvals
          </p>
        </div>

        <button 
          onClick={fetchLogs}
          className="text-xs bg-[#080808] hover:bg-[#0D0D0D] text-neutral-300 hover:text-white px-3 py-1.5 rounded border border-[#1E1E1E] cursor-pointer"
        >
          REFRESH FEED
        </button>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-[#000000] border border-[#830000] rounded-xl p-5 shadow-xl">
        <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-[#1E1E1E]">
          {logs.map((log) => {
            const date = new Date(log.timestamp);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            return (
              <div key={log.id} className="relative flex items-start space-x-3.5">
                
                {/* Dot marker */}
                <div className="w-6 h-6 rounded bg-[#0D0D0D] border border-[#830000] text-white flex items-center justify-center text-xs font-bold shrink-0 z-10">
                  {log.category === 'ACTION' ? <CheckCircle2 className="w-3.5 h-3.5 text-[#BC0202]" /> :
                   log.category === 'VALIDATOR' ? <ShieldCheck className="w-3.5 h-3.5 text-white" /> :
                   log.category === 'SPECIALIST' ? <Cpu className="w-3.5 h-3.5 text-[#BC0202]" /> :
                   <Activity className="w-3.5 h-3.5 text-white" />}
                </div>

                {/* Content */}
                <div className="flex-1 bg-[#080808] border border-[#1E1E1E] rounded p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center space-x-2">
                      <span className="font-sans">{log.title}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#000000] text-neutral-400 border border-[#1E1E1E] uppercase">
                        {log.category}
                      </span>
                    </span>
                    <span className="text-[10px] text-neutral-500">{timeStr}</span>
                  </div>
                  {log.details && (
                    <p className="text-xs text-neutral-300 font-sans">{log.details}</p>
                  )}
                  {log.case_id && (
                    <span className="inline-block text-[10px] text-[#BC0202] mt-0.5 font-bold">
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
