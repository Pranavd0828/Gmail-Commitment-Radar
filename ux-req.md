# Gmail Radar UX Requirements

## Purpose

This document defines the UX hardening requirements needed to make the Gmail Radar prototype feel like a high-fidelity Gmail-native product demo rather than a functional mockup. The current prototype is functionally strong: state, filtering, persistence, reset, draft flow, simulation modal, and tests are in place. The remaining work is visual fidelity, responsive behavior, interaction polish, and demo believability.

## Current Review Summary

### What Already Works

- Gmail-style shell exists with top bar, left navigation, inbox list, thread view, dashboard, settings, snackbar, and Radar side panel.
- Commitment badges are visible in inbox rows and communicate ownership/due state.
- Thread detail highlights the source phrase that created a commitment.
- Radar panel opens from a commitment and shows cards, chips, summary counts, and actions.
- Draft reply flow, undo flow, settings toggles, reset, and simulation modal are wired.
- Local Gmail-style logo is now used, so the header no longer depends on a remote image.
- Unit tests, lint, and build pass.

### Current UX Gaps

- The desktop UI is close to Gmail but still reads as a simplified app shell in several areas: row density, toolbar fidelity, icon treatment, and dashboard/card styling.
- Narrow viewport behavior is broken: the fixed left navigation and main content overflow horizontally instead of adapting.
- The dashboard feels more like a generic SaaS dashboard than a Gmail/Workspace-native surface.
- Radar cards are useful but visually heavy; the risk color fills and borders can dominate the page.
- Some interactive controls lack strong affordances, tooltips, disabled states, or pressed/selected states.
- The simulation modal is credible, but it should more clearly resemble a Google Workspace side panel/modal and feel integrated with the Radar action model.

## UX Quality Bar

The prototype should satisfy three demo goals:

1. **Immediate Gmail Recognition**  
   Within one second, a viewer should recognize the base UI as Gmail-like from the shell, spacing, toolbar, inbox density, and interaction patterns.

2. **Native Radar Layer**  
   Commitment Radar should feel like a plausible Gmail AI feature, not an unrelated plugin. It should inherit Gmail spacing, typography, surfaces, motion, and action behavior while still having a distinct but restrained AI identity.

3. **No Demo-Breaking Layout Issues**  
   At common presentation sizes, the UI must not clip important content, overlap text, create horizontal page scroll, or require awkward scrolling to understand the feature.

## Priority Levels

- **P0:** Demo blocker or high-visibility realism issue.
- **P1:** Important fidelity/polish issue that materially improves perceived quality.
- **P2:** Nice-to-have polish, refinement, or future-proofing.

## Global Layout Requirements

### P0: Responsive Shell Behavior

The app must adapt across common demo widths without broken horizontal overflow.

Acceptance criteria:

- At `1280x720`, all primary desktop surfaces fit without horizontal page scroll.
- At `1440x900`, content uses available space cleanly without feeling sparse.
- At `390x844`, the app must not show a fixed desktop left nav consuming the viewport while the inbox is clipped offscreen.
- For narrow widths, choose one of these patterns:
  - collapse left nav into icon-only rail plus overlay drawer, or
  - hide left nav behind the menu button, or
  - explicitly support desktop-only by showing a polished unsupported-width message.
- Top bar controls must not overlap or push the Gmail wordmark offscreen.
- Radar panel must either become a full-width overlay drawer on narrow screens or be disabled behind a clear affordance.

### P0: Stable App Dimensions

The Gmail shell should remain visually stable during navigation.

Acceptance criteria:

- Left nav width, top bar height, inbox toolbar height, and right panel width must not shift when switching views.
- Opening the Radar panel should reduce available thread/inbox width predictably; it must not cause text or toolbar controls to overlap.
- Modals must center within the visible viewport and remain usable at laptop sizes.

### P1: Surface Hierarchy

The app should use Gmail-like flat surfaces over generic card-heavy layouts.

Acceptance criteria:

