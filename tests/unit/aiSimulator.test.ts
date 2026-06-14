import { describe, it, expect } from 'vitest';
import { analyzeThread } from '../../src/utils/aiSimulator';
import { mockThreads } from '../../src/data/mockData';

describe('aiSimulator', () => {
  it('correctly maps a high confidence task', () => {
    const thread = mockThreads.find(t => t.id === 't1');
    if (!thread) throw new Error('Missing t1');

    const commitments = analyzeThread(thread, { filterAutomated: false });
    expect(commitments.length).toBe(1);
    expect(commitments[0].type).toBe('Ask from someone else');
    expect(commitments[0].confidence_score).toBeGreaterThan(80);
    expect(commitments[0].due_date_text).toBe('Tomorrow');
  });

  it('filters automated threads when setting is enabled', () => {
    const customThread = {
      ...mockThreads[0],
      id: 't-auto',
      category: 'Updates' as const,
    };

    const visibleCommitments = analyzeThread(customThread as unknown as Thread, { filterAutomated: true });
    expect(visibleCommitments.length).toBe(0);

    const allCommitments = analyzeThread(customThread as unknown as Thread, { filterAutomated: false });
    expect(allCommitments.length).toBe(1);
  });
});
