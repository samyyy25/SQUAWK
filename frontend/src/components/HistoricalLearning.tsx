import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Search, 
  Filter, 
  RefreshCw, 
  Wrench, 
  ShieldCheck, 
  TrendingDown, 
  Database,
  Kanban 
} from 'lucide-react';
import { api } from '../api';
import { HistoricalLearningResponse, HistoricalCase, SquawkCase } from '../types';
import { VakhWorkspaceModal } from './VakhWorkspaceModal';

export const HistoricalLearning: React.FC = () => {
  const [data, setData] = useState<HistoricalLearningResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedVakhCase, setSelectedVakhCase] = useState<SquawkCase | null>(null);
  const [loadingVakhId, setLoadingVakhId] = useState<string | null>(null);

  const handleOpenVakhWorkspace = async (item: HistoricalCase) => {
    const caseId = item.id || item.case_id;
    if (!caseId) return;
    setLoadingVakhId(caseId);
    try {
      const fullCase = await api.getCase(caseId);
      setSelectedVakhCase(fullCase);
    } catch {
      // Fallback: construct SquawkCase from HistoricalCase
      setSelectedVakhCase({
        id: caseId,
        tail_number: item.tail_number,
        aircraft_type: item.aircraft_type,
        defect_description: item.defect_description || item.defect_category,
        location: item.location || item.airport || 'DEL',
        airport: item.airport || 'DEL',
        status: item.status || 'Resolved',
        vakh_submission_id: item.vakh_submission_id || 'vakh_sub_hist1038_del',
        vakh_record_url: 'https://vakh.com',
        vakh_form_id: 'vakh_form_aog_intake_v1',
        resolution: item.resolution ? {
          id: `res-${caseId}`,
          case_id: caseId,
          actual_resolution: item.resolution.actual_resolution,
          actual_recovery_time_hours: item.resolution.actual_recovery_time_hours,
          parts_used: item.resolution.parts_used,
          root_cause: item.resolution.root_cause,
          delay_minutes: item.resolution.delay_minutes,
          lessons_learned: item.resolution.lessons_learned,
          maintenance_team: item.resolution.maintenance_team,
          resolved_by: item.resolution.resolved_by,
          vakh_resolution_id: item.resolution.vakh_resolution_id
        } : null,
        recovery_actions_list: [],
        candidates: [],
        tool_call_history: [],
        decision_trace: [],
        scoring_weights: { delivery: 0.4, reliability: 0.25, cost: 0.15, compliance: 0.1, carbon: 0.1 }
      } as any);
    } finally {
      setLoadingVakhId(null);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const historyData = await api.getAogHistory();
      setData(historyData);
    } catch (err) {
      console.error('Error fetching historical learning data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const cases: HistoricalCase[] = data?.historical_cases || [];

  const filteredCases = cases.filter(c => {
    const caseId = (c.id || c.case_id || '').toLowerCase();
    const tailNum = (c.tail_number || '').toLowerCase();
    const acType = (c.aircraft_type || '').toLowerCase();
    const defCat = (c.defect_category || '').toLowerCase();
    const resolutionText = (c.resolution?.actual_resolution || '').toLowerCase();
    const rootCauseText = (c.resolution?.root_cause || '').toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch = 
      caseId.includes(q) ||
      tailNum.includes(q) ||
      acType.includes(q) ||
      defCat.includes(q) ||
      resolutionText.includes(q) ||
      rootCauseText.includes(q);

    const matchesCategory = selectedCategory === 'ALL' || defCat.includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 font-mono text-[#252820]">
      {/* Header Banner */}
      <div className="p-5 rounded-xl bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(255,244,214,0.65)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-[rgba(217,166,46,0.18)] border border-[#D9A62E] text-[#A87813] shadow-sm">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-[#252820] uppercase tracking-wider">
                  HISTORICAL LEARNING & INCIDENT ARCHIVE
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(217,166,46,0.15)] text-[#A87813] border border-[#D9A62E] font-bold">
                  Vakh Ground-Truth Knowledge Base
                </span>
              </div>
              <p className="text-xs text-[#4A483E] font-sans mt-0.5">
                Past AOG resolutions, actual recovery downtimes, root causes, and verified maintenance lessons learned.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button 
            onClick={fetchHistory}
            disabled={isLoading}
            className="px-3 py-1.5 rounded bg-[rgba(38,42,34,0.7)] hover:bg-[rgba(52,58,46,0.9)] text-[#F7F1E4] border border-[rgba(255,210,100,0.3)] text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#F0C75E]' : 'text-[#F0C75E]'}`} />
            <span>Refresh Archive</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(255,244,214,0.65)] space-y-1 shadow-md">
          <div className="flex items-center justify-between text-[#8C8472] text-xs font-bold">
            <span>RESOLVED INCIDENTS</span>
            <CheckCircle2 className="w-4 h-4 text-[#78966A]" />
          </div>
          <div className="text-2xl font-bold text-[#252820]">
            {data?.total_resolved_incidents || 0}
          </div>
          <div className="text-[11px] text-[#4A483E] font-sans">
            Archived with full Vakh closure records
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(255,244,214,0.65)] space-y-1 shadow-md">
          <div className="flex items-center justify-between text-[#8C8472] text-xs font-bold">
            <span>AVG RECOVERY TIME</span>
            <Clock className="w-4 h-4 text-[#A87813]" />
          </div>
          <div className="text-2xl font-bold text-[#A87813]">
            {data?.average_recovery_time_hours || 0}h
          </div>
          <div className="text-[11px] text-[#4A483E] font-sans">
            Defect intake to return-to-service
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(255,244,214,0.65)] space-y-1 shadow-md">
          <div className="flex items-center justify-between text-[#8C8472] text-xs font-bold">
            <span>TOTAL DELAY LOGGED</span>
            <TrendingDown className="w-4 h-4 text-[#A87813]" />
          </div>
          <div className="text-2xl font-bold text-[#A87813]">
            {data?.total_delay_minutes_logged || 0} min
          </div>
          <div className="text-[11px] text-[#4A483E] font-sans">
            Operational turnaround impact
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(255,244,214,0.65)] space-y-1 shadow-md">
          <div className="flex items-center justify-between text-[#8C8472] text-xs font-bold">
            <span>LEARNING ENGINE</span>
            <Database className="w-4 h-4 text-[#A87813]" />
          </div>
          <div className="text-xs font-bold text-[#547348] flex items-center space-x-1.5 pt-1">
            <span className="w-2 h-2 rounded-full bg-[#78966A] animate-pulse"></span>
            <span>GROUND-TRUTH RETRIEVAL</span>
          </div>
          <div className="text-[11px] text-[#4A483E] font-sans leading-tight">
            Case history referenced for part & tooling matching
          </div>
        </div>
      </div>

      {/* Honest Learning Mechanism Disclosure Notice */}
      <div className="p-3.5 rounded-lg bg-[rgba(217,166,46,0.12)] border border-[rgba(217,166,46,0.35)] text-xs font-sans text-[#252820] flex items-start space-x-3 shadow-sm">
        <ShieldCheck className="w-4 h-4 text-[#A87813] shrink-0 mt-0.5" />
        <div className="space-y-0.5 font-mono text-[11px]">
          <strong className="text-[#A87813]">LEARNING SYSTEM ARCHITECTURE NOTE:</strong>
          <p className="font-sans text-[#4A483E] text-xs">
            SQUAWK does not claim magical black-box learning. Historical incidents archived via Vakh form an empirical case repository: when a new AOG occurs (e.g. 737-800 hydraulic leak at DEL), SQUAWK queries historical resolutions to calibrate turnaround estimates, surface verified parts, and warn engineers of known failure modes (e.g. high-ambient O-ring hardening).
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8C8472]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by tail number, defect category, root cause, or resolution..."
            className="w-full bg-[rgba(255,250,242,0.9)] border border-[rgba(217,166,46,0.35)] rounded-lg pl-9 pr-4 py-2 text-xs text-[#252820] focus:outline-none focus:border-[#D9A62E] font-mono shadow-sm"
          />
        </div>

        <div className="flex items-center space-x-2 shrink-0 overflow-x-auto w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-[#8C8472]" />
          <span className="text-xs text-[#4A483E] font-bold">CATEGORY:</span>
          {['ALL', 'Hydraulic', 'Engine', 'Air Conditioning'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded text-xs transition cursor-pointer font-bold ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#D9A62E] to-[#F0C75E] text-[#252820] shadow-sm'
                  : 'bg-[rgba(255,250,242,0.8)] text-[#4A483E] hover:text-[#252820] border border-[rgba(217,166,46,0.25)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Cases List */}
      <div className="space-y-4">
        {isLoading && !data && (
          <div className="p-8 rounded-xl bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(217,166,46,0.25)] text-center text-[#A87813] font-mono text-xs flex items-center justify-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin text-[#D9A62E]" />
            <span>Retrieving historical incident records from operational database...</span>
          </div>
        )}

        {filteredCases.map((item, idx) => (
          <div 
            key={item.id || item.case_id || idx} 
            className="p-5 rounded-xl bg-[rgba(255,250,242,0.88)] backdrop-blur-xl border border-[rgba(217,166,46,0.25)] hover:border-[#D9A62E] transition space-y-3.5 shadow-md text-[#252820]"
          >
            <div className="flex items-center justify-between border-b border-[rgba(217,166,46,0.2)] pb-3">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-bold text-[#252820] font-mono">{item.tail_number}</span>
                <span className="text-xs text-[#8C8472]">·</span>
                <span className="text-xs text-[#4A483E] font-medium">{item.aircraft_type}</span>
                <span className="text-xs text-[#8C8472]">·</span>
                <span className="text-xs font-mono text-[#A87813] font-bold">{item.location || item.airport || 'DEL'}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#78966A]/20 text-[#4E6B42] border border-[#78966A]/40 font-bold">
                  {item.status || 'RESOLVED'}
                </span>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <span className="text-[#8C8472] font-mono">{item.id || item.case_id}</span>
                <button
                  onClick={() => handleOpenVakhWorkspace(item)}
                  disabled={loadingVakhId === (item.id || item.case_id)}
                  title="Open Vakh Operational Record Workspace"
                  className="px-2.5 py-1 rounded bg-[rgba(217,166,46,0.18)] hover:bg-[rgba(217,166,46,0.3)] text-[#A87813] hover:text-[#7C5609] border border-[rgba(217,166,46,0.4)] flex items-center space-x-1.5 font-bold transition cursor-pointer shadow-xs"
                >
                  <Kanban className={`w-3.5 h-3.5 text-[#D9A62E] ${loadingVakhId === (item.id || item.case_id) ? 'animate-spin' : ''}`} />
                  <span>Vakh Operational Record</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </button>
              </div>
            </div>

            {/* Core Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <span className="text-[#8C8472] block text-[10px] font-bold">DEFECT CATEGORY</span>
                <strong className="text-[#252820]">{item.defect_category}</strong>
              </div>

              <div>
                <span className="text-[#8C8472] block text-[10px] font-bold">RECOVERY DOWNTIME</span>
                <strong className="text-[#A87813]">
                  {item.resolution?.actual_recovery_time_hours ? `${item.resolution.actual_recovery_time_hours} Hours` : 'N/A'}
                </strong>
              </div>

              <div>
                <span className="text-[#8C8472] block text-[10px] font-bold">DELAY MINUTES</span>
                <strong className="text-[#A87813]">
                  {item.resolution?.delay_minutes ? `${item.resolution.delay_minutes} min` : '0 min'}
                </strong>
              </div>

              <div>
                <span className="text-[#8C8472] block text-[10px] font-bold">MAINTENANCE CREW</span>
                <strong className="text-[#4A483E]">
                  {item.resolution?.maintenance_team || 'Line Station Crew'}
                </strong>
              </div>
            </div>

            {/* Actual Resolution & Root Cause */}
            {item.resolution && (
              <div className="space-y-2 pt-2 border-t border-[rgba(217,166,46,0.2)] text-xs">
                <div>
                  <span className="text-[#8C8472] text-[11px] font-bold block mb-0.5">
                    ACTUAL RESOLUTION PERFORMED:
                  </span>
                  <p className="text-[#252820] font-sans leading-relaxed bg-[rgba(255,248,235,0.85)] p-2.5 rounded border border-[rgba(217,166,46,0.25)]">
                    {item.resolution.actual_resolution}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[#8C8472] text-[11px] font-bold block mb-0.5">
                      ROOT CAUSE:
                    </span>
                    <p className="text-[#4A483E] font-sans text-xs bg-[rgba(255,248,235,0.85)] p-2.5 rounded border border-[rgba(217,166,46,0.25)]">
                      {item.resolution.root_cause}
                    </p>
                  </div>

                  <div>
                    <span className="text-[#8C8472] text-[11px] font-bold block mb-0.5">
                      PARTS UTILIZED:
                    </span>
                    <div className="bg-[rgba(255,248,235,0.85)] p-2.5 rounded border border-[rgba(217,166,46,0.25)] flex flex-wrap gap-1.5">
                      {(item.resolution.parts_used || []).map((part, pidx) => (
                        <span key={pidx} className="px-1.5 py-0.5 rounded bg-[rgba(217,166,46,0.18)] text-[#A87813] text-[11px] font-mono border border-[rgba(217,166,46,0.35)] font-bold">
                          {part}
                        </span>
                      ))}
                      {(!item.resolution.parts_used || item.resolution.parts_used.length === 0) && (
                        <span className="text-[#8C8472] text-xs">No parts listed</span>
                      )}
                    </div>
                  </div>
                </div>

                {item.resolution.lessons_learned && (
                  <div>
                    <span className="text-[#A87813] text-[11px] font-bold block mb-0.5 flex items-center space-x-1">
                      <BookOpen className="w-3 h-3 text-[#A87813]" />
                      <span>LESSONS LEARNED FOR FUTURE RECOMMENDATIONS:</span>
                    </span>
                    <p className="text-[#252820] font-sans text-xs bg-[rgba(217,166,46,0.12)] p-2.5 rounded border border-[rgba(217,166,46,0.3)] leading-relaxed">
                      {item.resolution.lessons_learned}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {filteredCases.length === 0 && (
          <div className="text-center py-12 text-[#8C8472] text-xs">
            No historical records match your filter criteria.
          </div>
        )}
      </div>

      {/* Interactive Vakh Operational Record Modal */}
      {selectedVakhCase && (
        <VakhWorkspaceModal
          isOpen={!!selectedVakhCase}
          onClose={() => setSelectedVakhCase(null)}
          squawkCase={selectedVakhCase}
          onUpdateCase={(updated) => setSelectedVakhCase(updated)}
        />
      )}
    </div>
  );
};
