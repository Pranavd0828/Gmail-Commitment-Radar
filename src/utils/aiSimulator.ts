import type { Thread, Commitment, SuggestedAction, CommitmentStatus } from '../types';
import { SIMULATED_CURRENT_DATE } from '../data/mockData';

// Rule-based deterministic analyzer
export const analyzeThread = (thread: Thread, settings: { filterAutomated: boolean }): Commitment[] => {
  if (settings.filterAutomated && thread.category !== 'Primary') {
    return [];
  }

  const commitments: Commitment[] = [];
  let commitmentIdCounter = 1;

  thread.messages.forEach((msg, index) => {
    // Basic phrase matching rules based on PRD scenarios
    const rules = [
      {
        phrase: 'Can you send over your updated resume before the call?',
        action: 'Send updated resume to Alex',
        type: 'Ask from someone else' as const,
        owner: 'me' as const,
        recipient: 'Alex Wong',
        risk: 'High' as const,
        dueOffsetHours: 24,
        dueText: 'Tomorrow',
        draft: "Hi Alex,\n\nHere is a link to my updated resume. Looking forward to our chat tomorrow!\n\nBest,\n[Your Name]",
        suggested: [{ id: 'a1', type: 'draft_reply', label: 'Draft reply with resume', primary: true, enabled: true }]
      },
      {
        phrase: "I'll review the slides by EOD today and leave comments.",
        action: 'Sarah to review slides',
        type: 'Waiting on someone else' as const,
        owner: 'other_person' as const,
        recipient: 'Sarah Chen',
        risk: 'Medium' as const,
        dueOffsetHours: 8,
        dueText: 'Today',
        draft: null,
        suggested: [{ id: 'a2', type: 'draft_follow_up', label: 'Draft follow-up', primary: true, enabled: true }]
      },
      {
        phrase: 'I need you to update the color palette to match our brand guidelines by Friday.',
        action: 'Update color palette',
        type: 'Ask from someone else' as const,
        owner: 'me' as const,
        recipient: 'Jason Smith',
        risk: 'Medium' as const,
        dueOffsetHours: 72,
        dueText: 'Friday',
        draft: null,
        suggested: [{ id: 'a3', type: 'create_task', label: 'Add to Tasks', primary: true, enabled: true }]
      },
      {
        phrase: 'Let me know if you are coming.',
        action: 'Confirm weekend plans with Mom',
        type: 'Ask from someone else' as const,
        owner: 'me' as const,
        recipient: 'Mom',
        risk: 'Low' as const,
        dueOffsetHours: 48,
        dueText: 'This weekend',
        status: 'Review' as CommitmentStatus,
        draft: "Hi Mom,\n\nYes, I'll be coming this weekend! See you then.\n\nLove,\n[Your Name]",
        suggested: [{ id: 'a4', type: 'draft_reply', label: 'Draft reply', primary: true, enabled: true }]
      },
      {
        phrase: 'Can someone look into this immediately?',
        action: 'Investigate login page bug',
        type: 'Ask from someone else' as const,
        owner: 'me' as const,
        recipient: 'Support Team',
        risk: 'High' as const,
        dueOffsetHours: 18,
        dueText: 'Tomorrow morning',
        draft: null,
        suggested: [{ id: 'a5', type: 'create_task', label: 'Create P0 Task', primary: true, enabled: true }]
      },
      {
        phrase: "I'll book the hotels tonight and send you the confirmation numbers.",
        action: 'Mike to book hotels',
        type: 'Waiting on someone else' as const,
        owner: 'other_person' as const,
        recipient: 'Mike T',
        risk: 'Low' as const,
        dueOffsetHours: 12,
        dueText: 'Tonight',
        draft: null,
        suggested: [{ id: 'a6', type: 'draft_follow_up', label: 'Draft follow-up', primary: true, enabled: true }]
      },
      {
        phrase: 'Please fill out the patient intake forms before your arrival.',
        action: 'Fill patient intake forms',
        type: 'Ask from someone else' as const,
        owner: 'me' as const,
        recipient: 'Dr. Smith Clinic',
        risk: 'Medium' as const,
        dueOffsetHours: 144,
        dueText: 'Next Tuesday',
        draft: null,
        suggested: [{ id: 'a7', type: 'create_task', label: 'Add to Tasks', primary: true, enabled: true }]
      },
      {
        phrase: 'We should probably align on the pricing model soon.',
        action: 'Align on pricing model with David',
        type: 'Ask from someone else' as const,
        owner: 'shared' as const,
        recipient: 'David Lee',
        risk: 'Medium' as const,
        dueOffsetHours: 48,
        dueText: 'Soon',
        status: 'Review' as CommitmentStatus,
        draft: null,
        suggested: [{ id: 'a10', type: 'draft_reply', label: 'Suggest meeting times', primary: true, enabled: true }]
      }
    ];

    rules.forEach(rule => {
      if (msg.body.includes(rule.phrase) || msg.snippet.includes(rule.phrase)) {
        
        // Calculate deterministic ISO due date based on SIMULATED_CURRENT_DATE
        const dueDate = new Date(SIMULATED_CURRENT_DATE);
        dueDate.setHours(dueDate.getHours() + rule.dueOffsetHours);

        commitments.push({
          id: `${thread.id}-c${commitmentIdCounter++}`,
          thread_id: thread.id,
          message_id: msg.id,
          source_message_index: index,
          source_phrase: rule.phrase,
          normalized_action: rule.action,
          type: rule.type,
          owner_type: rule.owner,
          owner_name: rule.owner === 'me' ? 'Me' : rule.recipient,
          recipient_name: rule.recipient,
          due_date: dueDate.toISOString(),
          due_date_text: rule.dueText,
          due_date_confidence: 90,
          risk_level: rule.risk,
          confidence_score: rule.status === 'Review' ? 65 : 95,
          status: rule.status || 'Open',
          created_at: msg.sent_at,
          updated_at: msg.sent_at,
          resolved_at: null,
          snoozed_until: null,
          suggested_actions: rule.suggested as SuggestedAction[],
          draft_reply: rule.draft,
          explanation: `Detected action: "${rule.action}" with ${rule.risk} risk.`
        });
      }
    });
  });

  return commitments;
};
