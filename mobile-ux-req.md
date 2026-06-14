# Gmail Radar Mobile UX Requirements

## Purpose

This document defines a mobile-focused UX pass for the Gmail Radar prototype. The goal is to make the prototype feel intentionally usable on phone-sized screens while preserving the current desktop/web Gmail-like experience.

The desktop prototype should remain the primary high-fidelity demo surface. Mobile should not be a squeezed desktop table; it should become a clean companion experience with mobile-appropriate navigation, inbox scanning, thread reading, and Radar triage.

## Current Mobile Rating

Current mobile friendliness: **6.5 / 10**

The prototype is no longer broken on mobile:

- The left nav now collapses by default at narrow widths.
- There is no document-level horizontal scroll at `390x844`.
- The inbox remains visible and usable.
- Core navigation is recoverable through the menu button.

But it is not yet mobile-native:

- Inbox rows are still desktop table rows compressed into a phone viewport.
- Sender, subject, snippet, and dates truncate aggressively.
- Commitment badges are hidden on extra-small screens, reducing the product’s core value.
- Radar panel needs a bottom-sheet or full-screen mobile treatment.
- Dashboard and thread view need dedicated mobile layouts.
- Search is hidden with no mobile replacement affordance.

## Non-Negotiable Constraint

Do **not** degrade desktop UX.

All mobile changes must be scoped with responsive classes, media queries, or component branches that preserve the current desktop layout at `md` and above unless a desktop change is explicitly required.

Acceptance criteria:

- Desktop at `1280x720` remains visually equivalent or better.
- Desktop left nav, inbox table density, thread view, dashboard, and Radar panel stay intact.
- No mobile-only layout rule should affect desktop unintentionally.
- Unit, lint, build, and E2E checks remain green.

## Target Mobile Viewports

Design and verify at:

- `390x844` iPhone-style baseline.
- `375x812` smaller iPhone baseline.
- `430x932` larger phone baseline.
- Optional: `768x1024` tablet portrait.

Mobile support does not need to recreate every Gmail mobile app detail, but it must feel intentional and demo-safe.

## Desired Mobile Rating

Target after this pass: **8.5 / 10**

An 8.5 mobile prototype should:

- Open to a readable inbox without layout cleanup by the user.
- Keep the Radar value visible in the inbox.
- Let users open a thread, view source highlights, and triage commitments without cramped controls.
- Present Radar as a mobile drawer/sheet rather than a squeezed side panel.
- Avoid horizontal scrolling and awkward clipping.
- Preserve strong desktop fidelity.

## Priority Levels

- **P0:** Mobile blocker or feature invisibility.
- **P1:** Major mobile usability/fidelity improvement.
- **P2:** Polish or progressive enhancement.

## Global Mobile Shell

### P0: Mobile Default State

The mobile app must open in a usable inbox-first state.

Acceptance criteria:

- At widths below `768px`, the left nav starts collapsed/off-canvas.
- Main content starts at `x = 0` and fills the viewport width.
- No document-level horizontal scroll.
- The menu button opens the nav as an overlay drawer.
- Tapping the backdrop closes the nav.
- Selecting a nav item closes the drawer on mobile.

### P0: Preserve Desktop Navigation

Desktop nav behavior must remain unchanged.

Acceptance criteria:

- At `md` and wider, left nav can remain expanded/collapsible as implemented.
- Desktop nav should not become an overlay.
- Desktop content should not jump when mobile drawer logic changes.

### P1: Mobile Top Bar

The top bar needs a mobile-specific search affordance.

Current issue:

- Search input is hidden on small screens.
- There is no replacement search button or search mode.

Requirements:

- Keep menu, Gmail logo, settings, and account avatar visible.
- Add a mobile search icon button.
- Tapping search opens a compact search overlay or replaces the logo row with a search input.
- Search mode must have a clear close/back button.
- Desktop search field remains unchanged.

Acceptance criteria:

- At `390px`, top bar does not wrap or overlap.
- Search remains discoverable.
- Search query still drives inbox filtering.

## Mobile Inbox

### P0: Replace Table-Like Rows With Mobile Mail Rows

Mobile inbox rows should not be desktop rows squeezed horizontally.

Requirements:

- At small widths, each row should use a two-line mobile layout:
  - First line: sender, optional Radar indicator, timestamp.
  - Second line: subject/snippet combined, truncated cleanly.
- Checkbox and hover-only actions should be hidden on mobile.
- Star can remain visible if it does not crowd the row.
- Timestamp should stay visible and right-aligned.
- Sender should get enough width to remain readable.

