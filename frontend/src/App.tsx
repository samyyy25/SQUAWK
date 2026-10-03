import React, { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { DashboardOverview } from './components/DashboardOverview';
import { CaseDetail } from './components/CaseDetail';
import { IntakeModal } from './components/IntakeModal';
import { CaseQueue } from './components/CaseQueue';
import { BatchProcessing } from './components/BatchProcessing';
import { MemoryLearning } from './components/MemoryLearning';
import { ActivityTimeline } from './components/ActivityTimeline';
import { VendorsList } from './components/VendorsList';
import { JudgesSafetyModal } from './components/JudgesSafetyModal';
import { HistoricalLearning } from './components/HistoricalLearning';
import { SquawkCase } from './types';
import { api } from './api';

import { ShieldCheck } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [cases, setCases] = useState<SquawkCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<SquawkCase | null>(null);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [isJudgesModalOpen, setIsJudgesModalOpen] = useState(false);
  const [activeFilterRegion, setActiveFilterRegion] = useState<string>('ALL');

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const data = await api.getCases();
      setCases(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectCase = async (caseItem: SquawkCase) => {
    try {
      const fullCase = await api.getCase(caseItem.id);
      setSelectedCase(fullCase);
    } catch (err) {
      setSelectedCase(caseItem);
    }
  };

  const handleRefreshCase = async () => {
    if (!selectedCase) return;
    try {
      const updated = await api.analyzeCase(selectedCase.id);
      setSelectedCase(updated);
      loadCases();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetDemo = async () => {
    try {
      await api.resetDemo();
      await loadCases();
      setSelectedCase(null);
      alert('SQUAWK demo database reset to pristine VT-SQK Delhi baseline.');
    } catch (err: any) {
      alert('Error resetting demo: ' + err.message);
    }
  };

  const handleCaseCreated = (createdCase: SquawkCase) => {
    loadCases();
    setSelectedCase(createdCase);
  };

  return (
    <div 
      className="flex h-screen w-screen overflow-hidden text-[#252820] font-sans selection:bg-[#D9A62E] selection:text-[#252820] relative"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(28, 31, 24, 0.40), rgba(216, 199, 165, 0.18)), url('/squawk-bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        backgroundAttachment: 'fixed',
        backgroundColor: '#D8C7A5'
      }}
    >
      
      {/* Sleek Translucent Left Sidebar */}
      <Sidebar 
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setSelectedCase(null);
        }}
        openIntakeModal={() => setIsIntakeOpen(true)}
        totalAogCount={cases.length}
        activeFilterRegion={activeFilterRegion}
        setActiveFilterRegion={setActiveFilterRegion}
        onOpenJudgesModal={() => setIsJudgesModalOpen(true)}
        onResetDemo={handleResetDemo}
      />

      {/* Main Screen Layout with Topbar + Scrollable View + Operational Footer */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden backdrop-blur-[2px]">
        
        {/* Top Operations Header */}
        <Topbar 
          currentTab={currentTab}
          openIntakeModal={() => setIsIntakeOpen(true)}
          onOpenJudgesModal={() => setIsJudgesModalOpen(true)}
          onResetDemo={handleResetDemo}
        />

        {/* Scrollable Main Operations Dashboard */}
        <main className="flex-1 overflow-y-auto bg-transparent p-4 md:p-5">
          {selectedCase ? (
            <CaseDetail 
              caseData={selectedCase}
              onBack={() => {
                setSelectedCase(null);
                loadCases();
              }}
              onRefreshCase={handleRefreshCase}
            />
          ) : (
            <>
              {currentTab === 'overview' && (
                <DashboardOverview 
                  cases={cases}
                  onSelectCase={handleSelectCase}
                  onOpenIntake={() => setIsIntakeOpen(true)}
                />
              )}

              {currentTab === 'cases' && (
                <CaseQueue 
                  cases={cases}
                  onSelectCase={handleSelectCase}
                  onOpenIntake={() => setIsIntakeOpen(true)}
                />
              )}

              {currentTab === 'batch' && <BatchProcessing />}

              {currentTab === 'history' && <HistoricalLearning />}

              {currentTab === 'vendors' && <VendorsList />}

              {currentTab === 'memory' && <MemoryLearning />}

              {currentTab === 'activity' && <ActivityTimeline />}
            </>
          )}
        </main>

        {/* Aviation Operations Footer Bar (Matching Reference Visual Style) */}
        <footer className="h-9 bg-[rgba(26,29,23,0.88)] backdrop-blur-md border-t border-[rgba(255,210,100,0.2)] px-5 flex items-center justify-between text-[11px] font-mono text-[#D8D0BD] shrink-0 select-none z-20">
          <div className="flex items-center space-x-2">
            <span className="text-[#D9A62E] font-bold tracking-wider">✈ SQUAWK</span>
            <span className="text-[#A8A28E]">|</span>
            <span className="text-neutral-300 font-semibold text-[10px]">AI AOG RECOVERY ORCHESTRATOR</span>
          </div>
          <div className="flex items-center space-x-1.5 text-neutral-300 text-[10px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#78966A]" />
            <span>Powered by Vakh · Operational Record</span>
          </div>
          <div className="hidden md:flex items-center space-x-3 text-[#A8A28E] text-[10px]">
            <span>Faster Recovery</span>
            <span>|</span>
            <span>Safer Skies</span>
            <span>|</span>
            <span>Smarter Operations</span>
          </div>
        </footer>

      </div>

      {/* Case Intake Modal */}
      <IntakeModal 
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        onCaseCreated={handleCaseCreated}
      />

      {/* Judges & Safety Guide Modal */}
      <JudgesSafetyModal 
        isOpen={isJudgesModalOpen}
        onClose={() => setIsJudgesModalOpen(false)}
      />

    </div>
  );
}

export default App;
