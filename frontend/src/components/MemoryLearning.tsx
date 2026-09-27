import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Building, 
  CheckCircle2, 
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
    } catch (err) {
      console.error(err);
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
      notes = 'Courier delayed by 5.5 hours at intermediate sorting hub.';
    } else if (deliveryType === 'doc_defect') {
      actualHours = 4.0;
      predictedHours = 4.0;
      docAccepted = false;
      rating = 2;
      notes = 'Documentation defect: Missing authorized stamp on 8130-3 certificate.';
    }

    try {
      await api.submitOutcome('CASE-SQK-2048', {
        vendor_id: selectedVendorId,
        predicted_eta_hours: predictedHours,
        actual_delivery_hours: actualHours,
        predicted_cost: 14700,
        actual_cost: 14700,
        documentation_accepted: docAccepted,
        recovery_successful: true,
        vendor_performance_rating: rating,
        operator_notes: notes
      });

      setLastUpdateNotice(`Outcome recorded for ${vendorName}! Reliability score recalculated.`);
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
    <div className="p-4 space-y-4 max-w-7xl mx-auto bg-[#000000] font-mono text-neutral-200">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E1E1E] pb-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2 tracking-wide uppercase">
            <span className="text-[#BC0202]">●</span>
            <span>PERSISTENT COMPOUNDING VENDOR MEMORY</span>
          </h2>
          <p className="text-xs text-neutral-400 font-sans mt-0.5">
            SQUAWK closes the operational loop — updating supplier reliability scores strictly from verified physical outcomes
          </p>
        </div>

        <button 
          onClick={fetchMemory}
          className="flex items-center space-x-1.5 bg-[#080808] hover:bg-[#0D0D0D] text-neutral-300 hover:text-white text-xs px-3 py-1.5 rounded border border-[#1E1E1E] transition cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5 text-[#BC0202]" />
          <span>REFRESH MEMORY</span>
        </button>
      </div>

      {/* Live Interactive Learning Trigger Panel */}
      <div className="bg-[#000000] border border-[#830000] rounded-xl p-4 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#BC0202]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              OPERATIONAL OUTCOME RECORDER — VERIFIED PHYSICAL OUTCOMES UPDATE SUPPLIER MEMORY
            </h3>
          </div>
          <span className="text-[10px] font-mono bg-[#0D0D0D] text-white border border-[#1E1E1E] px-2 py-0.5 rounded">
            MEMORY LEARNING LOOP
          </span>
        </div>

        <form onSubmit={handleSimulateOutcome} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-[10px] text-neutral-400 mb-1 font-bold">TARGET SUPPLIER</label>
            <select
              value={selectedVendorId}
              onChange={e => setSelectedVendorId(e.target.value)}
              className="w-full bg-[#080808] border border-[#1E1E1E] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#830000] font-medium"
            >
              {vendors.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.location_hub}) — Current: {Math.round(v.calculated_reliability * 100)}%
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-neutral-400 mb-1 font-bold">PHYSICAL DELIVERY OUTCOME</label>
            <select
              value={deliveryType}
              onChange={e => setDeliveryType(e.target.value as any)}
              className="w-full bg-[#080808] border border-[#1E1E1E] rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-[#830000] font-medium"
            >
              <option value="on_time">✅ On-Time Arrival & 8130-3 Verified (+ Reliability)</option>
              <option value="delayed">⚠️ Late Delivery (5.5h Delay Penalty)</option>
              <option value="doc_defect">❌ Documentation Defect / Missing Tag (Penalty)</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-center space-x-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center space-x-2 bg-[#830000] hover:bg-[#BC0202] text-white text-xs font-bold px-4 py-2 rounded border border-[#BC0202] transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>UPDATING SUPPLIER MEMORY...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>LOG OUTCOME & RECALCULATE RELIABILITY</span>
                </>
              )}
            </button>
          </div>
        </form>

        {lastUpdateNotice && (
          <div className="p-2.5 bg-[#080808] border border-[#830000] rounded text-xs text-white flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#BC0202] shrink-0" />
            <span>{lastUpdateNotice}</span>
          </div>
        )}
      </div>

      {/* Memory Metric Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-[#000000] border border-[#830000] rounded-xl p-3.5">
          <div className="text-[10px] text-neutral-400 font-bold uppercase">TRACKED SUPPLIER HUBS</div>
          <div className="text-xl font-bold text-white mt-1">{memoryStats.length} Vendors</div>
          <div className="text-[10px] text-neutral-500 mt-0.5 font-sans">DEL, BOM, SIN, FRA, DXB, ORD, DFW</div>
        </div>

        <div className="bg-[#000000] border border-[#830000] rounded-xl p-3.5">
          <div className="text-[10px] text-neutral-400 font-bold uppercase">TOTAL TRACKED OUTCOMES</div>
          <div className="text-xl font-bold text-white mt-1">
            {memoryStats.reduce((acc, m) => acc + m.orders, 0)} Events
          </div>
          <div className="text-[10px] text-neutral-400 mt-0.5">Historical & Verified Deliveries</div>
        </div>

        <div className="bg-[#000000] border border-[#830000] rounded-xl p-3.5">
          <div className="text-[10px] text-neutral-400 font-bold uppercase">NETWORK AVG RELIABILITY</div>
          <div className="text-xl font-bold text-white mt-1">
            {memoryStats.length ? Math.round(memoryStats.reduce((acc, m) => acc + m.reliability_pct, 0) / memoryStats.length) : 92}%
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Dynamically Computed from Outcomes</div>
        </div>
      </div>

      {/* Chart: Vendor Reliability Trends */}
      <div className="bg-[#000000] border border-[#830000] rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-[#BC0202]" />
          <span>SUPPLIER RELIABILITY INDEX (% VERIFIED AIRWORTHINESS & SLA COMPLIANCE)</span>
        </h3>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E1E1E" />
              <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#000000', borderColor: '#830000', borderRadius: '4px', fontSize: '11px', color: '#FFFFFF' }}
                itemStyle={{ color: '#FFFFFF' }}
              />
              <Bar dataKey="reliability" radius={[2, 2, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.reliability >= 90 ? '#830000' : (entry.reliability >= 75 ? '#BC0202' : '#FF0000')} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vendor Reliability Table */}
      <div className="bg-[#000000] border border-[#830000] rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[#1E1E1E] flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            VERIFIED SUPPLIER PERFORMANCE SCORECARD
          </h3>
          <span className="text-[10px] text-neutral-400">DATABASE BACKED</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-[#080808] text-[10px] uppercase tracking-wider text-neutral-400 border-b border-[#1E1E1E]">
              <tr>
                <th className="py-2.5 px-4 font-semibold">VENDOR</th>
                <th className="py-2.5 px-4 font-semibold">HUB</th>
                <th className="py-2.5 px-4 font-semibold">ORDERS</th>
                <th className="py-2.5 px-4 font-semibold">ON-TIME</th>
                <th className="py-2.5 px-4 font-semibold">AVG DELAY</th>
                <th className="py-2.5 px-4 font-semibold">DOC DEFECTS</th>
                <th className="py-2.5 px-4 font-semibold text-right">RELIABILITY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1E1E]">
              {memoryStats.map((v, i) => (
                <tr key={i} className="hover:bg-[#080808] transition">
                  <td className="py-3 px-4 font-bold text-white flex items-center space-x-2">
                    <Building className="w-3.5 h-3.5 text-[#BC0202]" />
                    <span className="font-sans">{v.vendor_name}</span>
                  </td>
                  <td className="py-3 px-4 text-neutral-400">{v.hub}</td>
                  <td className="py-3 px-4 text-neutral-300">{v.orders}</td>
                  <td className="py-3 px-4 text-neutral-300">{v.on_time_rate}%</td>
                  <td className="py-3 px-4 text-neutral-300">{v.avg_delay_min} mins</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      v.doc_defects === 0 ? 'text-white bg-[#0D0D0D]' : 'text-[#FF0000] bg-[#000000] border border-[#FF0000]'
                    }`}>
                      {v.doc_defects} issues
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold">
                    <span className="px-2 py-0.5 rounded text-white bg-[#830000] border border-[#BC0202]">
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
