# Gmail Commitment Radar Prototype

This is a high-fidelity React prototype of the **Gmail Commitment Radar**, an AI-assisted layer built on top of the standard Gmail interface to help users track and resolve commitments (promises, asks, deadlines, and pending follow-ups) hidden within email threads.

## Features Built

- **State Normalization & Persistence**: Uses Zustand with `localStorage` persistence. State changes (like marking a commitment "Done") are synced across all views and persist across page reloads.
- **Native Gmail Shell**: Matches Gmail's 4-zone structure (Top Bar, Left Nav, Inbox List, Right Panel).
- **Inbox Badges**: Smart indicators inline on thread rows.
- **Thread & Message View**: Exact source phrase highlighting to show why the AI flagged a message.
- **Radar Panel**: A slide-out panel allowing quick triage, with actionable suggestions (e.g., "Draft Reply", "Mark Done", "Snooze").
- **Global Draft Composer**: Triggering a draft reply from the side panel automatically opens the composer within the correct thread.
- **Dashboard**: A full-page dashboard with dynamic summaries, search, and sorting.
- **Settings**: Configuration modal for toggling display logic and behavior.

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:5173` (or the port provided by Vite).

## Tech Stack
- Vite
- React 19
- TypeScript
- Tailwind CSS v4
- Zustand
- Lucide React (Icons)
- Date-fns
