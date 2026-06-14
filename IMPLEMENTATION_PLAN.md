# Gmail Commitment Radar Implementation Plan

## 0. Current Repo Assessment

The repo currently contains:

- `Gmail Commitment Radar.pdf`: a 55-page product requirements document.
- `gmail-ui.html`: a large captured Gmail HTML document, roughly 1.8 MB and 155 physical lines with very long minified/runtime payloads.

There is no package manifest, build system, app source tree, test setup, or Git metadata in this workspace. The existing `gmail-ui.html` is useful as a visual/reference artifact, but it should not be treated as the implementation base. It contains captured Gmail production markup/scripts and is not maintainable for a portfolio prototype.

Recommended implementation direction:

- Build a new local prototype using Vite, React, and TypeScript.
- Keep `gmail-ui.html` as a reference asset only, or move it under a `reference/` folder if cleanup is desired later.
- Implement the product as deterministic local mock software with seeded email data, local state persistence, and no real Gmail/Google API calls.

## 1. Product Goal

Build a high-fidelity Gmail-style desktop prototype for "Gmail Commitment Radar": an AI-assisted layer that detects promises, asks, deadlines, and follow-ups in email threads, then helps the user track, explain, resolve, snooze, dismiss, correct, or draft responses for commitments.

The MVP is complete when a viewer can:

1. Open a Gmail-like inbox.
2. Immediately see which threads contain commitments.
3. Open a thread and see the source phrase that produced a commitment.
4. Understand owner, due date, risk, confidence, and reasoning.
5. Take lightweight actions from the side panel.
6. View all commitments in a Gmail-native dashboard.
7. See state changes persist locally across reloads.

The prototype should feel like Gmail gained a native commitment layer, not like an external task app embedded beside email.

## 2. Non-Goals

Do not build:

- Real Gmail API integration.
- OAuth.
- Real email sending.
- Real Google Calendar writes.
- Real Google Tasks writes.
- Background scanning.
- Push notifications.
- Multi-account support.
- Mobile app.
- Cloud persistence.
- Attachment upload or download.
- Real LLM calls in MVP.

Every AI behavior in MVP should be deterministic and local.

## 3. Recommended Stack

Use:

- Vite for local app scaffolding.
- React for UI.
- TypeScript for domain models and reducer safety.
- CSS modules or a single structured CSS file with design tokens. Tailwind is acceptable, but plain CSS is sufficient for a static prototype and easier to audit visually.
- Lucide React icons or Material Symbols. Prefer Lucide if dependency installation is allowed, with icon styling adjusted to feel Gmail-like.
- LocalStorage for persistence.
- Playwright only if added later for visual acceptance tests; manual browser verification is sufficient for the first pass if no test framework exists.

Initial file structure:

```text
/
  package.json
  index.html
  src/
    main.tsx
    App.tsx
    styles/
      tokens.css
      app.css
    data/
      seedThreads.ts
    domain/
      types.ts
      analyzer.ts
      risk.ts
      dates.ts
      drafts.ts
      selectors.ts
      persistence.ts
      analytics.ts
    state/
      appReducer.ts
      initialState.ts
      AppStateProvider.tsx
    components/
      shell/
        AppShell.tsx
        TopBar.tsx
        LeftNav.tsx
        RightUtilityRail.tsx
      inbox/
        InboxList.tsx
        InboxRow.tsx
        InboxTabs.tsx
        CommitmentBadge.tsx
        InboxToolbar.tsx
      thread/
        ThreadView.tsx
        ThreadToolbar.tsx
        MessageCard.tsx
        SourcePhraseHighlight.tsx
        DraftReplyComposer.tsx
      radar/
        CommitmentPanel.tsx
        CommitmentCard.tsx
        CommitmentExplanation.tsx
        FilterChips.tsx
        TodaySummary.tsx
      dashboard/
        CommitmentDashboard.tsx
        CommitmentTable.tsx
        DashboardSummary.tsx
      modals/
        SettingsModal.tsx
        SnoozeMenu.tsx
        CalendarModal.tsx
        TaskModal.tsx
        ManualCommitmentModal.tsx
        FeedbackMenu.tsx
      shared/
        IconButton.tsx
        Button.tsx
        Chip.tsx
        EmptyState.tsx
        Snackbar.tsx
        Modal.tsx
```

## 4. Design System Plan

### 4.1 Color Tokens

Define CSS custom properties in `src/styles/tokens.css`:

```css
:root {
  --app-bg: #f6f8fc;
  --surface: #ffffff;
  --search-bg: #eaf1fb;
  --selected-nav-bg: #d3e3fd;
  --compose-bg: #c2e7ff;
  --text-primary: #202124;
  --text-secondary: #5f6368;
  --divider: #e0e0e0;
  --hover-bg: #f2f6fc;
  --active-blue: #1a73e8;
  --risk-low: #188038;
  --risk-medium: #f9ab00;
  --risk-high: #d93025;
  --ai-accent: #5e35b1;
}
```

Use muted Gmail-like backgrounds. Avoid turning the product into a colorful dashboard. Risk color must always be paired with text.

### 4.2 Layout Dimensions

Use desktop-first CSS variables:

```css
:root {
  --topbar-height: 64px;
  --leftnav-width: 256px;
  --leftnav-collapsed-width: 72px;
  --utility-rail-width: 56px;
  --radar-panel-width: 380px;
  --thread-toolbar-height: 48px;
  --inbox-row-height: 52px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
}
```

Responsive behavior:

