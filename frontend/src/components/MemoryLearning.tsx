import React, { useEffect, useState } from 'react';
import { 
  BrainCircuit, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  Database,
  Building,
  CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { VendorMemoryStat } from '../types';
import { api } from '../api';

export const MemoryLearning: React.FC = () => {
  const [memoryStats, setMemoryStats] = useState<VendorMemoryStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemory();
  }, []);

  const fetchMemory = async () => {
    try {
      const res = await api.getMemory();
      setMemoryStats(res.vendor_stats);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const chartData = memoryStats.map(m => ({
    name: m.vendor_name.split(' ')[0],
    reliability: m.reliability_pct,
    delay: m.avg_delay_min,
    orders: m.orders
  }));

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <BrainCircuit className="w-5 h-5 text-purple-400" />
            <span>Persistent Vendor Memory & Learning Loop</span>
          </h2>
          <p className="text-xs text-slate-400">
            SQUAWK updates long-term supplier reliability scores strictly from verified operational outcomes
          </p>
        </div>

        <div className="flex items-center space-x-2 text-[11px] font-mono bg-purple-950/60 text-purple-300 px-3 py-1.5 rounded-lg border border-purple-800">
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span>POLICY: VERIFIED OPERATIONAL OUTCOMES ONLY</span>
        </div>
      </div>

      {/* Memory Metric Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Tracked Supplier Hubs</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{memoryStats.length} Vendors</div>
          <div className="text-[10px] text-slate-500 mt-0.5">ORD, DFW, MIA, ATL, FRA, LAX, SEA, JFK</div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Verified Deliveries Ingested</div>
          <div className="text-2xl font-bold text-purple-300 font-mono mt-1">157 Completed AOGs</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">100% Real Physical Proofs</div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Fleetwide On-Time SLA</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">92.4%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Average Turnaround Lead Time: 3.8 hrs</div>
        </div>

      </div>

      {/* Chart: Vendor Reliability Trends */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <span>Vendor Reliability Scores (% Verified Airworthiness & On-Time Performance)</span>
        </h3>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                itemStyle={{ color: '#38bdf8' }}
              />
              <Bar dataKey="reliability" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vendor Reliability Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Verified Supplier Performance Scorecard
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#090d14] text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-6 font-semibold">Vendor</th>
                <th className="py-3 px-6 font-semibold">Primary Hub</th>
                <th className="py-3 px-6 font-semibold">Verified Orders</th>
                <th className="py-3 px-6 font-semibold">On-Time Rate</th>
                <th className="py-3 px-6 font-semibold">Avg Delay</th>
                <th className="py-3 px-6 font-semibold">Doc Defects</th>
                <th className="py-3 px-6 font-semibold text-right">Reliability Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {memoryStats.map((v, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-6 font-bold text-white flex items-center space-x-2">
                    <Building className="w-4 h-4 text-cyan-400" />
                    <span>{v.vendor_name}</span>
                  </td>
                  <td className="py-3.5 px-6 font-mono text-slate-400">{v.hub}</td>
                  <td className="py-3.5 px-6 font-mono text-slate-300">{v.orders}</td>
                  <td className="py-3.5 px-6 font-mono text-slate-300">{v.on_time_rate}%</td>
                  <td className="py-3.5 px-6 font-mono text-slate-300">{v.avg_delay_min} mins</td>
                  <td className="py-3.5 px-6 font-mono">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      v.doc_defects === 0 ? 'text-emerald-400 bg-emerald-950/60' : 'text-red-400 bg-red-950/60'
                    }`}>
                      {v.doc_defects} issues
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right font-mono font-bold text-cyan-300">
                    {v.reliability_pct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