- Main Gmail content should feel like a flat pane with subtle borders, not a card floating inside the app.
- Repeated items can be card-like only where appropriate: commitment cards, modals, and simulation records.
- Dashboard summary blocks should feel like Workspace panels, not marketing cards.

## Top Bar Requirements

### P0: Logo Reliability

The logo must never rely on a remote URL.

Acceptance criteria:

- Gmail logo is served locally from `public/gmail-logo.svg`.
- Broken image icon must never appear in offline/local demo mode.
- Logo and text align to Gmail-like proportions.

### P1: Gmail Header Fidelity

The top bar should more closely match Gmail.

Acceptance criteria:

- Header height should remain 64px on desktop.
- Left menu icon should align with Gmail logo and left nav content.
- Search field should have Gmail-like rounded shape, muted blue-gray background, icon spacing, and max width.
- Right-side icons should have consistent 40px hit targets.
- Search options icon should remain visible and aligned at all supported desktop widths.
- At narrow widths, search should collapse before the logo/left nav breaks.

## Left Navigation Requirements

### P1: Gmail-Like Density And States

The left nav should feel like Gmail’s navigation rail.

Acceptance criteria:

- Compose button should match Gmail proportions and icon alignment more closely.
- Active item should use Gmail-like blue selected background with a left indicator only when visually necessary.
- Icon and label alignment must be consistent across all rows.
- Badge counts should align to the right edge and not jump between items.
- `Commitment Radar` can use a distinct accent, but it should not overpower core Gmail navigation.

### P2: Collapsed Mode

Add a collapsed rail mode for narrow and medium widths.

Acceptance criteria:

- Menu button toggles expanded/collapsed nav.
- Collapsed mode shows icons only.
- Tooltips or accessible labels identify collapsed items.
- The Radar badge remains visible in collapsed mode.

## Inbox Requirements

### P0: Row Density And Readability

Inbox rows should feel closer to Gmail’s real density.

Acceptance criteria:

- Desktop row height should target Gmail-like density: approximately 40-48px.
- Sender, subject, snippet, commitment badge, and timestamp must stay on one line where space permits.
- Long snippets should truncate gracefully without covering badges or timestamps.
- Checkbox/star/importance controls should have consistent spacing and hover states.
- Unread rows should use stronger sender/subject weight, not excessive color.

### P1: Toolbar Fidelity

Inbox toolbar should be more realistic.

Acceptance criteria:

- Add Gmail-like toolbar controls above rows: select checkbox, refresh, more, pagination, and settings density affordance.
- Toolbar should maintain 48px height.
- Icons should have hover circles and consistent muted gray.
- Tabs (`Primary`, `Promotions`, `Social`) should align and size like Gmail tabs.

### P1: Commitment Badge Polish

Commitment badges should feel native and scannable.

Acceptance criteria:

- Badge color should communicate type without dominating the row.
- `You owe`, `They owe`, and `Review` badges must have consistent width behavior.
- Badges should never overlap timestamps.
- Badges should have hover/focus affordance if clickable.
- Clicking a badge should clearly open the relevant thread and select/open the corresponding Radar card.

## Thread View Requirements

### P0: Thread Toolbar Fidelity

Thread view must look like a Gmail thread, not a custom detail page.

Acceptance criteria:

- Toolbar should include recognizable actions: back, archive, report spam, delete, mark unread, snooze, add to task, more.
- Icons should use Gmail-like spacing, hover circles, and muted colors.
- Toolbar must remain visually connected to the message pane.

### P1: Message Layout Realism

Email messages should more closely match Gmail.

Acceptance criteria:

- Sender avatar, sender name, email address, timestamp, star, reply, and more actions should align like Gmail.
- Message body should have realistic line length and spacing.
- Thread title should match Gmail typography scale.
- Message rows should not feel overly sparse on desktop.

### P1: Source Highlight Styling

The source phrase highlight must feel intentional and readable.

Acceptance criteria:

- Highlight should use a subtle yellow underline/background similar to Gmail search highlights.
- Highlight must not reduce text contrast.
- Hovering or selecting the highlight should reveal the explanation affordance or connect visually to the Radar card.
- If the Radar card is selected, the matching source phrase should show a stronger but still tasteful highlight state.