- At `max-width: 1024px`, collapse left nav to icons.
- At `max-width: 1024px`, turn the radar panel into an overlay.
- At `max-width: 768px`, show a desktop-optimized message instead of trying to build a full mobile app.

### 4.3 Typography

Use:

- Font stack: `"Google Sans", Arial, sans-serif`.
- Base size: `14px`.
- Body text: `#202124`.
- Secondary text: `#5f6368`.
- Section titles: `16px`, medium weight.
- Card titles: `14px`, medium weight.
- Metadata: `12px`.
- Explanation text: `13px`.

Do not scale font size with viewport width. Avoid negative letter spacing.

### 4.4 Interaction States

Every clickable control must have:

- Default state.
- Hover state.
- Focus-visible outline.
- Active or pressed state.
- Disabled state where applicable.

Focus visible should use a 2px blue outline or box shadow that meets contrast requirements.

## 5. Domain Model

### 5.1 TypeScript Types

Create `src/domain/types.ts`:

```ts
export type ViewMode = "inbox" | "thread" | "dashboard";
export type CommitmentStatus = "open" | "waiting" | "review" | "done" | "snoozed" | "dismissed";
export type CommitmentOwnerType = "me" | "other_person" | "shared" | "unknown";
export type CommitmentType =
  | "user_promise"
  | "ask_from_other"
  | "waiting_on_other"
  | "meeting_preparation"
  | "deadline_confirmation"
  | "soft_follow_up";
export type RiskLevel = "low" | "medium" | "high" | "review" | "none";
export type SuggestedActionType =
  | "draft_reply"
  | "mark_done"
  | "snooze"
  | "create_task"
  | "add_calendar"
  | "draft_follow_up"
  | "send_availability"
  | "review"
  | "dismiss";

export interface Thread {
  id: string;
  subject: string;
  participants: Participant[];
  lastMessageAt: string;
  unread: boolean;
  starred: boolean;
  labels: string[];
  category: "primary" | "promotions" | "social" | "updates";
  hasAttachment: boolean;
  importance: "normal" | "important";
  messages: Message[];
}

export interface Participant {
  name: string;
  email: string;
  role?: "recruiter" | "manager" | "vendor" | "customer" | "friend" | "medical" | "automated";
}

export interface Message {
  id: string;
  threadId: string;
  senderName: string;
  senderEmail: string;
  recipients: string[];
  sentAt: string;
  body: string;
  snippet: string;
  isFromUser: boolean;
  attachments: Attachment[];
  detectedPhrases?: string[];
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
}

export interface Commitment {
  id: string;
  threadId: string;
  messageId: string;
  sourceMessageIndex: number;
  title: string;
  type: CommitmentType;
  ownerType: CommitmentOwnerType;
  ownerName: string;
  recipientName?: string;
  sourcePhrase: string;
  normalizedAction: string;
  dueDate: string | null;
  dueDateText: string;
  dueDateConfidence: number;
  confidence: number;
  risk: RiskLevel;
  status: CommitmentStatus;
  createdAt: string;
  updatedAt: string;
  snoozedUntil: string | null;
  resolvedAt: string | null;
  suggestedActions: SuggestedAction[];
  draftReply: string;
  explanation: CommitmentExplanationData;
  userOverrides: UserOverride[];
  addedManually?: boolean;
}

export interface CommitmentExplanationData {
  summary: string;
  parsedAction: string;
  parsedOwner: string;
  parsedDueDate: string;
  signals: string[];
}

export interface SuggestedAction {
  id: string;
  commitmentId: string;
  type: SuggestedActionType;
  label: string;
  primary: boolean;
  enabled: boolean;
  disabledReason?: string;
}

export interface UserOverride {
  commitmentId: string;
  overrideType: "owner" | "due_date" | "status" | "dismiss_reason" | "manual_add";
  previousValue: string | null;
  newValue: string;
  createdAt: string;
}
```

### 5.2 App State

Create reducer-backed app state:

```ts
export interface AppState {
  selectedThreadId: string | null;
  selectedCommitmentId: string | null;
  activeView: ViewMode;
  panelOpen: boolean;
  railCollapsed: boolean;
  activeFilter: CommitmentFilter;
  searchQuery: string;
  dashboardSearchQuery: string;
  selectedCommitmentIds: string[];
  threads: Thread[];
  commitments: Commitment[];
  settings: RadarSettings;
  snackbar: SnackbarState | null;
  modal: ModalState | null;
  draftComposer: DraftComposerState | null;
  analyticsEvents: AnalyticsEvent[];
}
```

Settings:

```ts
export interface RadarSettings {
  detectReceivedEmails: boolean;
  detectSentPromises: boolean;
  detectWaitingOnOthers: boolean;
  detectMeetingPreparation: boolean;
  ignorePromotionsAndNewsletters: boolean;
  ignoreAutomatedNotifications: boolean;
  directAsksHighPriority: boolean;
  recruitersHighPriority: boolean;
  sensitiveSendersHighPriority: boolean;
  showLowConfidenceReview: boolean;
  showLeftNavBadge: boolean;
  showInboxRowBadges: boolean;
  showDailySummary: boolean;
  showOverdueBanner: boolean;
  snoozeReminders: boolean;
  showSourcePhrase: boolean;
  radarEnabled: boolean;
}
```

## 6. Seed Data Plan

Create 10 to 12 seeded threads in `src/data/seedThreads.ts`.

Use a fixed demo current date, for example:

```ts
export const DEMO_NOW = "2026-06-13T09:00:00-07:00";
```

