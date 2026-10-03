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
    <div className="p-4 space-y-4 max-w-7xl mx-auto font-mono text-[#252820]">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[rgba(255,210,100,0.3)] pb-3">
        <div>
          <h2 className="text-base font-bold text-[#252820] flex items-center space-x-2 tracking-wide uppercase">
            <span className="text-[#D9A62E]">●</span>
            <span>PERSISTENT COMPOUNDING VENDOR MEMORY</span>
          </h2>
          <p className="text-xs text-[#52574A] font-sans mt-0.5 font-medium">
            SQUAWK closes the operational loop — updating supplier reliability scores strictly from verified physical outcomes
          </p>
        </div>

        <button 
          onClick={fetchMemory}
          className="flex items-center space-x-1.5 bg-[rgba(30,32,27,0.85)] hover:bg-[rgba(45,48,40,0.95)] text-[#F7F1E4] text-xs px-3 py-1.5 rounded border border-[rgba(255,210,100,0.3)] transition cursor-pointer shadow-sm"
        >
          <RotateCw className="w-3.5 h-3.5 text-[#F0C75E]" />
          <span>REFRESH MEMORY</span>
        </button>
      </div>

      {/* Live Interactive Learning Trigger Panel */}
      <div className="bg-[rgba(26,29,23,0.94)] border border-[rgba(255,210,100,0.35)] rounded-xl p-4 space-y-3 shadow-xl backdrop-blur-xl text-[#F7F1E4]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#F0C75E]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              OPERATIONAL OUTCOME RECORDER — VERIFIED PHYSICAL OUTCOMES UPDATE SUPPLIER MEMORY
            </h3>
          </div>
          <span className="text-[10px] font-mono bg-[rgba(217,166,46,0.18)] text-[#F0C75E] border border-[rgba(217,166,46,0.4)] px-2 py-0.5 rounded font-bold">
            MEMORY LEARNING LOOP
          </span>
        </div>

        <form onSubmit={handleSimulateOutcome} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-[10px] text-[#D8D0BD] mb-1 font-bold">TARGET SUPPLIER</label>
            <select
              value={selectedVendorId}
              onChange={e => setSelectedVendorId(e.target.value)}
              className="w-full bg-[rgba(16,18,14,0.9)] border border-[rgba(255,210,100,0.25)] rounded px-3 py-2 text-xs text-[#F7F1E4] focus:outline-none focus:border-[#D9A62E] font-medium"
            >
              {vendors.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.location_hub}) — Current: {Math.round(v.calculated_reliability * 100)}%
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-[#D8D0BD] mb-1 font-bold">PHYSICAL DELIVERY OUTCOME</label>
            <select
              value={deliveryType}
              onChange={e => setDeliveryType(e.target.value as any)}
              className="w-full bg-[rgba(16,18,14,0.9)] border border-[rgba(255,210,100,0.25)] rounded px-3 py-2 text-xs text-[#F7F1E4] focus:outline-none focus:border-[#D9A62E] font-medium"
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
              className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-[#D9A62E] to-[#F0C75E] hover:from-[#E2B139] hover:to-[#F7D475] text-[#252820] text-xs font-bold px-4 py-2.5 rounded border border-[#F0C75E] transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-[#252820]" />
                  <span>UPDATING SUPPLIER MEMORY...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-[#252820]" />
                  <span>LOG OUTCOME & RECALCULATE RELIABILITY</span>
                </>
              )}
            </button>
          </div>
        </form>

        {lastUpdateNotice && (
          <div className="p-2.5 bg-[rgba(120,150,106,0.25)] border border-[rgba(120,150,106,0.5)] rounded text-xs text-[#F7F1E4] flex items-center space-x-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-[#A0C49D] shrink-0" />
            <span>{lastUpdateNotice}</span>
          </div>
        )}
      </div>

      {/* Memory Metric Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(255,244,214,0.65)] rounded-xl p-3.5 shadow-md">
          <div className="text-[10px] text-[#616657] font-bold uppercase">TRACKED SUPPLIER HUBS</div>
          <div className="text-xl font-bold text-[#252820] mt-1">{memoryStats.length} Vendors</div>
          <div className="text-[10px] text-[#717667] mt-0.5 font-sans font-medium">DEL, BOM, SIN, FRA, DXB, ORD, DFW</div>
        </div>

        <div className="bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(255,244,214,0.65)] rounded-xl p-3.5 shadow-md">
          <div className="text-[10px] text-[#616657] font-bold uppercase">TOTAL TRACKED OUTCOMES</div>
          <div className="text-xl font-bold text-[#252820] mt-1">
            {memoryStats.reduce((acc, m) => acc + m.orders, 0)} Events
          </div>
          <div className="text-[10px] text-[#717667] mt-0.5">Historical & Verified Deliveries</div>
        </div>

        <div className="bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(255,244,214,0.65)] rounded-xl p-3.5 shadow-md">
          <div className="text-[10px] text-[#616657] font-bold uppercase">NETWORK AVG RELIABILITY</div>
          <div className="text-xl font-bold text-[#252820] mt-1">
            {memoryStats.length ? Math.round(memoryStats.reduce((acc, m) => acc + m.reliability_pct, 0) / memoryStats.length) : 92}%
          </div>
          <div className="text-[10px] text-[#717667] mt-0.5">Dynamically Computed from Outcomes</div>
        </div>
      </div>

      {/* Chart: Vendor Reliability Trends */}
      <div className="bg-[rgba(26,29,23,0.94)] border border-[rgba(255,210,100,0.35)] rounded-xl p-4 space-y-3 backdrop-blur-xl text-[#F7F1E4] shadow-xl">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-[#F0C75E]" />
          <span>SUPPLIER RELIABILITY INDEX (% VERIFIED AIRWORTHINESS & SLA COMPLIANCE)</span>
        </h3>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,210,100,0.12)" />
              <XAxis dataKey="name" stroke="#D8D0BD" fontSize={11} />
              <YAxis stroke="#D8D0BD" fontSize={11} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(26,29,23,0.96)', borderColor: '#D9A62E', borderRadius: '8px', fontSize: '11px', color: '#F7F1E4' }}
                itemStyle={{ color: '#F7F1E4' }}
              />
              <Bar dataKey="reliability" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.reliability >= 90 ? '#78966A' : (entry.reliability >= 75 ? '#D9A62E' : '#C85B43')} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vendor Reliability Table */}
      <div className="bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(255,244,214,0.65)] rounded-xl overflow-hidden shadow-lg">
        <div className="px-5 py-3 border-b border-[rgba(217,166,46,0.2)] flex items-center justify-between bg-[rgba(245,236,218,0.7)]">
          <h3 className="text-xs font-bold text-[#252820] uppercase tracking-wider">
            VERIFIED SUPPLIER PERFORMANCE SCORECARD
          </h3>
          <span className="text-[10px] text-[#616657] font-bold">DATABASE BACKED</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#252820]">
            <thead className="bg-[rgba(238,228,208,0.85)] text-[10px] uppercase tracking-wider text-[#555a4e] border-b border-[rgba(217,166,46,0.2)]">
              <tr>
                <th className="py-2.5 px-4 font-bold">VENDOR</th>
                <th className="py-2.5 px-4 font-bold">HUB</th>
                <th className="py-2.5 px-4 font-bold">ORDERS</th>
                <th className="py-2.5 px-4 font-bold">ON-TIME</th>
                <th className="py-2.5 px-4 font-bold">AVG DELAY</th>
                <th className="py-2.5 px-4 font-bold">DOC DEFECTS</th>
                <th className="py-2.5 px-4 font-bold text-right">RELIABILITY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(217,166,46,0.12)]">
              {memoryStats.map((v, i) => (
                <tr key={i} className="hover:bg-[rgba(217,166,46,0.08)] transition">
                  <td className="py-3 px-4 font-bold text-[#252820] flex items-center space-x-2">
                    <Building className="w-3.5 h-3.5 text-[#D9A62E]" />
                    <span className="font-sans font-bold">{v.vendor_name}</span>
                  </td>
                  <td className="py-3 px-4 text-[#555a4e] font-medium">{v.hub}</td>
                  <td className="py-3 px-4 text-[#252820] font-bold">{v.orders}</td>
                  <td className="py-3 px-4 text-[#252820] font-bold">{v.on_time_rate}%</td>
                  <td className="py-3 px-4 text-[#555a4e]">{v.avg_delay_min} mins</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      v.doc_defects === 0 ? 'text-[#4A723D] bg-[rgba(120,150,106,0.2)] border border-[rgba(120,150,106,0.4)]' : 'text-[#C85B43] bg-[rgba(200,91,67,0.15)] border border-[rgba(200,91,67,0.35)]'
                    }`}>
                      {v.doc_defects} issues
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold">
                    <span className="px-2 py-0.5 rounded text-[#252820] bg-[rgba(217,166,46,0.25)] border border-[#D9A62E]">
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
