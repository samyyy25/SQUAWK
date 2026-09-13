import React, { useEffect, useState } from 'react';
import { 
  BrainCircuit, 
  TrendingUp, 
  ShieldCheck, 
  AlertCircle, 
  Clock, 
  Database,
  Building,
  CheckCircle2,
  Zap,
  Sparkles,
  Send,
  RotateCw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Cell
} from 'recharts';
import { VendorMemoryStat, Vendor } from '../types';
import { api } from '../api';

export const MemoryLearning: React.FC = () => {
  const [memoryStats, setMemoryStats] = useState<VendorMemoryStat[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  // Live simulation form states
  const [selectedVendorId, setSelectedVendorId] = useState<string>('VEND-GLOB-02');
  const [deliveryType, setDeliveryType] = useState<'on_time' | 'delayed' | 'doc_defect'>('on_time');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastUpdateNotice, setLastUpdateNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchMemory();
  }, []);

  const fetchMemory = async () => {
    try {
      const [res, vRes] = await Promise.all([api.getMemory(), api.getVendors()]);
      setMemoryStats(res.vendor_stats);
      setVendors(vRes);
      if (vRes.length > 0 && !selectedVendorId) {
        setSelectedVendorId(vRes[0].id);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSimulateOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLastUpdateNotice(null);

    const targetVendor = vendors.find(v => v.id === selectedVendorId) || vendors[0];
    const vendorName = targetVendor?.name || selectedVendorId;

    let actualHours = 4.0;
    let predictedHours = 4.0;
    let docAccepted = true;
    let rating = 5;
    let notes = 'Physical delivery verified on arrival.';

    if (deliveryType === 'on_time') {
      actualHours = 3.8;
      predictedHours = 4.0;
      docAccepted = true;
      rating = 5;
      notes = 'Delivered ahead of schedule with 100% compliant FAA 8130-3 tag.';
    } else if (deliveryType === 'delayed') {
      actualHours = 9.5;
      predictedHours = 4.0;
      docAccepted = true;
      rating = 3;
      notes = 'AOG Courier delayed by 5.5 hours at intermediate sorting hub.';
    } else if (deliveryType === 'doc_defect') {
      actualHours = 4.0;
      predictedHours = 4.0;
      docAccepted = false;
      rating = 2;
      notes = 'Documentation defect: Missing authorized DAR stamp on 8130-3 certificate.';
    }

    try {
      // Use existing case ID or default demo case
      await api.submitOutcome('CASE-N42Q-01', {
        vendor_id: selectedVendorId,
        predicted_eta_hours: predictedHours,
        actual_delivery_hours: actualHours,
        predicted_cost: 21100,
        actual_cost: 21100,
        documentation_accepted: docAccepted,
        recovery_successful: true,
        vendor_performance_rating: rating,
        operator_notes: notes
      });

      setLastUpdateNotice(`Outcome recorded for ${vendorName}! Reliability score recalculated via outcome_tracker.pipe.`);
      await fetchMemory();
    } catch (err: any) {
      alert('Error logging outcome: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const chartData = memoryStats.map(m => ({
    name: m.vendor_name.split(' ')[0],
    fullName: m.vendor_name,
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
            <span>Persistent Compounding Vendor Memory</span>
          </h2>
          <p className="text-xs text-slate-400">
            SQUAWK closes the operational loop — updating supplier reliability scores strictly from verified physical outcomes
          </p>
        </div>

        <button 
          onClick={fetchMemory}
          className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Refresh Memory</span>
        </button>
      </div>

      {/* Live Interactive Learning Trigger Panel */}
      <div className="bg-gradient-to-br from-[#0f172a] to-slate-900 border border-purple-900/60 rounded-2xl p-5 space-y-4 shadow-xl shadow-purple-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              OPERATIONAL OUTCOME RECORDER — Verified Outcomes Update Supplier Memory
            </h3>
          </div>
          <span className="text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded">
            outcome_tracker.pipe
          </span>
        </div>

        <form onSubmit={handleSimulateOutcome} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Target Supplier</label>
            <select
              value={selectedVendorId}
              onChange={e => setSelectedVendorId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
            >
              {vendors.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.location_hub}) — Current: {Math.round(v.calculated_reliability * 100)}%
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-semibold">Physical Delivery Outcome</label>
            <select
              value={deliveryType}
              onChange={e => setDeliveryType(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
            >
              <option value="on_time">✅ On-Time Arrival & 8130-3 Verified (+ Reliability)</option>
              <option value="delayed">⚠️ Late Delivery (5.5h Delay Penalty)</option>
              <option value="doc_defect">❌ Documentation Defect / Missing Tag (Heavy Penalty)</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-center space-x-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-purple-950/50 transition active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Updating Supplier Memory...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Log Outcome & Recalculate Reliability</span>
                </>
              )}
            </button>
          </div>
        </form>

        {lastUpdateNotice && (
          <div className="p-3 bg-purple-950/60 border border-purple-700/80 rounded-xl text-xs text-purple-200 flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{lastUpdateNotice}</span>
          </div>
        )}
      </div>

      {/* Memory Metric Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Tracked Supplier Hubs</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{memoryStats.length} Vendors</div>
          <div className="text-[10px] text-slate-500 mt-0.5">ORD, DFW, MIA, ATL, FRA, LAX, SEA, JFK</div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Total Tracked Maintenance Events</div>
          <div className="text-2xl font-bold text-purple-300 font-mono mt-1">
            {memoryStats.reduce((acc, m) => acc + m.orders, 0)} Outcomes
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Historical & Verified Operations</div>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
          <div className="text-[11px] text-slate-400 font-semibold uppercase">Network Average Reliability</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {memoryStats.length ? Math.round(memoryStats.reduce((acc, m) => acc + m.reliability_pct, 0) / memoryStats.length) : 92}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Dynamically Computed from Outcomes</div>
        </div>

      </div>

      {/* Chart: Vendor Reliability Trends */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          <span>Live Supplier Reliability Index (% Verified Airworthiness & SLA Compliance)</span>
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
              <Bar dataKey="reliability" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.reliability >= 90 ? '#10b981' : (entry.reliability >= 75 ? '#38bdf8' : '#f43f5e')} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vendor Reliability Table */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Verified Supplier Performance Scorecard
          </h3>
          <span className="text-[10px] text-slate-400 font-mono">Real PostgreSQL/SQLite backing</span>
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
                  <td className="py-3.5 px-6 text-right font-mono font-bold">
                    <span className={`px-2 py-0.5 rounded ${
                      v.reliability_pct >= 90 ? 'text-emerald-400 bg-emerald-950/40' : (v.reliability_pct >= 75 ? 'text-cyan-400 bg-cyan-950/40' : 'text-rose-400 bg-rose-950/40')
                    }`}>
                      {v.reliability_pct}%
                    </span>
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