### P2: Reply Composer Fidelity

Draft composer should feel like Gmail’s inline reply composer.

Acceptance criteria:

- Composer should appear in the thread where Gmail reply would appear.
- Toolbar should include basic formatting/send affordances.
- `Simulate Send` should be clearly labeled but visually compatible with Gmail send controls.
- Composer should have realistic focus, placeholder, and cancel behavior.

## Radar Panel Requirements

### P0: Panel Layout And Width

Radar panel is the core product surface and must feel premium.

Acceptance criteria:

- Desktop panel width should be stable, approximately 360-400px.
- Panel should not compress the thread content below usable width at common demo sizes.
- Header should include product title, close button, and overflow menu with consistent icon hit targets.
- Summary and filter chips should stay visible above the card list.
- Card list should scroll independently without moving the Gmail shell.

### P1: Card Visual Hierarchy

Commitment cards need better hierarchy and lower visual weight.

Acceptance criteria:

- Risk should be indicated with a left rail, small badge, or text color; avoid large tinted card backgrounds that make the panel feel noisy.
- Primary card title should be the action, not the risk label.
- Owner, due date, source, and confidence should have clear hierarchy.
- Expanded cards should be visibly selected but not overly outlined.
- Collapsed cards should remain readable at a glance.
- Done/Snoozed/Dismissed states should have distinct visual treatment.

### P1: Filter Chips

Filter chips should behave like a polished segmented/filter control.

Acceptance criteria:

- Active chip is clearly selected.
- Chip labels must not wrap awkwardly.
- `Done` chip must show done items even when global hide-completed is on.
- `Overdue` chip must filter by `SIMULATED_CURRENT_DATE`.
- Empty states should explain the selected filter, for example: `No overdue commitments`.

### P1: Action Controls

Radar actions should feel native to Gmail/Workspace.

Acceptance criteria:

- Primary action button should be visually prominent but not oversized.
- Secondary actions should have tooltips: mark done, snooze, calendar.
- Icon buttons should have 32-36px hit targets.
- Disabled or unavailable actions should have clear disabled states.
- Action results should use either snackbar or simulation modal consistently.

### P2: Explanation Drawer

The explanation drawer should feel like a lightweight AI rationale.

Acceptance criteria:

- `Why am I seeing this?` should open inline without shifting the entire card unpredictably.
- Confidence and rationale should be easy to scan.
- `Wrong owner` and `Wrong date` feedback actions should look like small text buttons or chips.
- Feedback action results should be visible and reversible where appropriate.

## Dashboard Requirements

### P1: Workspace-Native Dashboard Styling

Dashboard should feel like a Gmail/Workspace management view, not generic SaaS.

Acceptance criteria:

- Reduce generic card-heavy feel.
- Use flatter panels and Gmail-like separators.
- Summary metrics should be compact and scannable.
- Search and sort controls should align to the same grid as the list.
- `Filter` button should either open a real filter popover or be disabled/removed.

### P1: List/Card Consistency

Dashboard commitment items should share the same system as Radar cards while respecting wider layout.

Acceptance criteria:

- Same risk, owner, due date, status, and action semantics as Radar panel.
- Wider cards may show more detail, but they should not introduce a separate visual language.
- Sort selection should visibly update ordering.
- Search should cover action, owner, recipient, and source phrase.

## Settings Modal Requirements

### P1: Gmail/Workspace Modal Styling

Settings should feel like a Google settings surface.

Acceptance criteria:

- Modal should have sharper visual hierarchy, less generic danger-zone styling, and consistent spacing.
- Toggles should use Google-like switch controls instead of plain checkboxes if feasible.
- Reset action should require a lightweight confirmation if destructive changes are present.
- Reset should reseed state without a page reload.
- Modal must remain usable on laptop and narrow widths.

## Simulation Modal Requirements

### P1: Tasks And Calendar Simulation Fidelity

Simulation modal should feel like a credible Workspace intercept.

Acceptance criteria:

