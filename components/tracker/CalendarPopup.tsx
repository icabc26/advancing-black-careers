"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  addDays,
  addMonths,
  formatAccessibleName,
  formatMonthHeading,
  monthGrid,
  sameDay,
  todayLocal,
  yearOptions,
  type CalDate,
  type YearMonth,
} from "@/lib/dates";

export type CalendarPopupProps = {
  /** Popup id, referenced by the trigger's aria-controls. */
  id: string;
  /** Date_Field label, e.g. "Date applied". */
  label: string;
  selected: CalDate | null;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  /** DateField sets the value, closes the popup and refocuses the trigger. */
  onSelect: (date: CalDate) => void;
  /** Escape (refocus: true), outside press or focus out (refocus: false). */
  onClose: (opts: { refocus: boolean }) => void;
};

const WEEKDAYS = [
  ["Mon", "Monday"],
  ["Tue", "Tuesday"],
  ["Wed", "Wednesday"],
  ["Thu", "Thursday"],
  ["Fri", "Friday"],
  ["Sat", "Saturday"],
  ["Sun", "Sunday"],
] as const;

// Shared focus ring: 2px gold outline, ~8:1 against panel-2 (Req 6.4).
const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

const navButtonClass = `flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] text-gold-light hover:bg-gold/10 ${focusRing}`;

// Arrow key → day offset for grid navigation (Req 6.3).
const ARROW_DELTAS: Record<string, number> = {
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -7,
  ArrowDown: 7,
};

const VIEWPORT_MARGIN = 8;
const TRIGGER_GAP = 4;
const MAX_WIDTH = 320;

