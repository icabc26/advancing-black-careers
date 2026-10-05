# Requirements Document

## Introduction

In `components/tracker/ApplicationForm.tsx`, members fill in "Date applied" and "Deadline" using native `<input type="date">` fields. The site is dark and never sets `color-scheme: dark`, so in Chromium the calendar icon draws dark on dark and can't be seen, and the popup opens in light mode. In practice, members only get the segmented typing UI.

This feature replaces both fields with a button-style field that opens a themed calendar popup. In the popup the member picks a date, and the field has a control to clear it. The field works the same way with a mouse, keyboard, screen reader or touch screen. The value sent to the existing Server Actions is still an ISO `YYYY-MM-DD` string, or an empty string. That means `app/tracker/actions.ts` and the database don't change.

The scope is the two date fields in the Application_Form and nothing else.

### Decisions

- **No cross-field validation.** The Deadline isn't checked against Date applied. Both fields stay independent and optional, as they are now.
- **Escape handling covers the popup only.** Full dialog behaviour for the Application_Form (focus trap, Escape to close) is a separate BACKLOG item. These requirements only define what Escape does while a Calendar_Popup is open (Requirement 7.3), so the two changes won't conflict.
- **Adjacent-month days are hidden.** The `faint` token reaches only about 3.3:1 against `panel` and `panel-2`, which is below the 4.5:1 text minimum. So days from the previous and next months aren't drawn in the grid (Requirement 2.5), and the empty-field placeholder uses `dim` (Requirement 4.3).
- **`formatDate()` isn't reused.** `formatDate()` and `formatShortDate()` in `data/tracker.ts` pass a `YYYY-MM-DD` string to `new Date()`. That parses as UTC midnight, so members in negative-offset time zones see the previous day. The Date_Field formats dates without this shift (Requirement 5.1). The same bug in the table and board views is out of scope here, but it gets logged in `docs/BACKLOG.md` (Requirement 8.11).
- **The year range is 10 years back to 5 years forward**, plus the year of the Selected_Date if it falls outside that window. The range limits the year select only. The previous and next month controls have no limit (Requirement 3).
- **Out of scope for now:**
  - Typing dates by hand. This drops the multi-format parser, inline errors and submit blocking. The field is a button-style display that opens the calendar, so behaviour is the same on every device and there's no split between `pointer: fine` and `pointer: coarse`.
  - The Page Up/Page Down, Shift+Page Up/Shift+Page Down and Home/End keys, along with clamping to the end of the month.
  - Disabling the previous and next month controls at the edges of the year range.
  - Response-time targets, disabling the Calendar_Triggers while the form saves, repositioning on resize or orientation change, roving-tabindex details, per-browser release rules beyond "current stable", discarding unsaved changes when the form is reopened in edit mode, and rules against overlapping touch targets.

## Glossary

- **Application_Form**: The client-side modal form in `components/tracker/ApplicationForm.tsx` for creating and editing an application.
- **Date_Field**: Either of the two date fields in the Application_Form: "Date applied" (form name `date_applied`) or "Deadline" (form name `deadline`). Each one is made up of its visible label, a Calendar_Trigger, a "Clear" control and a Calendar_Popup.
- **Calendar_Trigger**: The button-style display of a Date_Field. It shows the Selected_Date or a placeholder next to a calendar icon, and it opens and closes the Calendar_Popup.
- **Calendar_Popup**: The month-grid calendar overlay that belongs to one Date_Field.
- **Day_Cell**: A single day in the Calendar_Popup grid that the Member can select.
- **Displayed_Month**: The month and year that the Calendar_Popup grid is currently showing.
- **Selected_Date**: The date a Date_Field currently holds. It is "none" when the Date_Field is empty.
- **Submitted_Value**: The string a Date_Field adds to the `FormData` under its form name when the Application_Form is submitted.
- **ISO_Date**: A date string in the format `YYYY-MM-DD`.
- **Display_Format**: The en-GB date format, for example "2 Sep 2025". It is the day without a leading zero, the three-letter month abbreviation and the four-digit year, separated by single spaces.
- **Navigable_Range**: Every year from 10 years before to 5 years after the current year in the Member's local time zone. If the year of the Selected_Date falls outside those bounds, the range also includes that year.
- **Server_Actions**: `createApplication` and `updateApplication` in `app/tracker/actions.ts`.
- **Theme_Tokens**: The Tailwind colour and font tokens in `app/globals.css`, for example `base`, `panel`, `panel-2`, `gold`, `gold-light`, `cream`, `dim`, `hairline`, `card` and `font-mono`.
- **Codebase**: This repository.
- **Member**: A signed-in user of the internship tracker.

## Requirements

