import React from 'react';
import { 
  Plane, 
  MapPin, 
  Clock, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  CheckCircle2, 
  ChevronRight,
  Plus,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Building,
  UserCheck,
  Layers,
  ArrowUpRight,
  SlidersHorizontal
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { SquawkCase } from '../types';

interface DashboardOverviewProps {
  cases: SquawkCase[];
  onSelectCase: (caseItem: SquawkCase) => void;
  onOpenIntake: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  cases,
  onSelectCase,
  onOpenIntake
}) => {
  const totalAog = cases.length;
  const activeRecovery = cases.filter(c => c.status === 'Processing' || c.status === 'Awaiting Approval').length;
  const awaitingHumanCases = cases.filter(c => c.status === 'Awaiting Approval' || c.status === 'Needs Review');
  const criticalCases = cases.filter(c => c.priority === 'AOG');

  // 24H recovery operations curve mock data
  const recoveryHourlyData = [
    { hour: '00:00', ops: 3, grounded: 4 },
    { hour: '03:00', ops: 2, grounded: 5 },
    { hour: '06:00', ops: 6, grounded: 7 },
    { hour: '09:00', ops: 12, grounded: 10 },
    { hour: '12:00', ops: 15, grounded: 12 },
    { hour: '15:00', ops: 19, grounded: 15 },
    { hour: '18:00', ops: 14, grounded: 11 },
    { hour: '21:00', ops: 8, grounded: 7 },
  ];

  // Priority Attention Cases for Command Center Top Section
  const priorityAttentionCases = cases.slice(0, 4);


  // Active flight / AOG recovery tracking records (Simulated courier & aircraft network)
  const liveAogTracking = [
    {
      flightNo: 'SK0142',
      aircraft: 'N42Q',
      type: 'Boeing 737-800',
      origin: 'LHR',
      dest: 'ORD',
      status: 'AOG Recovery',
      stage: 'Human Approval',
      eta: '4.0 hrs',
      progress: 82,
      isHero: true,
      caseId: 'CASE-N42Q-01',
      supplier: 'AeroParts Inc.',
      risk: 'LOW'
    },
    {
      flightNo: 'SK0078',
      aircraft: 'N18AX',
      type: 'Airbus A320-200',
      origin: 'CDG',
      dest: 'DFW',
      status: 'In Sourcing',
      stage: 'Logistics Hot-Shot',
      eta: '6.0 hrs',
      progress: 42,
      isHero: false,
      caseId: 'CASE-N18AX-03',
      supplier: 'Midwest Aero Supply',
      risk: 'LOW'
    },
    {
      flightNo: 'SK0911',
      aircraft: 'N72LK',
      type: 'Boeing 777-300ER',
      origin: 'ICN',
      dest: 'LAX',
      status: 'Needs Review',
      stage: 'Doc Tag Check',
      eta: '8.0 hrs',
      progress: 25,
      isHero: false,
      caseId: 'CASE-N72LK-07',
      supplier: 'Pacific Aero Hub',
      risk: 'HIGH'
    },
    {
      flightNo: 'SK0517',
      aircraft: 'N882DL',
      type: 'Airbus A350-900',
      origin: 'AMS',
      dest: 'ATL',
      status: 'Dispatched',
      stage: 'Part In Transit',
      eta: '7.0 hrs',
      progress: 88,
      isHero: false,
      caseId: 'CASE-N882DL-02',
      supplier: 'EuroRotable Spares',
      risk: 'LOW'
    }
  ];

  return (
    <div className="p-6 space-y-6 bg-[#0b0c0e] min-h-full">
      
      {/* ========================================================================= */}
      {/* TASK 1: TOP PRIORITY COMMAND CENTER SECTION: CRITICAL AOG ATTENTION */}
      {/* ========================================================================= */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1e2025] pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-red-950/80 border border-red-800/80 text-red-400">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white tracking-wider uppercase">Critical AOG Attention</h2>
                <span className="px-2 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800/80 text-[10px] font-mono font-bold">
                  {awaitingHumanCases.length > 0 ? `${awaitingHumanCases.length} Action Required` : 'Active Command Deck'}
                </span>
              </div>
              <p className="text-xs text-slate-400">Cases requiring tech ops controller review, validator triage, or dispatch authorization</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-[11px] text-slate-400 font-mono hidden md:inline">Core principle:</span>
            <span className="px-2 py-1 rounded-md bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 font-semibold text-[11px] flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>AI Suggests. Human Decides.</span>
            </span>
          </div>
        </div>

        {/* Priority Action Deck Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
          {priorityAttentionCases.map((caseItem, idx) => {
            const isHero = caseItem.tail_number === 'N42Q' || idx === 0;
            const recommendedCand = caseItem.candidates?.find(c => c.is_recommended) || caseItem.candidates?.[0];
            const isHumanApproval = caseItem.status === 'Awaiting Approval' || caseItem.current_stage === 'Human Approval' || isHero;
            const isApproved = caseItem.status === 'Approved';

            return (
              <div
                key={caseItem.id}
                onClick={() => onSelectCase(caseItem)}
                className={`group rounded-2xl border p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  isHero
                    ? 'bg-gradient-to-b from-[#181d26] to-[#121418] border-cyan-500/60 shadow-xl shadow-cyan-950/30 ring-1 ring-cyan-500/40 hover:border-cyan-400'
                    : isHumanApproval
                    ? 'bg-[#14161a] border-amber-800/60 hover:border-amber-600/80'
                    : 'bg-[#14161a] border-[#20232b] hover:border-slate-700'
                }`}
              >
                {/* Hero Glow Accent */}
                {isHero && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-2xl rounded-full pointer-events-none" />
                )}

                {/* Top Badge Strip */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-white bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700">
                        {caseItem.tail_number || 'N42Q'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {caseItem.location || 'ORD'}
                      </span>
                    </div>

                    {isHumanApproval ? (
                      <span className="flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-700/80 animate-pulse">
                        <UserCheck className="w-3 h-3" />
                        <span>APPROVAL REQUIRED</span>
                      </span>
                    ) : isApproved ? (
                      <span className="flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>RECOVERY AUTHORIZED</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {caseItem.status}
                      </span>
                    )}
                  </div>

                  {/* Aircraft Type & Defect */}
                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-400 font-medium">
                      {caseItem.aircraft_type || 'Boeing 737-800'}
                    </div>
                    <div className="text-xs font-bold text-slate-100 line-clamp-2 leading-snug group-hover:text-cyan-300 transition">
                      {caseItem.defect_description || 'System A Engine-Driven Hydraulic Pump Failure'}
                    </div>
                  </div>
                </div>

                {/* Mid Metric & Recommendation Details */}
                <div className="mt-3.5 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2 bg-[#0d0f12]/80 p-2 rounded-xl border border-slate-800/60 font-mono text-[11px]">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Recommended</span>
                      <span className="font-semibold text-white truncate block">
                        {recommendedCand?.vendor_name || 'AeroParts Inc.'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Recovery ETA</span>
                      <span className="font-bold text-cyan-300">
                        {caseItem.estimated_recovery_hours || recommendedCand?.estimated_eta_hours || 4.0} hrs
                      </span>
                    </div>
                  </div>

                  {/* Stage & Risk pill */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center space-x-1">
                      <span>Stage:</span>
                      <strong className="text-cyan-400 font-medium">{caseItem.current_stage || 'Human Approval'}</strong>
                    </span>
                    <span className={`font-mono font-bold text-[10px] px-1.5 py-0.2 rounded ${
                      caseItem.risk_level === 'LOW' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' : 'bg-red-950 text-red-400 border border-red-800/60'
                    }`}>
                      {caseItem.risk_level || 'LOW'} RISK
                    </span>
                  </div>
                </div>

                {/* Bottom Action Trigger */}
                <div className="mt-3 pt-2 flex items-center justify-between text-xs text-cyan-400 font-semibold group-hover:translate-x-0.5 transition">
                  <span className="text-[11px]">Open Case Decision</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* OPERATIONAL METRICS & SLA STATUS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Card 1 */}
        <div className="bg-[#14161a] border border-[#20232b] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Plane className="w-4 h-4 -rotate-45" />
              </div>
              <span>Active AOG Recoveries</span>
            </div>
            <span className="flex items-center space-x-1 text-[11px] font-semibold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/60 font-mono">
              <Sparkles className="w-3 h-3" />
              <span>Simulated</span>
            </span>
          </div>

          <div className="mt-3 flex items-end justify-between">
            <div className="text-3xl font-bold text-white font-mono">{activeRecovery || 4}</div>
            <div className="flex items-end space-x-0.5 h-6">
              <span className="w-1 h-2 bg-slate-700 rounded-sm"></span>
              <span className="w-1 h-3 bg-slate-700 rounded-sm"></span>
              <span className="w-1 h-2.5 bg-slate-700 rounded-sm"></span>
              <span className="w-1 h-4 bg-cyan-500 rounded-sm"></span>
              <span className="w-1 h-5 bg-cyan-400 rounded-sm"></span>
              <span className="w-1 h-6 bg-cyan-300 rounded-sm"></span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#14161a] border border-[#20232b] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span>Cases Within Recovery SLA</span>
            </div>
            <span className="flex items-center space-x-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
              <TrendingUp className="w-3 h-3" />
              <span>Target &lt; 6h</span>
            </span>
          </div>

          <div className="mt-3 flex items-end justify-between">
            <div className="text-3xl font-bold text-white font-mono">93.4%</div>
            <div className="flex items-end space-x-0.5 h-6">
              <span className="w-1 h-4 bg-slate-700 rounded-sm"></span>
              <span className="w-1 h-5 bg-slate-700 rounded-sm"></span>
              <span className="w-1 h-5 bg-slate-700 rounded-sm"></span>
              <span className="w-1 h-6 bg-emerald-500 rounded-sm"></span>
              <span className="w-1 h-6 bg-emerald-400 rounded-sm"></span>
              <span className="w-1 h-6 bg-emerald-300 rounded-sm"></span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#14161a] border border-[#20232b] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <Plane className="w-4 h-4" />
              </div>
              <span>Network Grounded Cases</span>
            </div>
            <span className="flex items-center space-x-1 text-[11px] font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/60">
              <span>{totalAog} total</span>
            </span>
          </div>

          <div className="mt-3 flex items-end justify-between">
            <div className="text-3xl font-bold text-white font-mono">{totalAog}</div>
            <div className="flex items-end space-x-0.5 h-6">
              <span className="w-1 h-3 bg-slate-700 rounded-sm"></span>
              <span className="w-1 h-4 bg-slate-700 rounded-sm"></span>
              <span className="w-1 h-5 bg-blue-500 rounded-sm"></span>
              <span className="w-1 h-6 bg-blue-400 rounded-sm"></span>
              <span className="w-1 h-5 bg-blue-400 rounded-sm"></span>
              <span className="w-1 h-4 bg-blue-300 rounded-sm"></span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-[#14161a] border border-[#20232b] rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                <Clock className="w-4 h-4" />
              </div>
              <span>Average Recovery ETA</span>
            </div>
            <span className="flex items-center space-x-1 text-[11px] font-semibold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/60">
              <TrendingDown className="w-3 h-3" />
              <span>Simulated</span>
            </span>
          </div>

          <div className="mt-3 flex items-end justify-between">
            <div className="text-3xl font-bold text-white font-mono">3.8 <span className="text-sm font-normal text-slate-400">hrs</span></div>
            <div className="flex items-end space-x-0.5 h-6">
              <span className="w-1 h-6 bg-slate-700 rounded-sm"></span>
              <span className="w-1 h-5 bg-slate-700 rounded-sm"></span>
              <span className="w-1 h-4 bg-purple-500 rounded-sm"></span>
              <span className="w-1 h-3 bg-purple-400 rounded-sm"></span>
              <span className="w-1 h-2 bg-purple-300 rounded-sm"></span>
              <span className="w-1 h-1.5 bg-purple-200 rounded-sm"></span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: World Map / Traffic + Active Flights Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Dark World Map with Flight Arcs (2 Cols) */}
        <div className="lg:col-span-2 bg-[#14161a] border border-[#20232b] rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between min-h-[380px]">
          
          {/* Header */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
                <Plane className="w-4 h-4 -rotate-45" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Simulated Global AOG & Parts Courier Network</h3>
                <div className="text-[10px] text-slate-400">9 active aircraft & expedited supply routes in flight</div>
              </div>
            </div>

            <button 
              onClick={() => {
                const heroCase = cases.find(c => c.tail_number === 'N42Q') || cases[0];
                if (heroCase) onSelectCase(heroCase);
              }}
              className="flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold bg-cyan-950/50 border border-cyan-800/60 px-2.5 py-1 rounded-lg transition"
            >
              <span>Inspect Hero N42Q</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Realistic Stylized Dark Vector World Map with Arcs */}
          <div className="my-3 relative flex-1 flex items-center justify-center min-h-[260px] select-none">
            <svg viewBox="0 0 900 450" className="w-full h-full opacity-80">
              <defs>
                <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#818cf8" stopOpacity="1" />
                  <stop offset="100%" stopColor="#c084fc" stopOpacity="0.8" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* Simplified Dark Continents outlines */}
              <path d="M150,90 Q180,70 230,80 Q270,110 250,160 Q210,180 160,170 Q130,130 150,90 Z" fill="#1c2029" stroke="#252a36" strokeWidth="1" />
              <path d="M190,200 Q240,210 250,270 Q240,360 210,380 Q180,310 170,240 Z" fill="#1c2029" stroke="#252a36" strokeWidth="1" />
              <path d="M430,70 Q510,60 540,110 Q500,160 450,140 Q410,120 430,70 Z" fill="#1c2029" stroke="#252a36" strokeWidth="1" />
              <path d="M430,170 Q510,170 520,260 Q490,340 440,320 Q400,240 430,170 Z" fill="#1c2029" stroke="#252a36" strokeWidth="1" />
              <path d="M570,80 Q760,70 800,150 Q750,220 620,180 Q570,140 570,80 Z" fill="#1c2029" stroke="#252a36" strokeWidth="1" />
              <path d="M680,280 Q760,270 780,340 Q710,380 670,330 Z" fill="#1c2029" stroke="#252a36" strokeWidth="1" />

              {/* Major Hubs */}
              {/* JFK */}
              <circle cx="230" cy="140" r="4" fill="#38bdf8" filter="url(#glow)" />
              <text x="220" y="155" fill="#64748b" fontSize="9" fontFamily="monospace">JFK</text>

              {/* ORD (Hero Hub) */}
              <circle cx="210" cy="135" r="5" fill="#f43f5e" filter="url(#glow)" />
              <circle cx="210" cy="135" r="9" fill="none" stroke="#f43f5e" strokeWidth="1" className="animate-ping" opacity="0.6" />
              <text x="195" y="125" fill="#f43f5e" fontWeight="bold" fontSize="10" fontFamily="monospace">ORD (AOG N42Q)</text>

              {/* LHR (London) */}
              <circle cx="450" cy="105" r="4" fill="#38bdf8" filter="url(#glow)" />
              <text x="440" y="95" fill="#94a3b8" fontSize="9" fontFamily="monospace">EUROPE LHR</text>

              {/* DXB (Dubai) */}
              <circle cx="560" cy="180" r="4" fill="#38bdf8" filter="url(#glow)" />
              <text x="565" y="185" fill="#64748b" fontSize="9" fontFamily="monospace">DXB</text>

              {/* SIN (Singapore) */}
              <circle cx="700" cy="240" r="4" fill="#38bdf8" filter="url(#glow)" />
              <text x="705" y="245" fill="#64748b" fontSize="9" fontFamily="monospace">SIN</text>

              {/* Arcs / Flight Routes */}
              {/* LHR to JFK */}
              <path d="M 450 105 Q 330 60 230 140" fill="none" stroke="url(#routeGrad)" strokeWidth="1.8" strokeDasharray="5,3" />
              {/* LHR to ORD (Hero Arc) */}
              <path d="M 450 105 Q 310 40 210 135" fill="none" stroke="#38bdf8" strokeWidth="2.2" />
              {/* DXB to LHR */}
              <path d="M 560 180 Q 500 130 450 105" fill="none" stroke="url(#routeGrad)" strokeWidth="1.5" strokeDasharray="4,2" />
              {/* DXB to SIN */}
              <path d="M 560 180 Q 630 200 700 240" fill="none" stroke="url(#routeGrad)" strokeWidth="1.5" strokeDasharray="4,2" />

              {/* Moving Airplane Marker on Hero Route */}
              <g transform="translate(320, 68) rotate(-165)">
                <path d="M 0,-6 L 4,6 L 0,4 L -4,6 Z" fill="#ffffff" filter="url(#glow)" />
              </g>

              {/* Moving Airplane Marker 2 */}
              <g transform="translate(505, 140) rotate(-140)">
                <path d="M 0,-6 L 4,6 L 0,4 L -4,6 Z" fill="#38bdf8" />
              </g>

              {/* Moving Airplane Marker 3 */}
              <g transform="translate(630, 210) rotate(25)">
                <path d="M 0,-6 L 4,6 L 0,4 L -4,6 Z" fill="#c084fc" />
              </g>
            </svg>
          </div>

          {/* Bottom Map Subtext */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-[#1e2025] pt-2 z-10">
            <span>© SQUAWK Operations GIS Map Provider</span>
            <span className="text-cyan-400 font-mono">Live Sync: 0.8s latency</span>
          </div>

        </div>

        {/* Right Sidebar: Active Flights / AOG Queue List (1 Col) */}
        <div className="bg-[#14161a] border border-[#20232b] rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
              En Route
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <h3 className="text-sm font-bold text-white">Active AOG Dispatches</h3>
              <span className="text-xs font-mono text-cyan-400 font-semibold">9 live</span>
            </div>
          </div>

          {/* List of active recovery records */}
          <div className="space-y-3 flex-1 overflow-y-auto">
            {liveAogTracking.map((flight, idx) => (
              <div 
                key={idx}
                onClick={() => {
                  const matched = cases.find(c => c.tail_number === flight.aircraft) || cases[0];
                  if (matched) onSelectCase(matched);
                }}
                className={`p-3 rounded-xl border transition cursor-pointer ${
                  flight.isHero 
                    ? 'bg-[#1a202c] border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30' 
                    : 'bg-[#111317] border-[#1f2229] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 font-bold text-white font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{flight.flightNo}</span>
                    <span className="text-[10px] text-slate-400 font-normal">({flight.aircraft})</span>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-300 font-semibold">{flight.eta}</span>
                </div>

                {/* Origin to Destination */}
                <div className="flex items-center justify-between text-xs text-slate-300 font-medium mt-2">
                  <span>{flight.origin}</span>
                  <div className="flex-1 mx-2 flex items-center">
                    <div className="h-px bg-slate-700 flex-1"></div>
                    <Plane className="w-3 h-3 text-cyan-400 mx-1" />
                    <div className="h-px bg-slate-700 flex-1"></div>
                  </div>
                  <span>{flight.dest}</span>
                </div>

                {/* Progress Bar */}
                <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${flight.isHero ? 'bg-cyan-400' : 'bg-indigo-500'}`}
                    style={{ width: `${flight.progress}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 font-mono">
                  <span>Stage: {flight.stage}</span>
                  <span>{flight.progress}% complete</span>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={onOpenIntake}
            className="w-full py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-lg shadow-red-950/40"
          >
            <Plus className="w-4 h-4" />
            <span>Ingest New AOG Defect</span>
          </button>
        </div>

      </div>

      {/* Bottom Grid: 24H Recoveries Chart + Next Maintenance Windows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Departures / Recoveries by Hour Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-[#14161a] border border-[#20232b] rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                Traffic 24H
              </div>
              <h3 className="text-xs font-bold text-white flex items-center space-x-2">
                <span>AOG Dispatches & Fleet Turnaround by Hour</span>
              </h3>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono">
              <span className="text-emerald-400 font-bold">562 ops</span>
              <span className="text-slate-500">peak 15:00</span>
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={recoveryHourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOps" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGrounded" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="#475569" fontSize={10} />
                <YAxis stroke="#475569" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#14161a', borderColor: '#2d333f', fontSize: '11px', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="ops" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorOps)" name="Resolved Turnarounds" />
                <Area type="monotone" dataKey="grounded" stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="3 3" fillOpacity={1} fill="url(#colorGrounded)" name="Grounded Defects" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Next Maintenance Windows (1 Col) */}
        <div className="bg-[#14161a] border border-[#20232b] rounded-2xl p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between border-b border-[#20232b] pb-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-white">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Next Maintenance Windows</span>
            </div>
            <span className="text-[10px] uppercase font-mono text-slate-500">Next 30 Days</span>
          </div>

          <div className="space-y-2.5">
            <div className="p-3 bg-[#111317] border border-[#1e2025] rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono font-bold text-[10px]">
                  B737
                </span>
                <div>
                  <div className="font-bold text-white">SK-ANTARES</div>
                  <div className="text-[10px] text-slate-400 font-mono">Boeing 737 MAX 8</div>
                </div>
              </div>
              <div className="text-right font-mono text-[11px] text-amber-400 font-semibold">
                ⏳ In 0d
                <div className="text-[10px] text-slate-500">Apr 27</div>
              </div>
            </div>

            <div className="p-3 bg-[#111317] border border-[#1e2025] rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono font-bold text-[10px]">
                  B738
                </span>
                <div>
                  <div className="font-bold text-white">SK-ORION</div>
                  <div className="text-[10px] text-slate-400 font-mono">Boeing 737-800 (N42Q)</div>
                </div>
              </div>
              <div className="text-right font-mono text-[11px] text-amber-400 font-semibold">
                ⏳ In 1d
                <div className="text-[10px] text-slate-500">Apr 29</div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono text-center">
            Synchronized with TechOps Planning DB
          </div>
        </div>

      </div>

    </div>
  );
};