Seed threads:

1. Recruiting preparation
   - Category: Primary.
   - Sender: recruiter.
   - Commitment: send updated resume or LinkedIn URL 24 hours before call.
   - Type: `meeting_preparation`.
   - Owner: `me`.
   - Risk: high.
   - Primary action: Draft reply.
   - Source phrase: "Please send your resume or updated LinkedIn URL at least 24 hours prior to our call."

2. Manager follow-up
   - Category: Primary.
   - Sender: manager.
   - Commitment: send roadmap summary by Friday.
   - Type: `user_promise`.
   - Owner: `me`.
   - Risk: medium/high depending on due date.
   - Primary action: Draft update.
   - Source phrase from user's sent message: "I will send the roadmap summary by Friday."

3. Vendor invoice
   - Category: Updates.
   - Sender: vendor.
   - Commitment: approve invoice by end of week.
   - Type: `deadline_confirmation`.
   - Owner: `me`.
   - Risk: medium.
   - Primary action: Create task.

4. Customer feedback
   - Category: Primary.
   - Sender: customer.
   - Commitment: review feedback document.
   - Type: `ask_from_other`.
   - Owner: `me`.
   - Risk: medium.
   - Primary action: Create task.

5. Friend travel plan
   - Category: Primary.
   - Sender: friend.
   - Commitment: confirm weekend travel timing.
   - Type: `ask_from_other`.
   - Owner: `me`.
   - Risk: low.
   - Primary action: Draft reply.

6. Waiting for contract
   - Category: Primary.
   - User asked other person for signed agreement.
   - Type: `waiting_on_other`.
   - Owner: `other_person`.
   - Risk: low.
   - Primary action: Draft follow-up.

7. Medical appointment
   - Category: Updates.
   - Sender: appointment office.
   - Commitment: complete intake form before appointment.
   - Type: `meeting_preparation`.
   - Owner: `me`.
   - Risk: high.
   - Primary action: Create task.
   - Keep content generic; no private medical details.

8. Automated newsletter
   - Category: Updates or Promotions.
   - Commitment: none.
   - Expected: no badge.

9. Promotion
   - Category: Promotions.
   - Commitment: none.
   - Expected: ignored and no badge.

10. Ambiguous follow-up
   - Category: Primary.
   - Commitment: possible response needed.
   - Type: `soft_follow_up`.
   - Owner: unknown or me.
   - Risk: review.
   - Primary action: Review.

11. Scheduling response
   - Commitment: share three times that work.
   - Type: `ask_from_other`.
   - Owner: me.
   - Primary action: Send availability.

12. Waiting on finance/legal style sender
   - Commitment: other person owes approval or document.
   - Type: `waiting_on_other`.
   - Risk influenced by contact importance.

All seeded commitments must include exact source phrases in the email body so highlighting can be deterministic.

## 7. Mock AI Analyzer

Implement `analyzeThread(thread, settings): Commitment[]` in `src/domain/analyzer.ts`.

Pipeline:

1. Read thread messages in chronological order.
2. Skip ignored categories if settings require it:
   - Promotions.
   - Newsletters.
   - Automated notifications.
3. Segment each message into sentences using simple punctuation boundaries.
4. Run phrase matchers for commitment types:
   - User promises.
   - Direct asks.
   - Waiting-on-other asks.
   - Meeting preparation.
   - Deadline confirmation.
   - Soft follow-up.
5. Determine owner:
   - If `message.isFromUser` and phrase includes "I will", owner is `me`.
   - If sender asks "please send", "can you send", "could you review", owner is `me`.
   - If user asks someone else "can you send", "please confirm", owner is `other_person`.
   - If phrase addresses a group or "we", owner is `shared`.
   - If context is unclear, owner is `unknown` and status is `review`.
6. Parse due date text:
   - today.
   - tomorrow.
   - Friday.
   - end of day.
   - EOD.
   - end of week.
   - 24 hours before call.
   - before our meeting.
   - by next week.
   - no explicit date.
7. Normalize due date using `DEMO_NOW`.
8. Score confidence.
9. Score risk.
10. Generate explanation.
11. Generate suggested actions.
12. Generate draft reply.
13. Reject commitments without source phrase.

### 7.1 Confidence Scoring

Use 0 to 100.

High confidence, 85 to 100:

- Clear action verb.
- Clear owner.
- Explicit or meeting-implied due date.
- Direct source phrase.

Medium confidence, 60 to 84:

- Action exists but owner or deadline is ambiguous.
- Language is indirect.
- Thread context helps but does not fully resolve.

Low confidence, below 60:

- Could be FYI.
- No clear owner.
- No clear action.
- Generic automated wording.

MVP rule:

- Do not create open commitments below 60.
- Show low-confidence items only as `review` when `settings.showLowConfidenceReview` is enabled.

### 7.2 Risk Scoring

Create `src/domain/risk.ts`.

Inputs:

- Overdue: `+40`.
- Due today: `+30`.
- Due within 24 hours: `+25`.
- Explicit user promise: `+20`.
- Direct sender ask: `+15`.
- Important contact: `+15`.
- Follow-up phrase: `+15`.
- Meeting preparation: `+10`.
- Confidence below 75: `-10`.

Risk levels:

- `0-34`: low.
- `35-69`: medium.
- `70-100`: high.
- Ambiguous or low-confidence: review.
- No commitment: none.

Every risk card should expose a plain-language explanation, not just the numeric score.

### 7.3 Draft Generation Rules

Create `src/domain/drafts.ts`.