### Requirement 1: Open the calendar

**User Story:** As a Member, I want a calendar to pop up when I click a date field, so that I can pick a date instead of typing it.

#### Acceptance Criteria

1. THE Date_Field SHALL keep its existing visible label ("Date applied" or "Deadline") and display a Calendar_Trigger with a calendar icon, whether or not the Date_Field has a Selected_Date. The icon SHALL have a contrast ratio of at least 3:1 against the `panel-2` Theme_Token.
2. WHEN the Member clicks or taps any part of a Calendar_Trigger, THE Application_Form SHALL toggle that Date_Field's Calendar_Popup:
   - if the Calendar_Popup is closed, open it without bringing up the on-screen keyboard;
   - if the Calendar_Popup is open, close it, leave the Selected_Date unchanged and keep focus on the Calendar_Trigger.
3. WHEN the Member opens one Date_Field's Calendar_Popup while the other Date_Field's Calendar_Popup is open, THE Application_Form SHALL close the other Calendar_Popup, so that no more than one Calendar_Popup is open at a time.
4. WHEN a Calendar_Popup opens, THE Calendar_Popup SHALL set the Displayed_Month to the month and year of the Selected_Date. If the Date_Field has no Selected_Date, the Displayed_Month SHALL be the current month in the Member's local time zone.
5. WHILE a Calendar_Popup is open, THE Calendar_Popup SHALL appear directly below its Calendar_Trigger, or directly above it if there isn't room below. It SHALL sit fully inside the visible viewport, unclipped by the Application_Form container, and above all other Application_Form content.

### Requirement 2: Pick a date

**User Story:** As a Member, I want to click a day in the calendar, so that the field is filled in for me.

#### Acceptance Criteria

1. THE Calendar_Popup SHALL display the following for the Displayed_Month:
   - a heading with the en-GB full month name and four-digit year (for example "September 2025"), which updates whenever the Displayed_Month changes;
   - below the heading, a grid of 7 columns ordered Monday to Sunday, headed "Mon" to "Sun" in the `font-mono` Theme_Token;
   - every day of the Displayed_Month exactly once, as a Day_Cell in its correct weekday column.
2. WHEN the Member selects a Day_Cell by click, tap, Enter or Space, THE Date_Field SHALL set the Selected_Date to that day (or keep it, if that day was already selected), close the Calendar_Popup and move focus to the Calendar_Trigger.
3. WHILE the Selected_Date falls in the Displayed_Month, THE Calendar_Popup SHALL render the Day_Cell for the Selected_Date with a `gold` filled background and `base` text, a style that no other Day_Cell uses.
4. WHILE today's date in the Member's local time zone falls in the Displayed_Month, THE Calendar_Popup SHALL mark today's Day_Cell with an outline ring in the `gold` Theme_Token that no other Day_Cell uses. If today is also the Selected_Date, the Day_Cell SHALL get both the ring and the style from Requirement 2.3.
5. THE Calendar_Popup SHALL leave the grid positions before the first day and after the last day of the Displayed_Month empty, with no day number and no selectable control.

### Requirement 3: Move between months and years

**User Story:** As a Member, I want to move to other months and years, so that I can pick dates in the past or months ahead.

#### Acceptance Criteria

1. WHEN the Member activates the "previous month" or "next month" control in the heading row, THE Calendar_Popup SHALL move the Displayed_Month back or forward by one calendar month and stay open. Moving between December and January SHALL also change the year. These controls have no lower or upper limit.
2. THE Calendar_Popup SHALL provide a year select that lists every year in the Navigable_Range and has the Displayed_Month's year selected. If the "previous month" or "next month" control has moved the Displayed_Month outside the Navigable_Range, the year select SHALL also list the Displayed_Month's year.
3. WHEN the Member chooses a year in the year select, THE Calendar_Popup SHALL set the Displayed_Month to the same month in the chosen year and stay open.
4. WHEN the Displayed_Month changes through the month controls, the year select or keyboard navigation (Requirement 6.3), THE Date_Field SHALL keep the Selected_Date and the Submitted_Value unchanged until the Member selects a Day_Cell (Requirement 2.2).

### Requirement 4: Clear a date

**User Story:** As a Member, I want to clear a date, so that I can leave optional dates empty.

#### Acceptance Criteria

1. WHILE a Date_Field has a Selected_Date, THE Date_Field SHALL display a "Clear" control. The control SHALL be reachable with the Tab key and SHALL have an accessible name that includes the Date_Field label ("Clear date applied" or "Clear deadline").
2. WHEN the Member activates the "Clear" control, THE Date_Field SHALL:
   - set its Selected_Date to none;
   - move focus to its Calendar_Trigger;
   - keep its Calendar_Popup closed;
   - leave the other Date_Field and every other Application_Form field unchanged;
   - not submit the Application_Form.
