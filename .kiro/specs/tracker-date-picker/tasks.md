# Implementation Plan: tracker-date-picker

## Overview

Replace the two native date inputs in `ApplicationForm` with a custom `DateField` + `CalendarPopup`, built on a pure, UTC-safe `lib/dates.ts`. Work bottom-up: test tooling, date logic with tests, the popup, the field, then form wiring, verification and docs. `app/tracker/actions.ts`, `data/tracker.ts` and the database stay untouched. Implementation language is TypeScript, as in the design.

## Tasks

- [x] 1. Set up the test tooling
  - [x] 1.1 Add Vitest and fast-check
    - Run `npm i -D -E vitest@5.0.3 fast-check@4.10.2` and confirm both are exact-pinned in `package.json` (no `^` or `~`)
    - Add the script `"test": "vitest run"`
    - Create `vitest.config.ts` with `environment: "node"` and `resolve.alias` mapping `@` to the project root
    - _Requirements: 8.9, 8.10_

- [x] 2. Implement `lib/dates.ts`
  - [x] 2.1 Add types, parsing and formatting helpers
    - Export `CalDate`, `YearMonth`, `daysInMonth`, `weekdayMon0`, `parseIso`, `formatIso`, `formatDisplay`, `formatAccessibleName`, `formatMonthHeading`, `todayLocal`, `sameDay`
    - Use `Date.UTC` / `getUTC*` only; `todayLocal()` is the single intentional local-time call
    - Hard-code en-GB month and weekday names (no `Intl`)
    - `parseIso` accepts only `/^\d{4}-\d{2}-\d{2}$/` with a valid month and day, otherwise returns `null`
    - _Requirements: 1.4, 2.4, 5.1, 5.2, 5.5, 6.2, 6.7_

  - [x]* 2.2 Write property test for ISO round trip
    - **Property 1: ISO round trip**
    - **Validates: Requirements 5.2, 5.3, 5.5**

  - [x]* 2.3 Write property test for time-zone independence
    - **Property 2: Time-zone independence**
    - Switch `process.env.TZ` across the design's zone list, with the offset sanity check
    - **Validates: Requirements 5.1, 5.4**

  - [x] 2.4 Add navigation and grid helpers
    - Export `addDays`, `addMonths`, `monthGrid` (Monday-first rows of 7, `null` padding) and `yearOptions` (current −10 to +5, plus selected and displayed years, sorted and unique)
    - _Requirements: 2.1, 2.5, 3.1, 3.2, 6.3_

  - [x] 2.5 Write example tests in `lib/dates.test.ts`
    - Cover the design's examples: "29 Feb 2028", "2 Sep 2025", "Tuesday 2 September 2025", "September 2025", `todayLocal(new Date(2025, 0, 1, 0, 30))`, `parseIso("2025-09-02")` and `parseIso("")`
    - Not optional, so `npm test` always has a suite to run
    - _Requirements: 2.1, 5.1, 5.5, 6.7_

  - [x]* 2.6 Write property test for month grid completeness
    - **Property 3: Month grid completeness**
    - **Validates: Requirements 2.1, 2.5**

  - [x]* 2.7 Write property test for month navigation
    - **Property 4: Month navigation inverse and rollover**
    - **Validates: Requirements 3.1**

  - [x]* 2.8 Write property test for day navigation
    - **Property 5: Day navigation inverse and boundary crossing**
    - **Validates: Requirements 6.3**

  - [x]* 2.9 Write property test for year options
    - **Property 6: Year options cover the range and extras**
    - **Validates: Requirements 3.2**

- [~] 3. Checkpoint - Ensure all tests pass
  - Run `npm test`. Ensure all tests pass, ask the user if questions arise.

- [x] 4. Build `components/tracker/CalendarPopup.tsx`
  - [x] 4.1 Render the popup, header and grid
    - `"use client"`; portal to `document.body` with `role="dialog"`, `aria-label={`${label} calendar`}`, `fixed z-[70]`, `bg-panel-2`, `border-card`
    - Positioning in `useLayoutEffect` on mount and when `displayed` changes: width `min(320, innerWidth - 16)`, left clamp, below the trigger or flipped above, else clamped
    - Header: "previous month" / "next month" buttons and `<select aria-label="year">` over `yearOptions`, all `type="button"`; month changes don't touch `selected`
    - Grid: Mon–Sun `font-mono` headers, empty `<td />` for padding, `role="gridcell"` with `aria-selected`, day buttons with `formatAccessibleName` and `aria-current="date"` for today
    - Styling from Theme_Tokens only: selected `bg-gold text-base`, today `ring-1 ring-gold`, `focus-visible:outline-2 outline-gold` on all controls, no transitions, targets ≥ 24 px
    - _Requirements: 1.4, 1.5, 2.1, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 6.4, 6.6, 6.7, 8.2, 8.3, 8.4, 8.6, 8.7_

  - [x] 4.2 Add keyboard navigation and announcements
    - Roving tabindex on `focused`; focus the selected day or today on mount
    - Arrow keys move `focused` by ±1 / ±7 days via `addDays`, switching `displayed` when the month changes
    - Polite `sr-only` live region set by arrow keys, month buttons and the year select, without moving focus
    - Day click / Enter / Space calls `onSelect`
    - _Requirements: 2.2, 3.4, 6.2, 6.3, 6.8_

  - [x] 4.3 Add close and propagation handling
    - Root `onKeyDown`: Escape → `preventDefault`, `stopPropagation`, `onClose({ refocus: true })`
    - Root `onClick`: `stopPropagation` so clicks never reach the modal backdrop
    - Root `onFocusOut`: close when `relatedTarget` is outside the root and not the trigger; ignore `null`
    - Document `pointerdown` listener (added and removed in an effect): close when the target is outside both the root and the trigger
    - _Requirements: 1.2, 7.1, 7.2, 7.3_