Hard rules:

- Never claim completion unless status is done and user triggered that action.
- Never say "attached" unless the thread has an attachment that supports it.
- Never invent availability.
- Never mention private information outside the thread.
- Keep draft short and professional.
- Drafts are editable.
- Send is simulated/disabled in MVP.

Draft templates:

- Document request: "Hi {name}, thanks for the note. I will send over {document} before {dueDateText}."
- Follow-up: "Hi {name}, just following up on this. Please let me know when you have a chance."
- Review task: "Hi {name}, thanks for sending this over. I will review it and follow up with any notes."
- Scheduling: "Hi {name}, thanks for reaching out. I can share a few times shortly."
- Generic confirmation: "Hi {name}, thanks for the reminder. I will take care of this by {dueDateText}."

## 8. Core UI Implementation

### 8.1 App Shell

Component: `AppShell`.

Responsibilities:

- Four-zone Gmail-like layout:
  - Top app bar.
  - Left navigation.
  - Main content.
  - Right utility rail/Commitment Radar panel.
- Handles desktop layout and responsive collapse.
- Keeps panel from covering main email area on desktop.

Acceptance:

- Looks readable at 1366x768, 1440x900, and 1920x1080.
- Main content resizes when panel opens.
- No overlapping text or controls.

### 8.2 Top Bar

Component: `TopBar`.

Required elements from left to right:

- Hamburger menu icon.
- Gmail-style logo area.
- Search input with placeholder "Search mail".
- Search filter/tune icon.
- Help icon.
- Settings gear icon.
- Google apps grid icon.
- User avatar.

Search input:

- Rounded pill.
- About 48px height.
- Soft blue-gray background.
- Max width around 720px.
- Leading search icon.
- Optional trailing tune/filter icon.
- Focus background becomes white.
- Focus adds subtle shadow.

Search behavior:

- Normal text updates `searchQuery`.
- If query resembles commitment search, show a Commitment Radar result module in main area or dashboard mode:
  - "commitments due today"
  - "things I owe"
  - "waiting on others"
  - "overdue commitments"
  - "resume before call"
  - "threads where I promised to follow up"

### 8.3 Left Navigation

Component: `LeftNav`.

Items:

- Compose button.
- Inbox.
- Starred.
- Snoozed.
- Sent.
- Drafts.
- More.
- Labels section.
- Commitment Radar entry.

Compose button:

- Rounded pill.
- Light blue fill.
- Pencil or plus icon.
- Text: "Compose".
- About 140px wide and 56px tall.
- Minimal shadow.
- Slightly darker hover.

Commitment Radar entry:

- Icon: radar/target/check-circle/sparkle.
- Label: "Commitment Radar".
- Badge count: open commitments.
- Selected state: light blue rounded right pill.
- Badge red/amber only when urgent commitments exist.
- Should not overpower Inbox.

Click behavior:

- Inbox opens `activeView = "inbox"`.
- Commitment Radar opens `activeView = "dashboard"` and keeps panel optional.

### 8.4 Inbox List View

Components:

- `InboxToolbar`.
- `InboxTabs`.
- `InboxList`.
- `InboxRow`.
- `CommitmentBadge`.

Inbox row fields:

- Checkbox.
- Star.
- Sender.
- Subject.
- Snippet.
- Commitment badge when applicable.
- Attachment icon if applicable.
- Timestamp.
- Hover quick actions.

Commitment badge types:

- "You owe" with optional due date: amber/red depending on urgency.
- "They owe": light blue.
- "Waiting": gray or blue-gray.
- "Done": light green.
- "Review": light purple or neutral.

Hover actions:

- Archive.
- Delete.
- Mark unread.
- Snooze.
- Radar quick action.

Radar quick action:

- Opens a small popover with commitment summary, due date, primary action, and "Open Radar panel".

Click behavior:

- Row click opens thread detail view.
- Badge click opens panel and selects matching commitment without navigating unless row itself is clicked.

Acceptance:

- At least five threads show different commitment states.
- Hover reveals Gmail-like quick actions.
- Badge opens side panel with selected commitment.
- Row opens thread detail.
- UI readable at 1366px width.

### 8.5 Thread Detail View

Components:

- `ThreadView`.
- `ThreadToolbar`.
- `MessageCard`.
- `SourcePhraseHighlight`.
- `DraftReplyComposer`.

Thread toolbar actions:

- Back.
- Archive.
- Report spam.
- Delete.
- Mark unread.
- Snooze.
- Add to tasks.
- Move.
- Labels.
- More.

Thread content:

- Subject.
- Thread-level summary chip if commitment exists:
  - Example: "1 open commitment - Due today".
- Message cards with sender details.
- Subtle source phrase highlights.
- Reply composer area.

Source phrase highlighting:

- Find exact `commitment.sourcePhrase` in the message body.
- Wrap in highlight span.
- Visual style: soft yellow or light blue underline/background.
- Tooltip on hover:
  - "Detected commitment"
  - Owner.
  - Due.
  - Confidence.

Draft reply integration:

- Clicking "Draft reply" inserts editable text into Gmail-like inline composer.
- Composer includes body text area, send button, more options, and trash draft.
- Send is simulated/disabled in MVP.

Acceptance:

- User sees exact source phrase.
- AI overlay is visually distinct but calm.
- Draft reply appears in an editable composer.
- Mark done works from thread without leaving thread.

### 8.6 Commitment Radar Side Panel

Components:

- `CommitmentPanel`.
- `TodaySummary`.
- `FilterChips`.
- `CommitmentCard`.
- `CommitmentExplanation`.

