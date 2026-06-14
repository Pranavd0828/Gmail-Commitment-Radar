import { describe, it, expect, beforeEach } from 'vitest';
import { useStore, DEFAULT_SETTINGS } from '../../src/store/useStore';
import { mockThreads } from '../../src/data/mockData';

describe('useStore', () => {
  beforeEach(() => {
    // Isolate localStorage and clear the Zustand store
    localStorage.clear();
    useStore.setState({
      threads: [],
      commitments: [],
      settings: DEFAULT_SETTINGS,
      ui: {
        activeView: 'inbox',
        panelOpen: false,
        activeFilter: 'All',
        searchQuery: '',
        selectedThreadId: null,
        selectedCommitmentId: null,
        isSettingsOpen: false,
        activeDraftCommitmentId: null,
        activeSimulation: null,
      },
      snackbar: { isVisible: false, message: '' }
    });
  });

  it('resetDemoData clears data and resets settings', () => {
    // Mutate state
    useStore.setState({
      threads: [mockThreads[0]],
      settings: { ...DEFAULT_SETTINGS, filterAutomated: false }
    });

    expect(useStore.getState().threads.length).toBe(1);
    expect(useStore.getState().settings.filterAutomated).toBe(false);

    useStore.getState().resetDemoData();

    expect(useStore.getState().threads.length).toBe(0);
    expect(useStore.getState().settings.filterAutomated).toBe(true); // Back to default
  });

  it('updateCommitmentStatus supports undo functionality natively', () => {
    useStore.setState({
      commitments: [{ id: 'c1', status: 'Open' } as unknown as Commitment]
    });

    // Mark as snoozed
    useStore.getState().updateCommitmentStatus('c1', 'Snoozed');
    expect(useStore.getState().commitments[0].status).toBe('Snoozed');

    // Snackbar should be visible with undo function
    const snackbar = useStore.getState().snackbar;
    expect(snackbar.isVisible).toBe(true);
    expect(snackbar.onUndo).toBeDefined();

    // Trigger undo
    snackbar.onUndo!();
    expect(useStore.getState().commitments[0].status).toBe('Open');
  });
});