- [x] 5. Build `components/tracker/DateField.tsx`
  - [x] 5.1 Implement the field and wire in `CalendarPopup`
    - `"use client"`; props `id`, `name`, `label`, `defaultValue`, `open`, `onOpenChange`; `selected` state from `parseIso(defaultValue ?? "")`
    - Label with the existing `labelClass`; trigger `<button type="button" id={id}>` with `fieldClass`, display text or "No date chosen" in `text-dim`, `text-gold` calendar icon (`aria-hidden`)
    - Trigger ARIA: `aria-label="Choose …"`, `aria-describedby` to the value or "no date chosen", `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`; click toggles via `onOpenChange(!open)`
    - Clear button (only when `selected`), `aria-label="Clear …"`, ≥ 24 px target: clears, closes, refocuses the trigger
    - Single named element: `<input type="hidden" name={name} value={selected ? formatIso(selected) : ""} />`
    - Render `CalendarPopup` when `open`; `onSelect` sets `selected`, closes and refocuses; `onClose` refocuses only when asked
    - _Requirements: 1.1, 1.2, 2.2, 4.1, 4.2, 4.3, 5.1, 5.2, 5.5, 5.6, 6.1, 6.5, 8.1, 8.7_

- [x] 6. Integrate into `ApplicationForm`
  - [x] 6.1 Replace the native date inputs with `DateField`
    - Swap both `<input type="date">` for `DateField` (`date_applied` / "Date applied", `deadline` / "Deadline") in the same tab position, with `defaultValue={application?.… ?? null}`
    - Add `openField` state so opening one field closes the other
    - Backdrop: `onPointerDown` records `popupOpenAtPress`; `onClick` closes only the popup if one was open at press time, else calls `onClose()`
    - Leave every other input, `app/tracker/actions.ts` and `data/tracker.ts` unchanged
    - _Requirements: 1.3, 5.6, 6.1, 7.2, 7.4, 8.8_

- [ ] 7. Verify the feature
  - [x] 7.1 Run the verification gates
    - Run `npm test`, `npm run lint` and `npm run build`; fix any failures or new warnings
    - _Requirements: 8.10_

  - [x] 7.2 Run the manual checklist (user-run)
    - The user works through the design's manual checklist (mouse, keyboard, modal, screen reader, layout at 320/400 px, time zone, browsers); fix any issues they report
    - _Requirements: 1.1–1.5, 2.2–2.4, 3.3, 3.4, 4.1–4.3, 6.1–6.8, 7.1–7.4, 8.3, 8.5, 8.6_

- [x] 8. Update the documentation
  - [x] 8.1 Update `docs/ARCHITECTURE.md`
    - Describe `DateField`, `CalendarPopup` (portal, single-open via `openField`, backdrop rule), `lib/dates.ts` (UTC-safe `{y, m, d}` helpers) and the `npm test` script; note no picker package was added
    - _Requirements: 8.9, 8.11_

  - [x] 8.2 Update `docs/BACKLOG.md`
    - Add the `formatDate()` / `formatShortDate()` UTC off-by-one item for the table and board views, with the fix of reusing `parseIso` and `formatDisplay`
    - On the existing `ApplicationForm` dialog item, note that the popup's Escape handler already calls `stopPropagation`
    - _Requirements: 8.11_

  - [x] 8.3 Update `.kiro/steering/project.md`
    - Replace "There's no test suite yet. Verify changes with `npm run lint` and `npm run build`." with a line saying to verify changes with `npm test`, `npm run lint` and `npm run build`
    - _Requirements: 8.10_

- [~] 9. Final checkpoint - Ensure all tests pass
  - Run `npm test`, `npm run lint` and `npm run build`. Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP. Task 2.5 (example tests) isn't optional, so `npm test` always has a suite to run.
- Every property test lives in `lib/dates.test.ts`, so they're put in separate waves.
- Task 7.2 is run by the user. The UI criteria have no automated component tests (see the design's optional future work).

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["2.2", "2.4"] },
    { "id": 3, "tasks": ["2.5", "4.1"] },
    { "id": 4, "tasks": ["2.3", "4.2"] },
    { "id": 5, "tasks": ["2.6", "4.3"] },
    { "id": 6, "tasks": ["2.7", "5.1"] },
    { "id": 7, "tasks": ["2.8", "6.1"] },
    { "id": 8, "tasks": ["2.9", "8.1", "8.2", "8.3"] },
    { "id": 9, "tasks": ["7.1"] },
    { "id": 10, "tasks": ["7.2"] }
  ]
}
```
