import type { Thread, Commitment } from '../types';
import { SIMULATED_CURRENT_DATE } from '../data/mockData';

export const getAutomatedThreadIds = (threads: Thread[]): string[] => {
  return threads.filter(t => t.category !== 'Primary').map(t => t.id);
};

export const applyCommitmentVisibilitySettings = (
  commitments: Commitment[],
  threads: Thread[],
  settings: { filterAutomated: boolean; clearCompleted: boolean; showLowConfidenceReview: boolean }
): Commitment[] => {
  const automatedThreadIds = getAutomatedThreadIds(threads);
  
  return commitments.filter(c => {
    // Hide automated if setting enabled
    if (settings.filterAutomated && automatedThreadIds.includes(c.thread_id)) {
      return false;
    }
    
    // Hide completed/dismissed if setting enabled
    if (settings.clearCompleted && (c.status === 'Done' || c.status === 'Dismissed')) {
      return false;
    }
    
    // Hide low confidence review if setting enabled
    if (!settings.showLowConfidenceReview && c.status === 'Review') {
      return false;
    }
    
    return true;
  });
};

export const filterCommitmentsByRadarChip = (
  commitments: Commitment[],
  activeFilter: string
): Commitment[] => {
  switch (activeFilter) {
    case 'You owe': return commitments.filter(c => c.owner_type === 'me');
    case 'They owe': return commitments.filter(c => c.owner_type === 'other_person');
    case 'Review': return commitments.filter(c => c.status === 'Review');
    case 'Done': return commitments.filter(c => c.status === 'Done');
    case 'Due today': return commitments.filter(c => 
      c.due_date_text?.toLowerCase().includes('today') || 
      c.due_date_text?.toLowerCase().includes('hours')
    );
    case 'Overdue': return commitments.filter(c => 
      c.due_date && new Date(c.due_date).getTime() < new Date(SIMULATED_CURRENT_DATE).getTime()
    );
    default: return commitments; // 'All' or unknown
  }
};