Panel structure:

- Header.
- Today summary.
- Filter chips.
- Commitment cards.
- Explanation drawer.
- Action area.
- Settings entry.

Header:

- Radar/target icon.
- Title: "Commitment Radar".
- Subtitle: "3 need attention today." or computed equivalent.
- Close icon.
- More menu.
- Optional status line:
  - "Last scanned just now."
  - "AI suggestions are private to this prototype."

Today summary:

- Count due today.
- Count overdue.
- Count waiting on others.
- Example: "Today: 3 open - 1 overdue - 2 waiting".

Filters:

- All.
- You owe.
- They owe.
- Due today.
- Overdue.
- Review.
- Done.

Filter behavior:

- Single-select for MVP.
- Selected chip uses light blue background.
- Count can appear in chip.

Commitment card fields:

- Status badge.
- Title.
- Thread source.
- Contact/sender.
- Due date.
- Risk level.
- Confidence.
- Source phrase.
- Explanation.
- Primary action.
- Secondary actions.

Card density:

- Selected thread commitments expanded by default.
- Other commitments compact by default.
- Compact: title, due date, status, primary action.
- Expanded: source phrase, explanation, all actions.

Explanation drawer fields:

- Detected phrase.
- Parsed action.
- Parsed owner.
- Parsed due date.
- Confidence score.
- Signals used.
- User override controls.

Acceptance:

- Panel opens from right side.
- Panel closes and returns focus.
- Filters update visible cards.
- Cards show source phrase and confidence.
- Actions update state immediately.

### 8.7 Dashboard View

Components:

- `CommitmentDashboard`.
- `DashboardSummary`.
- `CommitmentTable`.

Entry points:

- Left nav "Commitment Radar".
- Right panel "View all".
- Search query suggestions.
- Empty inbox card.

Dashboard layout:

- Page title: "Commitment Radar".
- Subtitle: "Track promises, asks, and follow-ups across your inbox."
- Search commitments input.
- Filter chips.
- Summary cards:
  - Due today.
  - Overdue.
  - Waiting on others.
  - Needs review.
- Commitment rows.
- Sort options.
- Bulk actions.

Commitment row fields:

- Checkbox.
- Status icon.
- Commitment title.
- Thread subject.
- Contact.
- Due date.
- Risk.
- Last email date.
- Primary action.
- More menu.

Sort options:

- Risk.
- Due date.
- Newest.
- Contact importance.
- Confidence.

Bulk actions:

- Mark done.
- Snooze.
- Add to tasks.
- Dismiss.
- Export disabled in MVP.

Acceptance:

- User can see all open commitments.
- User can filter by owner and due date.
- User can select multiple commitments.
- User can open original thread from any row.

## 9. User Actions and State Transitions

Implement reducer actions in `src/state/appReducer.ts`.

### 9.1 Mark Done

Behavior:

- Set `status = "done"`.
- Set `resolvedAt = now`.
- Remove from active filters.
- Keep visible in Done filter.
- Show snackbar: "Commitment marked done. Undo".
- Undo restores previous status and `resolvedAt`.

### 9.2 Snooze

Behavior:

- Open Gmail-style snooze menu.
- Options:
  - Later today.
  - Tomorrow.
  - This weekend.
  - Next week.
  - Pick date and time.
- Set `status = "snoozed"`.
- Set `snoozedUntil`.
- Reappear if demo current time is advanced or if filter includes snoozed.
- Show undo snackbar.

### 9.3 Draft Reply

Behavior:

- Generate or load existing `draftReply`.
- Open inline reply composer in thread view.
- If currently in dashboard or inbox, navigate to thread and open composer.
- Draft is editable.
- Simulated send button is disabled or shows "Demo only".
- Track edited state if user changes draft text.

### 9.4 Add to Calendar

Behavior:

- Open simulated Google Calendar modal.
- Pre-fill title, date, reminder.
- No real calendar write.
- On confirm, add a local mock calendar event record if desired.
- Show snackbar.

### 9.5 Create Task

Behavior:

- Open Google Tasks-style mini modal.
- Pre-fill task title and due date.
- Add to local mock tasks list.
- Show snackbar.

### 9.6 Not a Commitment

Behavior:

- Open feedback menu.
- Options:
  - Not an action.
  - Wrong owner.
  - Wrong date.
  - Already handled.
  - Other.
- Set `status = "dismissed"`.
- Add `userOverrides` entry.
- Show undo snackbar.

### 9.7 Assign Owner

For ambiguous commitments:

- Assign to me.
- Assign to sender.
- Assign to someone else.
- Shared.

Updates:

- `ownerType`.
- `ownerName`.
- `status`, usually from review to open or waiting.
- `userOverrides`.

### 9.8 Edit Due Date

Behavior:

- Click due date.
- Open date picker or simple date modal.
- Save.
- Update `dueDate` and `dueDateText`.
- Recalculate risk.
- Add override label: "Updated by you."

### 9.9 Manual Add Commitment

Entry points:

- Thread panel.
- Dashboard.
- Inbox row more menu.

Fields:

- Title.
- Owner.
- Due date.
- Source thread.
- Notes.
- Risk.
- Status.

Behavior:

- Create commitment with `addedManually = true`.
- Show "Added by you" instead of AI confidence.
- Appear in panel and dashboard.

## 10. Settings Implementation

Entry points:

- Commitment Radar panel more menu.
- Dashboard settings button.
- Gmail settings gear simulation.