Acceptance criteria:

- At `390x844`, sender names like `Support Team`, `Dr. Smith Clinic`, and `David Lee` are readable enough to identify.
- Subject line is readable enough to distinguish the thread.
- Snippet truncates gracefully.
- No row creates internal horizontal scrolling.

### P0: Keep Radar Value Visible On Mobile

The current extra-small layout hides commitment badges, which weakens the product demo.

Requirements:

- Replace full badges with a compact mobile Radar indicator.
- Example patterns:
  - small colored dot plus short label: `You`, `Them`, `Review`
  - small pill below subject: `You owe · Tomorrow`
  - icon-only Radar target with color and accessible label
- High-risk commitments should remain visually detectable.
- Tapping the mobile Radar indicator opens the thread and mobile Radar drawer.

Acceptance criteria:

- Mobile inbox still communicates which threads have commitments.
- At least owner and urgency/risk are visible or inferable.
- The indicator does not crowd sender/timestamp.

### P1: Mobile Row Touch Targets

Rows and actions should feel touch-native.

Requirements:

- Row height should be approximately `56-72px` on mobile.
- Whole row opens the thread.
- Radar indicator is a separate touch target only if it has enough room.
- Touch targets should be at least `40px` where practical.

Acceptance criteria:

- No tiny icon cluster is required to use core flows.
- Row tap and Radar tap do not conflict.

## Mobile Thread View

### P0: Thread Content Should Fill Mobile Width

Current thread layout is desktop-oriented with wide padding.

Requirements:

- At small widths, reduce thread body padding substantially.
- Subject should use mobile-appropriate size.
- Message header should wrap gracefully.
- Sender email may collapse behind a details affordance or truncate.
- Timestamp and message actions should not crowd sender line.

Acceptance criteria:

- Message body line length is comfortable at `390px`.
- No message header text overlaps.
- Source highlight remains visible.

### P1: Mobile Thread Toolbar

The desktop toolbar is too action-heavy for mobile.

Requirements:

- Keep back button visible.
- Show only the most relevant actions directly: archive/delete or more.
- Move secondary actions into a more menu on mobile.
- Preserve full toolbar on desktop.

Acceptance criteria:

- Mobile toolbar fits one row.
- Buttons do not overflow or compress into unreadable clusters.

### P1: Source Highlight Interaction

Source highlight should remain central to the mobile demo.

Requirements:

- Tapping highlighted source phrase should open the mobile Radar drawer focused on that commitment.
- Highlight should have sufficient contrast on mobile.
- Tooltip hover behavior should not be the only explanation affordance, since mobile has no hover.

Acceptance criteria:

- Tap highlight -> Radar drawer opens.
- Explanation can be viewed from the drawer.
- No hover-only information is required on mobile.

## Mobile Radar Experience

### P0: Replace Side Panel With Mobile Drawer

The desktop right-side Radar panel should not simply squeeze onto mobile.

Requirements:

- At small widths, Radar opens as one of:
  - full-screen overlay, or
  - bottom sheet, or
  - right drawer covering most of the viewport.
- It should have a clear close affordance.
- It should trap focus while open.
- Background content should be dimmed or inert.
- Desktop side panel remains unchanged.

Recommended pattern:

- Use a full-screen mobile overlay for simplicity and clarity.
- Header: `Commitment Radar`, close button, summary count.
- Sticky filter chips below header.
- Scrollable commitment list.

Acceptance criteria:

- At `390x844`, Radar content is readable.
- Commitment cards are not squeezed below usable width.
- No horizontal scroll inside the drawer.
- Closing returns user to the same thread/inbox position.

### P0: Mobile Commitment Card Layout

Cards need a mobile-specific hierarchy.

Requirements:

- Title/action is primary.
- Risk and owner become compact metadata row.
- Due date remains visible.
- Source phrase appears in expanded state.
- Primary action button spans width.
- Secondary actions use a compact icon row with labels or accessible labels.

Acceptance criteria:

- User can understand action, owner, risk, and due date without expanding every card.
- Expanded explanation does not make the card feel cramped.
- Done/Snoozed/Dismissed states remain understandable.

### P1: Mobile Filter Chips

Filter chips need horizontal scrolling or wrapping that feels intentional.

Requirements:

- Chips may scroll horizontally.
- Active chip must stay visibly selected.
- Chip row should be sticky under the Radar header.
- Chip labels should not wrap inside chips.