export default function CalendarPopup({
  id,
  label,
  selected,
  triggerRef,
  onSelect,
  onClose,
}: CalendarPopupProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  // Latest onClose, so the document listener below is attached once and
  // never calls a stale callback. Updated in an effect, not during render.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  const gridRef = useRef<HTMLTableElement>(null);
  // "Today" is fixed for the lifetime of the popup (local time on purpose).
  const [today] = useState<CalDate>(() => todayLocal());
  // Req 1.4: open on the selected date's month, else the current month.
  const [displayed, setDisplayed] = useState<YearMonth>(() => {
    const start = selected ?? todayLocal();
    return { y: start.y, m: start.m };
  });
  // Req 6.2: the roving focus starts on the selected day, else today.
  const [focused, setFocused] = useState<CalDate>(() => selected ?? todayLocal());
  // Req 6.8: polite live region text for month changes.
  const [announce, setAnnounce] = useState("");
  // Set on mount and by arrow keys only, so month buttons and the year
  // select never move focus (Req 6.8).
  const shouldFocusRef = useRef(true);

  // Req 1.5: fixed position below the trigger, flipped above if needed,
  // always inside the viewport. Written straight to the DOM so there is no
  // unpositioned frame and no extra render.
  useLayoutEffect(() => {
    const root = rootRef.current;
    const trigger = triggerRef.current;
    if (!root || !trigger) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rect = trigger.getBoundingClientRect();

    const width = Math.min(MAX_WIDTH, vw - VIEWPORT_MARGIN * 2);
    root.style.width = `${width}px`;
    const left = Math.min(
      Math.max(rect.left, VIEWPORT_MARGIN),
      vw - width - VIEWPORT_MARGIN,
    );

    const h = root.offsetHeight;
    const below = rect.bottom + TRIGGER_GAP;
    const above = rect.top - TRIGGER_GAP - h;
    let top: number;
    if (below + h <= vh - VIEWPORT_MARGIN) top = below;
    else if (above >= VIEWPORT_MARGIN) top = above;
    else top = Math.min(Math.max(below, VIEWPORT_MARGIN), vh - h - VIEWPORT_MARGIN);

    root.style.left = `${left}px`;
    root.style.top = `${Math.max(top, VIEWPORT_MARGIN)}px`;
    root.style.visibility = "visible";
  }, [displayed, triggerRef]);

  // Single tab stop in the grid: `focused` when it's in the displayed month,
  // else day 1 (after the month buttons or year select moved away).
  const tabDay: CalDate =
    focused.y === displayed.y && focused.m === displayed.m
      ? focused
      : { y: displayed.y, m: displayed.m, d: 1 };

  // Move DOM focus to the tab stop on mount and after arrow keys only.
  // Runs after the layout effect has made the popup visible.
  useEffect(() => {
    if (!shouldFocusRef.current) return;
    shouldFocusRef.current = false;
    gridRef.current
      ?.querySelector<HTMLButtonElement>('button[tabindex="0"]')
      ?.focus({ preventScroll: true });
  }, [focused, displayed]);

  // Req 7.2: a press outside the popup closes it without refocusing. The
  // trigger is excluded so its own onClick toggles the popup closed (Req 1.2)
  // instead of closing here and immediately reopening.
  useEffect(() => {
    function onDocPointerDown(e: PointerEvent) {
      const target = e.target as Node | null;
      if (!target) return;
      if (rootRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      onCloseRef.current({ refocus: false });
    }
    document.addEventListener("pointerdown", onDocPointerDown);
    return () => document.removeEventListener("pointerdown", onDocPointerDown);
  }, [triggerRef]);

  // Req 7.3: Escape closes only the popup (not the modal) and refocuses the
  // trigger.
  function onRootKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Escape") return;
    e.preventDefault();
    e.stopPropagation();
    onClose({ refocus: true });
  }

  // Req 7.1: React events from a portal bubble through the React tree, so a
  // click here would otherwise reach the modal backdrop's onClick and close
  // the form. Stop it at the popup rather than relying on the panel wrapper.
  function onRootClick(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
  }

  // Req 7.2: Tab (or any focus move) out of the popup closes it. A null
  // relatedTarget is ignored: Safari doesn't focus buttons on click, and
  // clicks on popup padding blur to null. Real outside clicks are handled by
  // the pointerdown listener above.
  function onRootBlur(e: React.FocusEvent<HTMLDivElement>) {
    const next = e.relatedTarget as Node | null;
    if (!next) return;
    if (rootRef.current?.contains(next)) return;
    if (triggerRef.current?.contains(next)) return;
    onClose({ refocus: false });
  }

  // Month changes only touch `displayed`, never `selected` (Req 3.4).
  function showMonth(ym: YearMonth) {
    setDisplayed(ym);
    setAnnounce(formatMonthHeading(ym));
  }

  function goMonth(n: number) {
    showMonth(addMonths(displayed, n));
  }

  function chooseYear(y: number) {
    showMonth({ y, m: displayed.m });
  }

  // Req 6.3: arrows move focus by ±1 / ±7 days, following into the next or
  // previous month. Enter/Space fall through to the native button click.
  function onGridKeyDown(e: React.KeyboardEvent<HTMLTableElement>) {
    const delta = ARROW_DELTAS[e.key];
    if (delta === undefined) return;
    e.preventDefault();
    const next = addDays(tabDay, delta);
    shouldFocusRef.current = true;
    setFocused(next);
    if (next.y !== displayed.y || next.m !== displayed.m) {
      showMonth({ y: next.y, m: next.m });
    }
  }

  const years = yearOptions(today.y, selected?.y ?? null, displayed.y);
  const rows = monthGrid(displayed);
  const headingId = `${id}-heading`;

  return createPortal(
    <div
      ref={rootRef}
      id={id}
      role="dialog"
      aria-label={`${label} calendar`}
      onKeyDown={onRootKeyDown}
      onClick={onRootClick}
      onBlur={onRootBlur}
      className="invisible fixed left-0 top-0 z-[70] rounded-[3px] border border-card bg-panel-2 p-3 text-cream shadow-xl"
    >
      <div className="mb-2 flex items-center gap-1">
        <button
          type="button"
          aria-label="previous month"
          onClick={() => goMonth(-1)}
          className={navButtonClass}
        >
          <Chevron direction="left" />
        </button>
        <h2
          id={headingId}
          className="min-w-0 flex-1 text-center text-[14px] font-semibold text-cream"
        >
          {formatMonthHeading(displayed)}
        </h2>
        <select
          aria-label="year"
          value={displayed.y}
          onChange={(e) => chooseYear(Number(e.target.value))}
          className={`h-9 shrink-0 rounded-[2px] border border-gold/30 bg-transparent px-1.5 font-mono text-[12px] text-cream ${focusRing}`}
        >
          {years.map((y) => (
            <option key={y} value={y} className="bg-panel-2 text-cream">
              {y}
            </option>
          ))}
        </select>
        <button
          type="button"
          aria-label="next month"
          onClick={() => goMonth(1)}
          className={navButtonClass}
        >
          <Chevron direction="right" />
        </button>
      </div>

      <table
        ref={gridRef}
        role="grid"
        aria-labelledby={headingId}
        onKeyDown={onGridKeyDown}
        className="w-full border-collapse"
      >
        <thead>
          <tr>
            {WEEKDAYS.map(([short, long]) => (
              <th
                key={short}
                scope="col"
                abbr={long}
                className="h-8 text-center font-mono text-[11px] font-normal uppercase tracking-[0.05em] text-dim"
              >
                {short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((day, ci) => {
                // Req 2.5 / 6.7: padding cells have no name and no control.
                if (!day) return <td key={ci} />;
                const isSelected = sameDay(day, selected);
                const isToday = sameDay(day, today);
                return (
                  <td
                    key={ci}
                    role="gridcell"
                    aria-selected={isSelected}
                    className="p-0 text-center"
                  >
                    <button
                      type="button"
                      tabIndex={sameDay(day, tabDay) ? 0 : -1}
                      aria-label={formatAccessibleName(day)}
                      aria-current={isToday ? "date" : undefined}
                      // Keep the roving stop in sync if focus lands here by
                      // pointer or Tab, so arrows start from this day.
                      onFocus={() =>
                        setFocused((f) => (sameDay(f, day) ? f : day))
                      }
                      onClick={() => onSelect(day)}
                      className={[
                        "mx-auto flex h-9 w-9 items-center justify-center rounded-[2px] text-[13px]",
                        focusRing,
                        isSelected
                          ? "bg-gold font-semibold text-base"
                          : "text-cream hover:bg-gold/10",
                        isToday ? "ring-1 ring-gold" : "",
                      ].join(" ")}
                    >
                      {day.d}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div aria-live="polite" className="sr-only">
        {announce}
      </div>
    </div>,
    document.body,
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === "left" ? <path d="M10 3 5 8l5 5" /> : <path d="m6 3 5 5-5 5" />}
    </svg>
  );
}