Settings sections:

### 10.1 Detection

- Detect commitments from received emails.
- Detect promises from sent emails.
- Detect waiting-on-others threads.
- Detect meeting preparation tasks.
- Ignore promotions and newsletters.
- Ignore automated notifications.

### 10.2 Risk

- Treat direct asks as high priority.
- Treat recruiters and hiring contacts as high priority.
- Treat finance, legal, and medical senders as high priority.
- Show low-confidence items in Review.

### 10.3 Notifications

- Show badge in left navigation.
- Show inbox row badges.
- Show daily summary.
- Show overdue banner.
- Snooze reminders.

### 10.4 Privacy

- Show source phrase for every AI suggestion.
- Clear local AI suggestions.
- Disable Commitment Radar.

Required MVP behavior:

- Toggle inbox badges on/off.
- Toggle low-confidence review items.
- Toggle automated email filtering.
- Clear completed commitments.
- Disable/enable panel and detection.

Privacy copy:

"This prototype uses seeded local email data. No real emails are sent or scanned."

## 11. Empty and Error States

Implement `EmptyState` and state-specific copy.

No commitments detected:

- Title: "You are all caught up."
- Subtext: "Commitment Radar did not find open promises, asks, or follow-ups in this view."
- Actions: View done, Adjust settings.

No commitments in selected thread:

- Title: "No commitments found in this thread."
- Subtext: "Radar looks for promises, asks, deadlines, and follow-ups."
- Action: Add manually.

Low confidence only:

- Title: "Nothing urgent found."
- Subtext: "There are a few items Radar is unsure about."
- Action: Review suggestions.

Detection disabled:

- Title: "Commitment Radar is off."
- Subtext: "Turn it on to detect promises and follow-ups in your inbox."
- Action: Turn on.

AI detection unavailable:

- Title: "Radar could not analyze this thread."
- Subtext: "Try again or add a commitment manually."
- Action: Retry.

Draft generation failed:

- Title: "Draft could not be generated."
- Subtext: "You can still write a reply manually."
- Action: Try again.

No source phrase found:

- Title: "This suggestion needs review."
- Subtext: "Radar could not find the exact source phrase."
- Action: Dismiss.

Local storage full:

- Title: "Changes could not be saved locally."
- Subtext: "Your browser storage may be full."
- Action: Clear demo data.

## 12. Persistence

Create `src/domain/persistence.ts`.

Persist:

- Commitment statuses.
- Snooze dates.
- User overrides.
- Manual commitments.
- Settings.
- Draft composer content.

Do not persist:

- Transient hover state.
- Modal open state.
- Snackbar state.
- Analytics events unless useful for debug.

Storage key:

```ts
const STORAGE_KEY = "gmail-commitment-radar-state-v1";
```

On load:

1. Load seed threads.
2. Run analyzer.
3. Load persisted overrides.
4. Merge persisted commitment state by stable commitment id.
5. Recalculate derived counts.

Storage error handling:

- Catch quota/security errors.
- Show local storage full error state only when save fails after user action.

## 13. Analytics Simulation

Create `src/domain/analytics.ts`.

The prototype does not need real analytics transport. Add a local logger that records events to in-memory state or console in development.

Events to emit:

Panel:

- `radar_panel_opened`
- `radar_panel_closed`
- `radar_filter_selected`
- `radar_card_expanded`
- `radar_explanation_opened`

Commitment:

- `commitment_detected`
- `commitment_viewed`
- `commitment_marked_done`
- `commitment_snoozed`
- `commitment_dismissed`
- `commitment_due_date_edited`
- `commitment_owner_changed`
- `commitment_added_manually`

Draft:

- `draft_reply_generated`
- `draft_reply_inserted`
- `draft_reply_edited`
- `draft_reply_discarded`
- `draft_reply_simulated_send_clicked`

Dashboard:

- `radar_dashboard_opened`
- `commitment_search_performed`
- `commitment_bulk_action_used`

Settings:

- `radar_setting_changed`
- `radar_disabled`
- `radar_enabled`

## 14. Accessibility Plan

Keyboard requirements:

- Inbox rows are reachable by keyboard.
- Enter opens selected thread.
- Commitment badge button opens panel.
- Escape closes panel or modal.
- Tab order moves logically through panel cards and actions.
- Modal traps focus.
- Closing panel returns focus to triggering button.
- Closing modal returns focus to action button.

ARIA labels:

- "Open Commitment Radar"
- "Commitment due today"
- "High risk commitment"
- "Mark commitment done"
- "Snooze commitment"
- "Draft reply for commitment"
- "Source phrase"
- "Confidence score"

Contrast:

- Text meets WCAG AA.
- Risk status must not rely on color alone.

Reduced motion:

- Respect `prefers-reduced-motion`.
- Disable or shorten panel slide animations.

## 15. Responsive Plan

Primary desktop targets:

- 1366x768.
- 1440x900.
- 1920x1080.

Below 1024px:

- Left nav collapses.
- Commitment panel becomes overlay.
- Main inbox remains primary.

Below 768px:

- Show a calm message:
  - "Commitment Radar prototype is optimized for desktop Gmail."
- Avoid broken cramped layout.

## 16. Performance Plan

Initial load:

- Keep seed data small.
- Avoid heavy external assets.
- Render instantly from local arrays.
- Target under 2 seconds locally.

Interactions:

- Panel open under 150ms.
- Filtering under 100ms.
- Mark done under 100ms.
- Draft generation simulation under 800ms.

Loading states:

