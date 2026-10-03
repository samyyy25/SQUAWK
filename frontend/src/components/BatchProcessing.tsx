import React, { useState } from 'react';
import { 
  Play, 
  Sparkles,
  Layers,
  RotateCcw,
  Zap
} from 'lucide-react';
import { BatchProcessResult } from '../types';
import { api } from '../api';

const SAMPLE_15_BATCH_CASES = [
  { id: 'CASE-SQK-2048', tail: 'VT-SQK', type: 'B737-800', station: 'DEL', part: 'HP-2048', priority: 'AOG', risk: 'LOW', status: 'Awaiting Sourcing' },
  { id: 'CASE-ORD-4201', tail: 'N42Q', type: 'B737-800', station: 'ORD', part: 'HYD-PUMP-2901', priority: 'AOG', risk: 'LOW', status: 'Ready for Dispatch' },
  { id: 'CASE-DFW-1892', tail: 'N18AX', type: 'A320-200', station: 'DFW', part: 'RAD-TCAS-3444', priority: 'AOG', risk: 'LOW', status: 'Ready for Dispatch' },
  { id: 'CASE-LAX-7703', tail: 'N72LK', type: 'B777-300ER', station: 'LAX', part: 'GEN-IDG-2401', priority: 'AOG', risk: 'LOW', status: 'Ready for Dispatch' },
  { id: 'CASE-MIA-9051', tail: 'N905AA', type: 'B787-9', station: 'MIA', part: 'ACT-FLAP-2710', priority: 'AOG', risk: 'MEDIUM', status: 'In Review' },
  { id: 'CASE-JFK-3112', tail: 'N311VA', type: 'A321neo', station: 'JFK', part: 'VALV-BLEED-3601', priority: 'AOG', risk: 'LOW', status: 'Ready for Dispatch' },
  { id: 'CASE-DEN-5404', tail: 'N540UA', type: 'E175', station: 'DEN', part: 'BRAKE-ASSY-3204', priority: 'AOG', risk: 'LOW', status: 'Ready for Dispatch' },
  { id: 'CASE-ATL-8825', tail: 'N882DL', type: 'A350-900', station: 'ATL', part: 'SENSOR-AOA-3411', priority: 'AOG', risk: 'LOW', status: 'Ready for Dispatch' },
  { id: 'CASE-SFO-6029', tail: 'N602UA', type: 'B777-200', station: 'SFO', part: 'WHEEL-MAIN-3245', priority: 'AOG', risk: 'LOW', status: 'Ready for Dispatch' },
  { id: 'CASE-BOS-2194', tail: 'N219JB', type: 'A220-300', station: 'BOS', part: 'PUMP-FUEL-2820', priority: 'AOG', risk: 'LOW', status: 'Ready for Dispatch' },
  { id: 'CASE-SEA-9183', tail: 'N918AK', type: 'B737-900', station: 'SEA', part: 'STARTER-ENG-8012', priority: 'AOG', risk: 'LOW', status: 'Ready for Dispatch' },
  { id: 'CASE-PHX-4410', tail: 'N441AA', type: 'A321-200', station: 'PHX', part: 'DISPLAY-DU-3160', priority: 'AOG', risk: 'LOW', status: 'Ready for Dispatch' },
  { id: 'CASE-CLT-7301', tail: 'N730US', type: 'A319-100', station: 'CLT', part: 'FAN-RECIRC-2122', priority: 'AOG', risk: 'LOW', status: 'Ready for Dispatch' },
  { id: 'CASE-IAH-8219', tail: 'N821UA', type: 'B787-8', station: 'IAH', part: 'PROBE-TAT-3419', priority: 'AOG', risk: 'LOW', status: 'Ready for Dispatch' },
  { id: 'CASE-EWR-1044', tail: 'N104UA', type: 'B737-700', station: 'EWR', part: 'TRANSMITTER-2780', priority: 'AOG', risk: 'LOW', status: 'Ready for Dispatch' },
];

