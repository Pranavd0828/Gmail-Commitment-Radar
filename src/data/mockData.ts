import type { Thread, Message } from '../types';

export const SIMULATED_CURRENT_DATE = '2026-06-15T09:00:00Z';

const generateDate = (offsetHours: number) => {
  const date = new Date(SIMULATED_CURRENT_DATE);
  date.setHours(date.getHours() + offsetHours);
  return date.toISOString();
};

const createMessage = (partial: Partial<Message>): Message => ({
  id: '',
  thread_id: '',
  sender_name: '',
  sender_email: '',
  recipients: [],
  sent_at: generateDate(0),
  body: '',
  snippet: '',
  is_from_user: false,
  attachments: [],
  detected_phrases: [],
  ...partial
});

const createThread = (partial: Omit<Partial<Thread>, 'messages'> & { messages?: Partial<Message>[] }): Thread => {
  const { messages, ...rest } = partial;
  return {
    id: '',
    subject: '',
    participants: [],
    last_message_at: generateDate(0),
    unread: false,
    starred: false,
    labels: [],
    category: 'Primary',
    has_attachment: false,
    ...rest,
    messages: messages?.map(m => createMessage(m)) || []
  };
};

export const mockThreads: Thread[] = [
  createThread({
    id: 't1',
    subject: 'Interview preparation call',
    participants: [{ name: 'Alex Wong', email: 'alex.w@example.com' }],
    last_message_at: generateDate(-2),
    unread: true,
    starred: false,
    category: 'Primary',
    has_attachment: false,
    messages: [
      {
        id: 'm1',
        thread_id: 't1',
        sender_name: 'Alex Wong',
        sender_email: 'alex.w@example.com',
        sent_at: generateDate(-2),
        body: `Hi there,\nLooking forward to our chat tomorrow. Can you send over your updated resume before the call?\n\nThanks,\nAlex`,
        snippet: 'Can you send over your updated resume before the call?'
      }
    ]
  }),
  createThread({
    id: 't2',
    subject: 'Q3 Roadmap Review',
    participants: [{ name: 'Sarah Chen', email: 'sarah.c@company.com' }],
    last_message_at: generateDate(-24),
    unread: false,
    starred: true,
    category: 'Primary',
    has_attachment: true,
    messages: [
      {
        id: 'm2',
        thread_id: 't2',
        sender_name: 'Sarah Chen',
        sender_email: 'sarah.c@company.com',
        sent_at: generateDate(-24),
        body: `Hey,\nI've attached the latest draft. I'll review the slides by EOD today and leave comments.\n\nLet me know if you need anything else.`,
        snippet: "I'll review the slides by EOD today and leave comments."
      }
    ]
  }),
  createThread({
    id: 't3',
    subject: 'Feedback on new design',
    participants: [{ name: 'Jason Smith', email: 'jason.s@client.com' }],
    last_message_at: generateDate(-48),
    unread: false,
    starred: false,
    category: 'Primary',
    has_attachment: false,
    messages: [
      {
        id: 'm3',
        thread_id: 't3',
        sender_name: 'Jason Smith',
        sender_email: 'jason.s@client.com',
        sent_at: generateDate(-48),
        body: `Thanks for sending this over. The layout looks good, but the colors are off.\n\nI need you to update the color palette to match our brand guidelines by Friday.\n\nBest,\nJason`,
        snippet: 'I need you to update the color palette to match our brand guidelines by Friday.'
      }
    ]
  }),
  createThread({
    id: 't4',
    subject: 'Catch up',
    participants: [{ name: 'Mom', email: 'mom@home.com' }],
    last_message_at: generateDate(-1),
    unread: true,
    starred: false,
    category: 'Primary',
    has_attachment: false,
    messages: [
      {
        id: 'm4',
        thread_id: 't4',
        sender_name: 'Mom',
        sender_email: 'mom@home.com',
        sent_at: generateDate(-1),
        body: `Hi honey,\nJust checking in. We are hoping to see you this weekend. Let me know if you are coming.\n\nLove,\nMom`,
        snippet: 'Let me know if you are coming.'
      }
    ]
  }),
  createThread({
    id: 't5',
    subject: 'Customer Feedback - Issue #882',
    participants: [{ name: 'Support Team', email: 'support@company.com' }],
    last_message_at: generateDate(-72),
    unread: false,
    starred: false,
    category: 'Primary',
    has_attachment: false,
    messages: [
      {
        id: 'm5',
        thread_id: 't5',
        sender_name: 'Support Team',
        sender_email: 'support@company.com',
        sent_at: generateDate(-72),
        body: `A key customer reported a bug on the login page. Can someone look into this immediately?\n\nPlease provide an update by tomorrow morning.`,
        snippet: 'Can someone look into this immediately?'
      }
    ]
  }),
  createThread({
    id: 't6',
    subject: 'Japan Trip 2026',
    participants: [{ name: 'Mike T', email: 'mike.t@gmail.com' }],
    last_message_at: generateDate(-5),
    unread: true,
    starred: false,
    category: 'Primary',
    has_attachment: false,
    messages: [
      {
        id: 'm6',
        thread_id: 't6',
        sender_name: 'Mike T',
        sender_email: 'mike.t@gmail.com',
        sent_at: generateDate(-5),
        body: `Hey man! So excited for the trip. I'll book the hotels tonight and send you the confirmation numbers.`,
        snippet: "I'll book the hotels tonight and send you the confirmation numbers."
      }
    ]
  }),
  createThread({
    id: 't7',
    subject: 'Appointment Confirmation',
    participants: [{ name: 'Dr. Smith Clinic', email: 'appointments@drsmith.com' }],
    last_message_at: generateDate(-20),
    unread: false,
    starred: false,
    category: 'Primary',
    has_attachment: false,
    messages: [
      {
        id: 'm7',
        thread_id: 't7',
        sender_name: 'Dr. Smith Clinic',
        sender_email: 'appointments@drsmith.com',
        sent_at: generateDate(-20),
        body: `Your appointment is confirmed for next Tuesday. Please fill out the patient intake forms before your arrival.`,
        snippet: 'Please fill out the patient intake forms before your arrival.'
      }
    ]
  }),
  createThread({
    id: 't8',
    subject: 'Daily Tech Newsletter',
    participants: [{ name: 'TechCrunch', email: 'news@techcrunch.com' }],
    last_message_at: generateDate(-3),
    unread: false,
    starred: false,
    category: 'Updates',
    has_attachment: false,
    messages: [
      {
        id: 'm8',
        thread_id: 't8',
        sender_name: 'TechCrunch',
        sender_email: 'news@techcrunch.com',
        sent_at: generateDate(-3),
        body: `Here are the top stories in tech today. Don't forget to check out our podcast!\nWe'll see you tomorrow.`,
        snippet: "Here are the top stories in tech today."
      }
    ]
  }),
  createThread({
    id: 't9',
    subject: 'Save 50% on all plans!',
    participants: [{ name: 'Spotify', email: 'promos@spotify.com' }],
    last_message_at: generateDate(-6),
    unread: true,
    starred: false,
    category: 'Promotions',
    has_attachment: false,
    messages: [
      {
        id: 'm9',
        thread_id: 't9',
        sender_name: 'Spotify',
        sender_email: 'promos@spotify.com',
        sent_at: generateDate(-6),
        body: `Upgrade to Premium today and save 50%. Act fast, offer ends soon!`,
        snippet: 'Upgrade to Premium today and save 50%.'
      }
    ]
  }),
  createThread({
    id: 't10',
    subject: 'Thoughts on the proposal?',
    participants: [{ name: 'David Lee', email: 'david.l@partner.com' }],
    last_message_at: generateDate(-10),
    unread: false,
    starred: false,
    category: 'Primary',
    has_attachment: false,
    messages: [
      {
        id: 'm10',
        thread_id: 't10',
        sender_name: 'David Lee',
        sender_email: 'david.l@partner.com',
        sent_at: generateDate(-10),
        body: `Just wanted to circle back on the proposal I sent last week. We should probably align on the pricing model soon.`,
        snippet: 'We should probably align on the pricing model soon.'
      }
    ]
  })
];