- Task modal shows title, due date, source thread, and simulated destination.
- Calendar modal shows title, event date, source thread, and simulated destination.
- Modal should state clearly that it is a simulation without looking like an error or placeholder.
- `Open in Tasks/Calendar` should be dummy but visually credible.
- Close button, escape behavior, and backdrop click behavior should be defined.

### P2: Consider Side Panel Variant

For Tasks, consider a right-side mini panel instead of a centered modal.

Acceptance criteria:

- If implemented, it should slide from the right in a Google Workspace side-panel style.
- It must not conflict with Radar panel scrolling or layout.

## Snackbar Requirements

### P1: Gmail-Like Snackbar

Snackbars should match Gmail action feedback.

Acceptance criteria:

- Snackbar appears bottom-left or bottom-center in a Gmail-like black/gray surface.
- Undo action is prominent and accessible.
- Snackbar should not cover important Radar actions on smaller screens.
- Multiple snackbar events should replace or queue predictably.

## Motion And Interaction Requirements

### P1: Subtle Transitions

Use restrained motion to make interactions feel polished.

Acceptance criteria:

- Radar panel open/close should animate subtly.
- Card expansion should animate height/opacity without jank.
- Modal open/close should fade/scale subtly.
- Hover states should respond quickly under 150ms.
- Avoid bouncy, decorative, or non-Gmail-like animation.

## Accessibility Requirements

### P0: Keyboard Reachability

Core flows must be keyboard reachable.

Acceptance criteria:

- Top bar buttons, nav items, inbox rows, badges, Radar chips, card actions, settings controls, and modal buttons are focusable.
- Focus outlines are visible and consistent.
- Escape closes modals and optionally closes Radar panel when focus is inside it.
- Enter/Space activates buttons and chips.

### P1: Semantic Controls

Interactive elements should use semantic buttons and labels.

Acceptance criteria:

- Left nav items should be buttons or links, not generic clickable divs.
- Inbox rows should have accessible row/action semantics.
- Icon-only buttons must have `aria-label`.
- Filter chips should expose selected state with `aria-pressed` or equivalent.
- Modal should have dialog semantics, title association, and focus trap.

## Visual QA Requirements

### P0: Manual Screenshot Pass

Before considering the UI final, capture and inspect screenshots for:

- Inbox desktop at `1280x720`.
- Thread with Radar panel desktop at `1280x720`.
- Dashboard desktop at `1280x720`.
- Settings modal desktop.
- Simulation modal desktop.
- Narrow viewport at `390x844`.

Acceptance criteria:

- No broken logo or missing icon.
- No overlapping text.
- No clipped primary controls.
- No unintended horizontal scroll on supported widths.
- No unreadable contrast.
- No empty/blank core surface.

### P1: Playwright Smoke Pass

Add a smoke test or script that covers:

- Load inbox.
- Click a commitment badge.
- Verify thread and Radar panel open.
- Open explanation drawer.
- Trigger draft reply.
- Open calendar or task simulation modal.
- Navigate dashboard.
- Open settings and reset demo data.

Acceptance criteria:

- Script exits cleanly.
- Screenshots are saved for manual review.
- Test avoids brittle positional selectors where possible.

## Implementation Order

1. Fix responsive shell behavior.
2. Tighten desktop Gmail shell fidelity: top bar, left nav, inbox rows, toolbars.
3. Polish thread view and source highlight.
4. Redesign Radar card hierarchy and panel density.
5. Make dashboard feel Workspace-native.
6. Upgrade settings and simulation modal styling.
7. Add accessibility semantics and keyboard flow.
8. Add Playwright visual smoke coverage.

## Definition Of Done

The UX hardening pass is complete when:

- The app looks intentionally Gmail-like at desktop demo sizes.
- The Radar layer feels native, premium, and visually restrained.
- The app has a defined narrow-width behavior without broken horizontal clipping.
- All primary flows can be demonstrated without visual glitches.
- Manual screenshots pass the visual QA checklist.
- Existing unit tests, lint, and build remain green.
- Any added Playwright smoke test passes or produces reviewed screenshots.
