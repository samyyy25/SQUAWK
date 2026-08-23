import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  Clock, 
  Plane, 
  ShieldCheck, 
  AlertCircle, 
  Cpu, 
  CheckCircle2,
  Filter
} from 'lucide-react';
import { ActivityLog } from '../types';
import { api } from '../api';

export const ActivityTimeline: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const data = await api.getActivity();
      setLogs(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>Operations & Multi-Agent Audit Log</span>
          </h2>
          <p className="text-xs text-slate-400">
            Immutable timeline of maintenance intakes, specialist computations, validator flags, and human approvals
          </p>
        </div>

        <button 
          onClick={fetchLogs}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700"
        >
          Refresh Feed
        </button>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
          {logs.map((log) => {
            const date = new Date(log.timestamp);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            return (
              <div key={log.id} className="relative flex items-start space-x-4">
                
                {/* Dot marker */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 ${
                  log.category === 'ACTION' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                  log.category === 'VALIDATOR' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' :
                  log.category === 'APPROVAL' ? 'bg-purple-950 text-purple-400 border border-purple-800' :
                  log.category === 'OUTCOME' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                  'bg-slate-800 text-slate-300 border border-slate-700'
                }`}>
                  {log.category === 'ACTION' ? <CheckCircle2 className="w-4 h-4" /> :
                   log.category === 'VALIDATOR' ? <ShieldCheck className="w-4 h-4" /> :
                   log.category === 'SPECIALIST' ? <Cpu className="w-4 h-4" /> :
                   <Activity className="w-4 h-4" />}
                </div>

                {/* Content */}
                <div className="flex-1 bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center space-x-2">
                      <span>{log.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800 uppercase">
                        {log.category}
                      </span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">{timeStr}</span>
                  </div>
                  {log.details && (
                    <p className="text-xs text-slate-300">{log.details}</p>
                  )}
                  {log.case_id && (
                    <span className="inline-block text-[10px] font-mono text-cyan-400 mt-1">
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
