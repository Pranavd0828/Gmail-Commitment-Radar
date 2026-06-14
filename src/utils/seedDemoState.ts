import { mockThreads } from '../data/mockData';
import { analyzeThread } from './aiSimulator';
import type { Commitment, Thread } from '../types';

export const seedDemoState = (
  setThreads: (threads: Thread[]) => void,
  setCommitments: (commitments: Commitment[]) => void
) => {
  setThreads(mockThreads);
  
  let allCommitments: Commitment[] = [];
  mockThreads.forEach(t => {
    // Initial analyzer run doesn't filter, so we seed everything
    allCommitments = [...allCommitments, ...analyzeThread(t, { filterAutomated: false })];
  });
  
  setCommitments(allCommitments);
};