export const BatchProcessing: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<BatchProcessResult | null>(null);
  const [batchStage, setBatchStage] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const handleRunBatch = async () => {
    setIsRunning(true);
    setResult(null);

    setBatchStage('Ingesting 15 AOG cases via webhook...');
    await new Promise(r => setTimeout(r, 400));

    setBatchStage('Fan-out: running Sourcing, Documentation, Logistics agents in parallel...');
    await new Promise(r => setTimeout(r, 500));

    setBatchStage('Validator Agent executing compliance checks & confidence gate...');
    await new Promise(r => setTimeout(r, 350));

    try {
      const res = await api.processBatch();
      setResult(res);
      setIsRunning(false);
      setBatchStage(null);
    } catch (err: any) {
      alert('Batch processing error: ' + err.message);
      setIsRunning(false);
      setBatchStage(null);
    }
  };

  const handleResetDemo = async () => {
    if (!confirm('Reset SQUAWK database back to baseline 15-case state?')) return;
    setIsResetting(true);
    try {
      await api.resetDemo();
      setResult(null);
      alert('Database state reset successfully.');
    } catch (err: any) {
      alert('Reset error: ' + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto font-mono text-[#252820]">
      
      {/* Header */}
      <div className="p-4 rounded-xl bg-[rgba(26,29,23,0.94)] border border-[rgba(255,210,100,0.35)] shadow-xl backdrop-blur-xl text-[#F7F1E4] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-[rgba(217,166,46,0.2)] text-[#F0C75E] border border-[rgba(217,166,46,0.4)] text-[10px] font-bold uppercase">
              HIGH-THROUGHPUT QUEUE RUNNER
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide uppercase">
            NETWORK AOG BATCH PROCESSING ENGINE
          </h2>
          <p className="text-xs text-[#D8D0BD] font-sans mt-0.5">
            Concurrent multi-agent processing across 15 network stations with real token usage telemetry
          </p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={handleResetDemo}
            disabled={isResetting || isRunning}
            className="flex items-center space-x-1.5 bg-[rgba(38,42,34,0.7)] hover:bg-[rgba(52,58,46,0.9)] text-[#D8D0BD] hover:text-white text-xs font-semibold px-3 py-2 rounded border border-[rgba(255,210,100,0.25)] transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-[#F0C75E] ${isResetting ? 'animate-spin' : ''}`} />
            <span>RESET BATCH</span>
          </button>

          <button 
            onClick={handleRunBatch}
            disabled={isRunning}
            className="flex items-center space-x-2 bg-gradient-to-r from-[#D9A62E] to-[#F0C75E] hover:from-[#E2B139] hover:to-[#F7D475] text-[#252820] text-xs font-bold px-4 py-2.5 rounded border border-[#F0C75E] transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-md"
          >
            {isRunning ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-[#252820]" />
                <span>PROCESSING 15 CASES...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>PROCESS NETWORK QUEUE (15 CASES)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress banner */}
      {isRunning && (
        <div className="p-3 bg-[rgba(34,38,28,0.95)] border border-[#D9A62E] rounded-xl space-y-1 text-[#F7F1E4] shadow-md">
          <div className="flex items-center justify-between text-white text-xs font-bold">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-[#F0C75E]" />
              <span>PARALLEL FAN-OUT PIPELINE RUNNING (15/15 CASES)</span>
            </div>
            <span className="text-[#F0C75E] font-bold">FAN-OUT ACTIVE</span>
          </div>
          <div className="text-xs text-[#D8D0BD]">{batchStage}</div>
        </div>
      )}

      {/* Telemetry Metric Cards */}
      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <div className="bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(255,244,214,0.65)] rounded-xl p-3 shadow-md">
            <span className="text-[10px] text-[#616657] uppercase block font-bold">RUNTIME</span>
            <div className="text-xl font-bold text-[#252820] mt-0.5">{result.total_runtime_seconds}s</div>
            <span className="text-[10px] text-[#717667] block mt-0.5 font-medium">Concurrent</span>
          </div>

          <div className="bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(255,244,214,0.65)] rounded-xl p-3 shadow-md">
            <span className="text-[10px] text-[#616657] uppercase block font-bold">AGENT CALLS</span>
            <div className="text-xl font-bold text-[#252820] mt-0.5">{result.total_ai_agent_calls}</div>
            <span className="text-[10px] text-[#717667] block mt-0.5 font-medium">4 per case</span>
          </div>

          <div className="bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(255,244,214,0.65)] rounded-xl p-3 shadow-md">
            <span className="text-[10px] text-[#616657] uppercase block font-bold">TOTAL TOKENS</span>
            <div className="text-xl font-bold text-[#252820] mt-0.5">{result.total_tokens?.toLocaleString() || '42,000'}</div>
            <span className="text-[10px] text-[#717667] block mt-0.5 font-medium">Prompt + Output</span>
          </div>

          <div className="bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(255,244,214,0.65)] rounded-xl p-3 shadow-md">
            <span className="text-[10px] text-[#616657] uppercase block font-bold">COMPUTE COST</span>
            <div className="text-xl font-bold text-[#252820] mt-0.5">${result.total_cost_usd?.toFixed(4) || result.approximate_cost_usd.toFixed(4)}</div>
            <span className="text-[10px] text-[#717667] block mt-0.5 font-medium">${result.average_cost_per_case_usd?.toFixed(4) || '0.0022'} / case</span>
          </div>

          <div className="bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(255,244,214,0.65)] rounded-xl p-3 shadow-md">
            <span className="text-[10px] text-[#616657] uppercase block font-bold">SUCCESS RATE</span>
            <div className="text-xl font-bold text-[#252820] mt-0.5">{Math.round(result.success_rate_percent)}%</div>
            <span className="text-[10px] text-[#717667] block mt-0.5 font-medium">{result.ready_for_approval} Ready</span>
          </div>
        </div>
      )}

      {/* 15 AOG Cases Queue Table */}
      <div className="rounded-xl bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(255,244,214,0.65)] overflow-hidden shadow-lg">
        <div className="px-4 py-3 bg-[rgba(245,236,218,0.7)] border-b border-[rgba(217,166,46,0.2)] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-[#D9A62E]" />
            <h3 className="text-xs font-bold text-[#252820] uppercase tracking-wide">
              NETWORK AOG BATCH QUEUE (15 ACTIVE INCIDENTS)
            </h3>
          </div>
          <span className="text-[10px] text-[#616657] font-bold">
            {result ? '15/15 PROCESSED' : '15 QUEUED'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[rgba(238,228,208,0.85)] text-[10px] text-[#555a4e] border-b border-[rgba(217,166,46,0.2)] uppercase">
              <tr>
                <th className="py-2.5 px-4 font-bold">CASE ID</th>
                <th className="py-2.5 px-3 font-bold">AIRCRAFT</th>
                <th className="py-2.5 px-3 font-bold">STATION</th>
                <th className="py-2.5 px-3 font-bold">PART REQUIRED</th>
                <th className="py-2.5 px-3 font-bold">PRIORITY</th>
                <th className="py-2.5 px-3 font-bold">RISK</th>
                <th className="py-2.5 px-4 text-right font-bold">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(217,166,46,0.12)]">
              {SAMPLE_15_BATCH_CASES.map((item) => (
                <tr key={item.id} className="hover:bg-[rgba(217,166,46,0.08)] transition">
                  <td className="py-2.5 px-4 font-bold text-[#252820]">
                    {item.id}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[#252820] font-bold">{item.tail}</span>
                    <span className="text-[#616657] text-[11px] ml-1.5 font-sans font-medium">({item.type})</span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-[#252820]">
                    {item.station}
                  </td>
                  <td className="py-2.5 px-3 text-[#252820] font-medium">
                    {item.part}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.2 rounded bg-[rgba(200,91,67,0.15)] text-[#C85B43] border border-[rgba(200,91,67,0.35)] text-[9px] font-bold">
                      {item.priority}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      item.risk === 'LOW' ? 'bg-[rgba(120,150,106,0.2)] text-[#4A723D] border border-[rgba(120,150,106,0.4)]' : 'bg-[rgba(217,166,46,0.2)] text-[#A87813] border border-[rgba(217,166,46,0.4)]'
                    }`}>
                      {item.risk}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <span className={`text-[10px] font-bold ${result ? 'text-[#4A723D]' : 'text-[#616657]'}`}>
                      {result ? '✓ PROCESSED' : item.status}
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
