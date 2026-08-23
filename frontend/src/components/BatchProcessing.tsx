import React, { useState } from 'react';
import { 
  Radio, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Coins, 
  HelpCircle, 
  Zap, 
  Sparkles,
  Layers
} from 'lucide-react';
import { BatchProcessResult } from '../types';
import { api } from '../api';

export const BatchProcessing: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<BatchProcessResult | null>(null);
  const [batchStage, setBatchStage] = useState<string | null>(null);

  const handleRunBatch = async () => {
    setIsRunning(true);
    setResult(null);

    setBatchStage('Ingesting 15 AOG cases from daily operations queue...');
    await new Promise(r => setTimeout(r, 600));

    setBatchStage('Executing RocketRide source_recovery pipelines across specialist workers...');
    await new Promise(r => setTimeout(r, 700));

    setBatchStage('Running Validator Agent cross-checks and conflict detection...');
    await new Promise(r => setTimeout(r, 600));

    try {
      const res = await api.processBatch();
      setResult(res);
      setIsRunning(false);
      setBatchStage(null);
    } catch (err: any) {
      alert('Batch error: ' + err.message);
      setIsRunning(false);
      setBatchStage(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Radio className="w-5 h-5 text-emerald-400" />
            <span>High-Throughput Batch Processing Engine</span>
          </h2>
          <p className="text-xs text-slate-400">
            Process entire airline network AOG queues concurrently using RocketRide multi-agent pipelines
          </p>
        </div>

        <button 
          onClick={handleRunBatch}
          disabled={isRunning}
          className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-950/50 transition active:scale-95 disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Processing Queue...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Process Today's AOG Queue</span>
            </>
          )}
        </button>
      </div>

      {/* Progress banner */}
      {isRunning && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-2xl space-y-2 animate-pulse">
          <div className="flex items-center space-x-2 text-emerald-300 text-xs font-bold">
            <Zap className="w-4 h-4 text-emerald-400 animate-bounce" />
            <span>15 Cases Received — RocketRide Multi-Agent Parallel Pipeline In Progress</span>
          </div>
          <div className="text-xs text-emerald-200 font-mono">{batchStage}</div>
        </div>
      )}

      {/* Telemetry Metric Cards */}
      {result && (
        <div className="space-y-6 animate-in fade-in zoom-in duration-300">
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            
            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Total Runtime</div>
              <div className="text-xl font-bold text-white font-mono mt-1">{result.total_runtime_seconds}s</div>
              <div className="text-[10px] text-emerald-400 font-mono mt-0.5">High Concurrency</div>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Total AI Calls</div>
              <div className="text-xl font-bold text-cyan-300 font-mono mt-1">{result.total_ai_agent_calls}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Specialists + Validator</div>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Approx Compute Cost</div>
              <div className="text-xl font-bold text-emerald-300 font-mono mt-1">${result.approximate_cost_usd}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">~$0.021 / case</div>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Human Escalated</div>
              <div className="text-xl font-bold text-amber-300 font-mono mt-1">{result.escalated_to_humans}</div>
              <div className="text-[10px] text-amber-400 font-mono mt-0.5">Safety & Tagging Flags</div>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-4">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Pipeline Success Rate</div>
              <div className="text-xl font-bold text-cyan-400 font-mono mt-1">{result.success_rate_percent}%</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Zero unhandled crashes</div>
            </div>

          </div>

          {/* Outcome Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Automated Processing Breakdown</span>
              </h3>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg">
                  <span className="text-slate-300 font-medium">Successfully Processed</span>
                  <span className="font-mono font-bold text-emerald-400">{result.successfully_processed}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg">
                  <span className="text-slate-300 font-medium">Ready for Human Approval</span>
                  <span className="font-mono font-bold text-cyan-400">{result.ready_for_approval}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg">
                  <span className="text-slate-300 font-medium">Total Cases Received</span>
                  <span className="font-mono font-bold text-white">{result.total_cases_received}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Deterministic Escalations & Exceptions Handled</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg">
                  <span className="text-slate-300 font-medium">Need More Information (Gated)</span>
                  <span className="font-mono font-bold text-amber-400">{result.need_more_info}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg">
                  <span className="text-slate-300 font-medium">Documentation Conflicts Detected</span>
                  <span className="font-mono font-bold text-red-400">{result.documentation_conflicts}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg">
                  <span className="text-slate-300 font-medium">Simulated Vendor Search Timeouts</span>
                  <span className="font-mono font-bold text-orange-400">{result.vendor_search_timeouts}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg">
                  <span className="text-slate-300 font-medium">Malformed Inputs (Missing Identifier)</span>
                  <span className="font-mono font-bold text-purple-400">{result.malformed_inputs}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {!result && !isRunning && (
        <div className="p-12 text-center bg-[#0f172a] border border-slate-800 rounded-2xl space-y-3">
          <Layers className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">Ready to execute batch queue</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click "Process Today's AOG Queue" to orchestrate parallel sourcing, documentation verification, and validator risk gating across all 15 active cases.
          </p>
        </div>
      )}

    </div>
  );
};
