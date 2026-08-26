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
import { SquawkCase } from './types';
import { api } from './api';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [cases, setCases] = useState<SquawkCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<SquawkCase | null>(null);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
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
      const updated = await api.processCase(selectedCase.id);
      setSelectedCase(updated);
      loadCases();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCaseCreated = (createdCase: SquawkCase) => {
    loadCases();
    setSelectedCase(createdCase);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0b0c0e] text-slate-200 font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* Sleek Left Sidebar */}
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
      />

      {/* Main Screen Layout with Topbar + Scrollable View */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Operations Header */}
        <Topbar 
          currentTab={currentTab}
          openIntakeModal={() => setIsIntakeOpen(true)}
        />

        {/* Scrollable Main Operations Dashboard */}
        <main className="flex-1 overflow-y-auto bg-[#0b0c0e]">
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

              {currentTab === 'vendors' && <VendorsList />}

              {currentTab === 'memory' && <MemoryLearning />}

              {currentTab === 'activity' && <ActivityTimeline />}
            </>
          )}
        </main>
      </div>

      {/* Case Intake Modal */}
      <IntakeModal 
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        onCaseCreated={handleCaseCreated}
      />

    </div>
  );
}

export default App;