3. WHILE a Date_Field has no Selected_Date, THE Date_Field SHALL display placeholder text in its Calendar_Trigger, in the `dim` Theme_Token, saying that no date is chosen, and SHALL display no "Clear" control.

### Requirement 5: Value, format and edit mode

**User Story:** As a Member, I want dates shown in the tracker's usual format and my saved dates kept when I edit. As a maintainer, I want the submitted value unchanged, so that the server code and database need no changes.

#### Acceptance Criteria

1. WHILE a Date_Field has a Selected_Date, THE Calendar_Trigger SHALL display the Selected_Date in Display_Format (for example "2 Sep 2025" or "29 Feb 2028"). It SHALL show the same calendar day in every local time zone from UTC−12:00 to UTC+14:00.
2. WHEN the Application_Form is submitted, THE Date_Field SHALL contribute exactly one Submitted_Value under its form name (`date_applied` or `deadline`):
   - if the Date_Field has a Selected_Date, a 10-character ISO_Date with no time, time zone or whitespace;
   - if it has no Selected_Date, an empty string. This includes edit mode after the Member has cleared a stored date.
3. FOR ALL calendar dates from 1 January 1900 to 31 December 2100 inclusive, including 29 February in leap years, formatting the date as an ISO_Date and then parsing that ISO_Date SHALL give back the original year, month and day (round-trip property).
4. FOR ALL calendar dates from 1 January 1900 to 31 December 2100 inclusive, and for every local time zone offset from UTC−12:00 to UTC+14:00, the following SHALL equal the calendar date of the selected Day_Cell (time-zone independence property):
   - the ISO_Date in the Submitted_Value;
   - the Display_Format text in the Calendar_Trigger.
   This includes the days when daylight saving time starts and ends.
5. WHEN the Application_Form opens in edit mode, THE Date_Field SHALL set its Selected_Date from the stored value:
   - for a stored ISO_Date, the Selected_Date SHALL be that date, displayed as in Requirement 5.1 (for example, "2025-09-02" displays as "2 Sep 2025");
   - for a null stored value, the Selected_Date SHALL be none, with the placeholder from Requirement 4.3.
6. WHEN the Application_Form is submitted in edit mode and the Member has neither selected a Day_Cell in a Date_Field nor activated its "Clear" control, THE Date_Field SHALL contribute its originally stored ISO_Date as the Submitted_Value, or an empty string if the stored value is null. This holds even if the Member opened that Calendar_Popup or changed its Displayed_Month.

### Requirement 6: Keyboard and screen reader support

**User Story:** As a Member using a keyboard or screen reader, I want to operate the calendar and know what is selected, so that I can pick dates without a mouse.

#### Acceptance Criteria

1. THE Calendar_Trigger SHALL be reachable with the Tab key at the position the date input holds in the Application_Form today. It SHALL respond to Enter and Space the same way it responds to a click (Requirement 1.2).
2. WHEN a Calendar_Popup opens, THE Calendar_Popup SHALL move keyboard focus to the Day_Cell for the Selected_Date. If the Date_Field has no Selected_Date, focus SHALL go to the Day_Cell for today's date in the Member's local time zone.
3. WHILE focus is on a Day_Cell, THE Calendar_Popup SHALL move focus back or forward one day on Left/Right Arrow and seven days on Up/Down Arrow, without changing the Selected_Date. If focus moves to a date outside the Displayed_Month, the Displayed_Month SHALL change to the month that contains the newly focused date.
4. WHILE a Calendar_Popup is open, THE Calendar_Popup SHALL show a focus indicator on its focused control. The indicator SHALL be at least 2 CSS pixels thick and have a contrast ratio of at least 3:1 against the Calendar_Popup background.
5. THE Calendar_Trigger SHALL expose the following to assistive technology:
   - an accessible name made of "Choose" and the Date_Field label ("Choose date applied" or "Choose deadline");
   - the Selected_Date in Display_Format, or "no date chosen" when the Date_Field has no Selected_Date;
   - an expanded or collapsed state that matches whether its Calendar_Popup is open.
6. WHILE a Calendar_Popup is open, THE Calendar_Popup SHALL expose a dialog role with an accessible name that contains the Date_Field label. Its "previous month", "next month" and year controls SHALL have the distinct accessible names "previous month", "next month" and "year".
7. THE Calendar_Popup SHALL give each Day_Cell an accessible name with the weekday, day, month and four-digit year in en-GB order (for example "Tuesday 2 September 2025"). It SHALL also expose:
   - only the Day_Cell for the Selected_Date as selected;
   - only the Day_Cell for today's date as the current date;
   - the empty positions from Requirement 2.5 with no name and no focusable control.
