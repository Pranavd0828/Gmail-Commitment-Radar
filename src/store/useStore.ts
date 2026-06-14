import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Thread, Commitment, CommitmentStatus } from '../types';

interface SnackbarState {
  isVisible: boolean;
  message: string;
  onUndo?: () => void;
}

interface StoreState {
  threads: Thread[];
  commitments: Commitment[];
  
  ui: {
    activeView: 'inbox' | 'thread' | 'dashboard';
    panelOpen: boolean;
    activeFilter: string;
    searchQuery: string;
    selectedThreadId: string | null;
    selectedCommitmentId: string | null;
    isSettingsOpen: boolean;
    leftNavCollapsed: boolean;
    activeDraftCommitmentId: string | null;
    activeSimulation: { type: 'task' | 'calendar', commitmentId: string } | null;
  };
  
  settings: {
    showInboxBadges: boolean;
    showLowConfidenceReview: boolean;
    filterAutomated: boolean;
    clearCompleted: boolean;
  };
  
  snackbar: SnackbarState;

  // Actions
  setThreads: (threads: Thread[]) => void;
  setCommitments: (commitments: Commitment[]) => void;
  setActiveView: (view: 'inbox' | 'thread' | 'dashboard') => void;
  setPanelOpen: (isOpen: boolean) => void;
  setLeftNavCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  setActiveFilter: (filter: string) => void;
  setSearchQuery: (query: string) => void;
  selectThread: (id: string | null) => void;
  selectCommitment: (id: string | null) => void;
  setIsSettingsOpen: (isOpen: boolean) => void;
  setActiveDraftCommitmentId: (id: string | null) => void;
  setActiveSimulation: (simulation: { type: 'task' | 'calendar', commitmentId: string } | null) => void;
  updateCommitmentStatus: (id: string, status: CommitmentStatus) => void;
  updateCommitment: (id: string, partial: Partial<Commitment>) => void;
  updateSettings: (settings: Partial<StoreState['settings']>) => void;
  resetDemoData: () => void;
  
  showSnackbar: (message: string, onUndo?: () => void) => void;
  hideSnackbar: () => void;
}

export const DEFAULT_SETTINGS = {
  showInboxBadges: true,
  showLowConfidenceReview: true,
  filterAutomated: true,
  clearCompleted: false,
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      threads: [],
      commitments: [],
      
      ui: {
        activeView: 'inbox',
        panelOpen: false,
        activeFilter: 'All',
        searchQuery: '',
        selectedThreadId: null,
        selectedCommitmentId: null,
        isSettingsOpen: false,
        leftNavCollapsed: typeof window !== 'undefined' && window.innerWidth < 768,
        activeDraftCommitmentId: null,
        activeSimulation: null,
      },
      
      settings: DEFAULT_SETTINGS,
      
      snackbar: {
        isVisible: false,
        message: '',
      },

      setThreads: (threads) => set({ threads }),
      setCommitments: (commitments) => set({ commitments }),
      
      setActiveView: (view) => set((state) => ({ ui: { ...state.ui, activeView: view } })),
      setPanelOpen: (isOpen) => set((state) => ({ ui: { ...state.ui, panelOpen: isOpen } })),
      setLeftNavCollapsed: (collapsed) => set((state) => ({ 
        ui: { ...state.ui, leftNavCollapsed: typeof collapsed === 'function' ? collapsed(state.ui.leftNavCollapsed) : collapsed } 
      })),
      setActiveFilter: (filter) => set((state) => ({ ui: { ...state.ui, activeFilter: filter } })),
      setSearchQuery: (query) => set((state) => ({ ui: { ...state.ui, searchQuery: query } })),
      
      selectThread: (id) => set((state) => ({ 
        ui: { ...state.ui, selectedThreadId: id, activeView: id ? 'thread' : 'inbox' } 
      })),
      selectCommitment: (id) => set((state) => ({ ui: { ...state.ui, selectedCommitmentId: id } })),
      setIsSettingsOpen: (isOpen) => set((state) => ({ ui: { ...state.ui, isSettingsOpen: isOpen } })),
      setActiveDraftCommitmentId: (id) => set((state) => ({ ui: { ...state.ui, activeDraftCommitmentId: id } })),
      setActiveSimulation: (sim) => set((state) => ({ ui: { ...state.ui, activeSimulation: sim } })),
      
      updateCommitmentStatus: (id, status) => {
        const previousCommitment = get().commitments.find(c => c.id === id);
        if (!previousCommitment) return;
        
        const previousStatus = previousCommitment.status;
        
        set((state) => ({
          commitments: state.commitments.map(c => 
            c.id === id ? { ...c, status } : c
          )
        }));
        
        if (status === 'Done' || status === 'Dismissed' || status === 'Snoozed') {
          get().showSnackbar(`Commitment marked ${status.toLowerCase()}`, () => {
            set((state) => ({
              commitments: state.commitments.map(c => 
                c.id === id ? { ...c, status: previousStatus } : c
              )
            }));
          });
        }
      },
      updateCommitment: (id, partial) => set((state) => ({
        commitments: state.commitments.map(c => c.id === id ? { ...c, ...partial } : c)
      })),
      
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings }
      })),
      
      showSnackbar: (message, onUndo) => {
        set({ snackbar: { isVisible: true, message, onUndo } });
        setTimeout(() => {
          get().hideSnackbar();
        }, 5000);
      },
      hideSnackbar: () => set((state) => ({ snackbar: { ...state.snackbar, isVisible: false } })),
      resetDemoData: () => {
        set({ 
          threads: [], 
          commitments: [],
          settings: DEFAULT_SETTINGS
        });
      }
    }),
    {
      name: 'gmail-radar-storage',
      version: 2,
      // only persist threads, commitments, settings
      partialize: (state) => ({ 
        threads: state.threads, 
        commitments: state.commitments,
        settings: state.settings
      }),
    }
  )
);