- Use subtle skeletons or inline progress.
- Avoid full-page spinners except initial app bootstrap if needed.

Implementation details:

- Memoize derived selectors if needed.
- Avoid recalculating analyzer on every render.
- Store commitments in state after initialization.
- Use stable ids and keyed lists.

## 17. Build Phases

### Phase 1: App Scaffold and Gmail Shell

Goal:

Make the prototype visually believable before implementing intelligence.

Tasks:

1. Create Vite React TypeScript app files.
2. Add design tokens.
3. Build `AppShell`.
4. Build `TopBar`.
5. Build `LeftNav`.
6. Build placeholder `InboxList`.
7. Build placeholder `ThreadView`.
8. Build placeholder `CommitmentPanel`.
9. Add desktop responsive grid.
10. Verify 1366x768 layout.

Exit criteria:

- App runs locally.
- Top bar, left nav, inbox, and right panel are visible.
- Layout feels Gmail-native.
- No overlapping major regions.

### Phase 2: Seeded Email and Commitment Data

Goal:

Make the product concept visible with deterministic data.

Tasks:

1. Define domain types.
2. Create 10 to 12 seeded threads.
3. Add seeded messages with exact source phrases.
4. Implement initial commitment objects or analyzer output.
5. Render inbox rows from data.
6. Render commitment badges.
7. Render side panel cards.
8. Render dashboard list.
9. Add counts in nav, panel, and filters.

Exit criteria:

- Inbox displays realistic threads.
- At least five rows show different commitment states.
- Panel shows cards with source phrase, risk, confidence, and action buttons.
- Dashboard shows all commitments.

### Phase 3: Navigation and Thread Context

Goal:

Connect inbox, thread view, selected commitment, and panel.

Tasks:

1. Implement `activeView`.
2. Implement `selectedThreadId`.
3. Implement `selectedCommitmentId`.
4. Row click opens thread.
5. Badge click opens panel and selects commitment.
6. Thread summary chip appears when commitment exists.
7. Source phrase is highlighted in the message body.
8. Panel filters commitments by selected thread when appropriate.
9. Dashboard row opens original thread.

Exit criteria:

- User can move through demo flow 1 and flow 2 from PRD.
- Source phrase grounding is visible and accurate.
- Panel stays synchronized with selection.

### Phase 4: Actions and Local State

Goal:

Make the prototype feel interactive.

Tasks:

1. Implement reducer.
2. Implement mark done.
3. Implement undo snackbar.
4. Implement snooze menu.
5. Implement dismiss/not a commitment feedback.
6. Implement edit owner.
7. Implement edit due date.
8. Implement draft reply insertion.
9. Implement task modal.
10. Implement calendar modal.
11. Implement bulk dashboard actions.
12. Add localStorage persistence.

Exit criteria:

- Every action changes visible UI state.
- Destructive actions have undo.
- Draft reply is editable.
- State survives reload.

### Phase 5: Mock AI Analyzer

Goal:

Make the intelligence feel grounded rather than hardcoded.

Tasks:

1. Implement sentence segmentation.
2. Implement phrase matchers.
3. Implement owner classification.
4. Implement due date parsing against fixed demo date.
5. Implement confidence scoring.
6. Implement risk scoring.
7. Implement explanation generation.
8. Implement suggested action selection.
9. Implement hallucination guard requiring source phrase.
10. Add unit-testable pure functions if a test runner is introduced.

Exit criteria:

- Seed commitments can be generated deterministically from thread messages.
- Every generated card has source phrase, owner, due date, confidence, risk, explanation, and draft.
- Newsletters/promotions are ignored when settings require it.

### Phase 6: Settings, Empty States, Error States

Goal:

Cover trust, control, and edge cases.

Tasks:

1. Build settings modal.
2. Wire detection toggles.
3. Wire badge visibility toggle.
4. Wire review toggle.
5. Wire automated filtering toggle.
6. Wire clear completed commitments.
7. Wire disable/enable radar.
8. Add empty states.
9. Add error states.
10. Add privacy copy.

Exit criteria:

- User can control noisy behavior.
- Disabled Radar state is clear.
- Empty and error states match PRD copy.
- Privacy copy is visible in settings.

### Phase 7: Search and Dashboard Polish

Goal:

Make dashboard and search feel product-complete.

Tasks:

1. Implement dashboard commitment search.
2. Search fields:
   - Commitment title.
   - Source phrase.
   - Thread subject.
   - Sender.
   - Due date text.
   - Status.
3. Add Gmail search commitment suggestions.
4. Add dashboard sort options.
5. Add dashboard bulk selection.
6. Add "View all" from panel.
7. Add disabled export action.

Exit criteria:

- User can find "resume before call".
- User can filter due today.
- User can select multiple commitments.
- User can jump from dashboard to source thread.

### Phase 8: Accessibility, Responsive, and Visual QA

Goal:

Make it portfolio-ready.

Tasks:

1. Audit focus states.
2. Verify keyboard paths.
3. Add ARIA labels.
4. Verify focus return after panel/modal close.
5. Verify contrast.
6. Respect reduced motion.
7. Test 1366x768.
8. Test 1440x900.
9. Test 1920x1080.
10. Test below 1024px.
11. Test below 768px desktop warning.
12. Remove visual clutter.
13. Ensure text never overlaps buttons/cards.

Exit criteria:

- Main demo flows work without mouse-only traps.
- Layout is stable across target viewports.
- No obvious text clipping or overlapping.
- The UI reads as Gmail-native.

## 18. Demo Flow Verification

