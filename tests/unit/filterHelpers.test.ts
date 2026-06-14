import { describe, it, expect } from 'vitest';
import {
  getAutomatedThreadIds,
  applyCommitmentVisibilitySettings,
  filterCommitmentsByRadarChip
} from '../../src/utils/filterHelpers';
import type { Thread, Commitment } from '../../src/types';

describe('filterHelpers', () => {
  const mockThreads: Partial<Thread>[] = [
    { id: 't1', category: 'Primary' },
    { id: 't2', category: 'Updates' },
    { id: 't3', category: 'Promotions' }
  ];

  const mockCommitments: Partial<Commitment>[] = [
    { id: 'c1', thread_id: 't1', status: 'Open', owner_type: 'me', due_date_text: 'Tomorrow' },
    { id: 'c2', thread_id: 't2', status: 'Review', owner_type: 'other_person', due_date_text: 'Next week' },
    { id: 'c3', thread_id: 't1', status: 'Done', owner_type: 'me', due_date_text: 'Today' }
  ];

  it('getAutomatedThreadIds returns non-primary thread IDs', () => {
    const ids = getAutomatedThreadIds(mockThreads as Thread[]);
    expect(ids).toEqual(['t2', 't3']);
  });

  it('applyCommitmentVisibilitySettings hides automated emails when configured', () => {
    const visible = applyCommitmentVisibilitySettings(
      mockCommitments as Commitment[],
      mockThreads as Thread[],
      { filterAutomated: true, clearCompleted: false, showLowConfidenceReview: true }
    );
    expect(visible.map(c => c.id)).toEqual(['c1', 'c3']);
  });

  it('applyCommitmentVisibilitySettings hides completed items when configured', () => {
    const visible = applyCommitmentVisibilitySettings(
      mockCommitments as Commitment[],
      mockThreads as Thread[],
      { filterAutomated: false, clearCompleted: true, showLowConfidenceReview: true }
    );
    expect(visible.map(c => c.id)).toEqual(['c1', 'c2']);
  });

  it('filterCommitmentsByRadarChip filters correctly', () => {
    const youOwe = filterCommitmentsByRadarChip(mockCommitments as Commitment[], 'You owe');
    expect(youOwe.map(c => c.id)).toEqual(['c1', 'c3']);

    const review = filterCommitmentsByRadarChip(mockCommitments as Commitment[], 'Review');
    expect(review.map(c => c.id)).toEqual(['c2']);
  });
});