8. WHEN the Displayed_Month changes through the month controls, the year select or keyboard navigation (Requirement 6.3), THE Calendar_Popup SHALL announce the new month and year once through a polite live region, without moving keyboard focus.

### Requirement 7: Working inside the Application_Form modal

**User Story:** As a Member, I want the calendar to behave predictably inside the form, so that I don't lose my unsaved entry by accident.

#### Acceptance Criteria

1. WHEN the Member clicks, taps or activates anything inside a Calendar_Popup, including any part that extends beyond the Application_Form panel, THE Application_Form SHALL:
   - perform only that control's action;
   - stay open, with every entered field value unchanged;
   - not submit the Application_Form or call the Server_Actions.
2. WHILE a Calendar_Popup is open, WHEN the Member clicks or taps outside both the Calendar_Popup and its Calendar_Trigger (anywhere else in the Application_Form panel or on the modal backdrop), or moves focus out of both with Tab or Shift+Tab, THE Application_Form SHALL:
   - close only that Calendar_Popup;
   - keep the Selected_Date unchanged;
   - stay open, with every entered field value unchanged.
3. WHILE a Calendar_Popup is open, WHEN the Member presses Escape, THE Application_Form SHALL:
   - close only that Calendar_Popup;
   - keep the Selected_Date unchanged;
   - return focus to its Calendar_Trigger;
   - stay open, with every entered field value unchanged.
4. WHEN the Application_Form closes by any means (the Cancel button, a backdrop click while no Calendar_Popup is open, or a successful save), THE Application_Form SHALL close any open Calendar_Popup. Both Calendar_Popups SHALL be closed the next time the Application_Form opens.

### Requirement 8: Theme, devices and scope

**User Story:** As a Member, I want the calendar to match the site and work on my phone and laptop. As a maintainer, I want the change kept small and documented.

#### Acceptance Criteria

1. THE Calendar_Trigger SHALL use the same `fieldClass` styling as the Company input of the Application_Form: 44 CSS pixels high, a 1 CSS pixel `gold` border at 30% opacity, a 2 CSS pixel radius, 14 CSS pixel `cream` text, and a `gold` border while focused.
2. THE Calendar_Popup SHALL take every colour from a Theme_Token (opacity modifiers are allowed) and SHALL add no raw hex, rgb or hsl colour value. Its background SHALL be `panel` or `panel-2`, with a 1 CSS pixel border in `hairline` or `card`.
3. THE Calendar_Popup SHALL meet these contrast ratios against the background directly behind each element:
   - all text, including on the Selected_Date Day_Cell: at least 4.5:1;
   - icon-only controls: at least 3:1.
4. WHERE the Member's system has `prefers-reduced-motion: reduce` enabled, THE Calendar_Popup SHALL open, close and change the Displayed_Month with no transition or animation.
5. THE Date_Field SHALL meet Requirements 1 to 7 in the current stable release of each of these browsers:
   - Chrome, Edge, Firefox and Safari on desktop;
   - Safari on iOS;
   - Chrome on Android.
6. WHILE the viewport is between 320 and 400 CSS pixels wide, THE Calendar_Popup SHALL fit all seven weekday columns, the month heading, the "previous month" and "next month" controls and the year select inside the viewport width, without making the page or the Application_Form scroll horizontally.
7. THE Calendar_Trigger, the "Clear" control, each Day_Cell, the "previous month" and "next month" controls and the year select SHALL each have a touch target of at least 24 by 24 CSS pixels.
8. THE Codebase SHALL limit the change to the two Date_Fields. All of the following SHALL keep their current behaviour, styling and output:
   - every other Application_Form input;
   - dates shown outside the Application_Form;
   - `app/tracker/actions.ts`;
   - the database schema.
9. WHERE a third-party date-picker package is added, THE Codebase SHALL list it in `package.json` with an exact version (no `^`, `~`, range or wildcard). `docs/ARCHITECTURE.md` SHALL name the package, give its pinned version and explain why it was chosen over a custom build.
10. WHEN the feature is complete, THE Codebase SHALL pass `npm run lint` and `npm run build` with exit code 0 and with no errors or warnings beyond those the codebase reported before the change.
11. WHEN the feature is complete, THE Codebase SHALL include these documentation updates:
    - `docs/ARCHITECTURE.md` describes the Date_Field and Calendar_Popup components;
    - `docs/BACKLOG.md` marks the date-picker item as completed, if it lists one;
    - `docs/BACKLOG.md` logs the UTC off-by-one bug in `formatDate()` and `formatShortDate()` that affects the table and board views.