### Flow 1: Inbox Scan

Steps:

1. Open app.
2. See Gmail-style inbox.
3. See multiple commitment badges.
4. Identify "You owe - Today".
5. Click badge.
6. Right panel opens.
7. Commitment card explains detected ask.

Pass criteria:

- Badge state is visible.
- Panel selection matches clicked row.
- Source phrase and explanation are visible.

### Flow 2: Thread Action

Steps:

1. Open commitment thread.
2. See source phrase highlighted.
3. See high-risk card in panel.
4. Click Draft reply.
5. Composer opens with editable draft.
6. Edit draft.
7. Mark commitment done.
8. Snackbar appears with undo.

Pass criteria:

- Draft does not auto-send.
- Done state updates badge/card/dashboard.
- Undo restores state.

### Flow 3: Dashboard

Steps:

1. Click Commitment Radar in left nav.
2. Dashboard opens.
3. Filter by Due today.
4. See all due-today commitments.
5. Snooze one.
6. Mark another done.

Pass criteria:

- Dashboard counts update.
- Snoozed/done commitments leave active list.
- Bulk action controls remain coherent.

### Flow 4: AI Mistake Correction

Steps:

1. Open Review commitment.
2. See ambiguous ownership.
3. Click Not a commitment.
4. Feedback menu appears.
5. Select Not an action.
6. Item disappears from active list.

Pass criteria:

- User correction is visible in history/explanation.
- Undo is available.

## 19. Acceptance Criteria Traceability

Must have:

- Gmail-like shell: Phase 1.
- Gmail-like search/nav/inbox/right panel: Phase 1 and 2.
- Commitment badges: Phase 2.
- Commitment side panel: Phase 2.
- Commitment cards with source phrase/confidence/risk/actions: Phase 2 and 5.
- Thread view with source phrase highlight: Phase 3.
- Draft reply simulation: Phase 4.
- Mark done, snooze, dismiss, review actions: Phase 4.
- Commitment dashboard: Phase 2 and 7.
- Settings modal: Phase 6.
- Local state persistence: Phase 4.
- Seeded demo data: Phase 2.
- Empty/error states: Phase 6.

Should have:

- Collapsed right rail: Phase 1 or 8.
- Dashboard bulk actions: Phase 7.
- Manual add commitment: Phase 4.
- User correction feedback: Phase 4.
- Search across commitments: Phase 7.
- Risk scoring explanation: Phase 5.

Could have:

- Animated radar scan: Phase 8 only if time remains.
- Daily digest card: Phase 6 or later.
- Contact importance scoring: Phase 5.
- Calendar/Tasks mock integrations: Phase 4.
- Dark mode: defer.
- Mobile layout: defer beyond desktop warning.

## 20. Implementation Order Recommendation

Recommended order for actual coding:

1. Scaffold Vite React TypeScript.
2. Build static Gmail shell.
3. Add seed data and static cards.
4. Wire navigation and selected state.
5. Add reducer and actions.
6. Add localStorage.
7. Replace static commitments with analyzer output.
8. Add settings and empty/error states.
9. Add dashboard search/sort/bulk actions.
10. Run visual and accessibility QA.

This order keeps visual quality visible early while preventing the mock AI layer from blocking interface progress.

## 21. Key Engineering Risks

### Risk: Captured Gmail HTML Is Not Maintainable

Mitigation:

- Do not edit `gmail-ui.html` directly.
- Use it only as a visual reference.
- Build a clean React app.

### Risk: Overbuilding AI Logic

Mitigation:

- Keep analyzer deterministic and simple.
- Prioritize source grounding, confidence, and explanation over broad language coverage.
- Seed examples should demonstrate the product, not solve real email parsing.

### Risk: UI Looks Like Generic SaaS Instead of Gmail

Mitigation:

- Use Gmail-like app shell, rows, hover actions, nav, toolbar, and side panel.
- Avoid big hero sections, decorative cards, heavy gradients, or marketing copy.
- Keep dashboard native and restrained.

### Risk: Too Many Commitments Create Anxiety

Mitigation:

- Suppress low confidence by default.
- Use calm language.
- Keep urgency labels factual.
- Provide dismiss and correction controls everywhere.

### Risk: State Drift Across Views

Mitigation:

- Centralize commitment state in reducer.
- Derive counts from commitments.
- Use stable ids.
- Make panel, inbox, thread, and dashboard read from the same state.

## 22. Final Verification Checklist

Before considering MVP complete:

- App loads locally in under 2 seconds.
- Inbox has 10 to 12 seeded threads.
- At least five threads show commitment badges.
- Promotions/newsletters do not show commitments by default.
- A selected commitment opens the panel.
- Thread view highlights the exact source phrase.
- Every AI-generated commitment has source phrase, owner, due date text, confidence, risk, and explanation.
- Draft reply opens editable composer and does not send.
- Mark done updates inbox, panel, dashboard, and persists.
- Snooze updates visible state and persists.
- Dismiss asks for feedback and persists.
- Edit owner and edit due date update explanation/override state.
- Settings toggles have visible effects.
- Dashboard search works.
- Dashboard filter due today works.
- Bulk mark done works.
- Empty states render.
- Error states can be reached through simulated flags or controlled branches.
- Keyboard focus is visible.
- Modals trap focus.
- Closing panel returns focus.
- Text does not overlap at 1366x768.
- Layout remains readable at 1440x900 and 1920x1080.
- Below 768px shows desktop-optimized message.
- Privacy copy says seeded local data only.

