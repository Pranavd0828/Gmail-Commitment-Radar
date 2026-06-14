import React, { useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';
import { InboxList } from './components/inbox/InboxList';
import { ThreadView } from './components/thread/ThreadView';
import { CommitmentDashboard } from './components/dashboard/CommitmentDashboard';
import { useStore } from './store/useStore';
import { RadarPanel } from './components/radar/RadarPanel';
import { Snackbar } from './components/common/Snackbar';
import { SettingsModal } from './components/settings/SettingsModal';
import { SimulationModal } from './components/common/SimulationModal';

import { seedDemoState } from './utils/seedDemoState';

function App() {
  const { threads, setThreads, setCommitments, ui, setIsSettingsOpen } = useStore();

  useEffect(() => {
    // Only initialize mock data if it hasn't been persisted yet
    if (threads.length === 0) {
      seedDemoState(setThreads, setCommitments);
    }
  }, [threads.length, setThreads, setCommitments]);

  return (
    <>
      <AppShell>
        {ui.activeView === 'inbox' && <InboxList />}
        {ui.activeView === 'thread' && <ThreadView />}
        {ui.activeView === 'dashboard' && <CommitmentDashboard />}
        
        {/* Radar Panel only shown in inbox/thread view if open/active */}
        {ui.activeView !== 'dashboard' && <RadarPanel />}
      </AppShell>
      
      <Snackbar />
      <SettingsModal 
        isOpen={ui.isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      <SimulationModal />
    </>
  );
}

export default App;