Acceptance criteria:

- `All`, `You owe`, `They owe`, `Due today`, `Overdue`, `Review`, and `Done` remain reachable.
- No chip row causes page-level overflow.

## Mobile Dashboard

### P1: Dashboard Should Become A Mobile Summary List

The desktop dashboard can remain panel/card-based, but mobile needs a simpler stack.

Requirements:

- Metrics stack in a 2x2 grid or vertical list.
- Search spans full width.
- Sort/filter controls become compact.
- Commitment cards use the same mobile card system as Radar.

Acceptance criteria:

- Dashboard at `390px` does not feel like a shrunken desktop dashboard.
- Metrics remain readable.
- User can search and sort without horizontal scrolling.

## Mobile Settings

### P1: Modal Should Become Mobile Sheet

Settings modal should fit mobile screens cleanly.

Requirements:

- At small widths, use full-screen or near-full-screen sheet.
- Header stays visible.
- Toggles are large enough to tap.
- Reset action remains reachable but not accidentally tapped.

Acceptance criteria:

- No settings content is clipped.
- All toggles can be operated by touch.
- Close/done action is always accessible.

## Mobile Simulation Modal

### P1: Simulation Modal Responsiveness

Tasks/Calendar simulation should fit phone screens.

Requirements:

- Modal width should respect viewport padding.
- Long source phrase should wrap or clamp, not only truncate.
- Action buttons should stack if needed.
- Close button should be easy to tap.

Acceptance criteria:

- At `390px`, title/date/source are readable.
- No button text overflows.
- Simulation boundary copy remains visible.

## Accessibility Requirements

### P0: Mobile Keyboard And Screen Reader Basics

Responsive changes must preserve semantics.

Requirements:

- Nav drawer toggle has `aria-expanded`.
- Mobile Radar drawer/dialog has `role="dialog"` or equivalent.
- Drawer has an accessible title.
- Close buttons have labels.
- Mobile Radar indicators in inbox rows have descriptive labels.
- Icon-only buttons keep `aria-label`.

Acceptance criteria:

- Keyboard users can open/close mobile nav.
- Keyboard users can open/close Radar drawer.
- Screen reader labels identify commitment ownership/risk where visual compact labels are used.

## Desktop Preservation Checklist

Every mobile change must be checked against:

- Desktop inbox at `1280x720`.
- Desktop thread with Radar panel at `1280x720`.
- Desktop dashboard at `1280x720`.
- Desktop settings modal.
- Desktop simulation modal.

Acceptance criteria:

- No desktop row height regressions unless intentional.
- No desktop side panel change unless intentional.
- No desktop nav layout shift unless intentional.
- Desktop search remains visible.
- Desktop screenshots remain visually close to current polished state.

## Verification Plan

### Automated

Run:

```bash
npm run test:unit
npm run lint
npm run build
npm run test:e2e
```

E2E should capture screenshots for:

- desktop inbox
- desktop thread with Radar
- dashboard
- settings
- simulation modal
- mobile inbox
- mobile thread
- mobile Radar drawer

### Manual Visual QA

Inspect at `390x844`:

- Initial inbox load.
- Open/close nav drawer.
- Tap a commitment indicator.
- Open thread.
- Tap source highlight.
- Open Radar drawer.
- Expand explanation.
- Trigger task/calendar simulation.
- Open dashboard.
- Open settings.

Pass criteria:

- No document-level horizontal scroll.
- No internal horizontal scrollbar in primary content.
- No clipped primary action text.
- Commitment value remains visible in inbox.
- Radar triage is practical by touch.

## Recommended Implementation Order

1. Mobile inbox row redesign.
2. Mobile Radar overlay/drawer.
3. Mobile thread padding/header/toolbar adjustments.
4. Mobile commitment card hierarchy.
5. Mobile search affordance.
6. Mobile dashboard stacking.
7. Mobile settings/simulation modal refinements.
8. E2E screenshot updates for mobile-specific flows.

## Definition Of Done

The mobile UX pass is complete when:

- Mobile rating reaches at least **8.5 / 10**.
- Initial mobile inbox is readable and not blocked by navigation.
- Commitment signals remain visible on mobile inbox rows.
- Thread reading and source highlight interaction work comfortably.
- Radar opens as a mobile-native overlay/drawer.
- Dashboard, settings, and simulation modal fit phone screens.
- Desktop UI remains unchanged or improved.
- `npm run test:unit`, `npm run lint`, `npm run build`, and `npm run test:e2e` pass.
