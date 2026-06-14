export type RiskLevel = 'Low' | 'Medium' | 'High' | 'None';
export type CommitmentStatus = 'Open' | 'Done' | 'Snoozed' | 'Dismissed' | 'Review';
export type OwnerType = 'me' | 'other_person' | 'shared' | 'unknown';
export type CommitmentType = 'Promise made by user' | 'Ask from someone else' | 'Waiting on someone else' | 'Meeting preparation requirement' | 'Deadline confirmation' | 'Soft follow-up risk' | 'No commitment' | 'Ignored';

export interface SuggestedAction {
  id: string;
  type: string;
  label: string;
  primary: boolean;
  enabled: boolean;
  disabled_reason?: string;
}

export interface UserOverride {
  commitment_id: string;
  override_type: string;
  previous_value: string;
  new_value: string;
  created_at: string;
}

export interface Commitment {
  id: string;
  thread_id: string;
  message_id: string;
  source_message_index: number;
  source_phrase: string;
  normalized_action: string;
  type: CommitmentType;
  owner_type: OwnerType;
  owner_name: string;
  recipient_name: string;
  due_date: string | null;
  due_date_text: string | null;
  due_date_confidence: number;
  risk_level: RiskLevel;
  confidence_score: number;
  status: CommitmentStatus;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  snoozed_until: string | null;
  suggested_actions: SuggestedAction[];
  draft_reply: string | null;
  explanation: string;
  user_overrides?: UserOverride[];
}

export interface Message {
  id: string;
  thread_id: string;
  sender_name: string;
  sender_email: string;
  recipients: string[];
  sent_at: string;
  body: string;
  snippet: string;
  is_from_user: boolean;
  attachments: string[];
  detected_phrases: string[];
}

export interface Thread {
  id: string;
  subject: string;
  participants: { name: string; email: string }[];
  last_message_at: string;
  unread: boolean;
  starred: boolean;
  labels: string[];
  category: 'Primary' | 'Promotions' | 'Social' | 'Updates';
  has_attachment: boolean;
  messages: Message[];
}
