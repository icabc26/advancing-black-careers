"use client";

import { useId, useRef, useState } from "react";
import CalendarPopup from "@/components/tracker/CalendarPopup";
import { fieldClass, labelClass } from "@/components/tracker/formStyles";
import { formatDisplay, formatIso, parseIso, type CalDate } from "@/lib/dates";

export type DateFieldProps = {
  /** "date_applied" | "deadline"; the trigger's id, so the label targets it. */
  id: string;
  /** Form name of the hidden input, the only named element (Req 5.2). */
  name: string;
  /** Visible label, e.g. "Date applied". */
  label: string;
  /** Stored ISO date or null (Req 5.5). */
  defaultValue: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

export default function DateField({
  id,
  name,
  label,
  defaultValue,
  open,
  onOpenChange,
}: DateFieldProps) {
  // Only a Day_Cell or Clear changes this (Req 3.4, 5.6).
  const [selected, setSelected] = useState<CalDate | null>(() =>
    parseIso(defaultValue ?? ""),
  );
  const triggerRef = useRef<HTMLButtonElement>(null);
  const uid = useId();
  const popupId = `${id}-calendar-${uid}`;
  const descId = `${id}-value-${uid}`;
  const lowerLabel = label.toLowerCase();
  const display = selected ? formatDisplay(selected) : null;

  function focusTrigger() {
    triggerRef.current?.focus();
  }

  // Req 2.2: pick, close, return focus to the trigger.
  function handleSelect(date: CalDate) {
    setSelected(date);
    onOpenChange(false);
    focusTrigger();
  }

  // Escape refocuses; outside press or focus out leave focus where it went.
  function handleClose({ refocus }: { refocus: boolean }) {
    onOpenChange(false);
    if (refocus) focusTrigger();
  }

  // Req 4.2: empty the field, keep the popup closed, refocus the trigger.
  function handleClear() {
    setSelected(null);
    onOpenChange(false);
    focusTrigger();
  }

  return (
    <div>
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        {/* A <button>, not an <input>, so no on-screen keyboard (Req 1.2). */}
        <button
          ref={triggerRef}
          type="button"
          id={id}
          aria-label={`Choose ${lowerLabel}`}
          aria-describedby={descId}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={popupId}
          onClick={() => onOpenChange(!open)}
          className={`${fieldClass} flex items-center gap-2 text-left`}
        >
          <span className={`min-w-0 flex-1 truncate ${display ? "text-cream" : "text-dim"}`}>
            {display ?? "No date chosen"}
          </span>
          {/* Reserves room for the Clear button so text never sits under it. */}
          {selected && <span aria-hidden="true" className="h-7 w-7 shrink-0" />}
          <CalendarIcon />
        </button>
        <span id={descId} hidden>
          {display ?? "no date chosen"}
        </span>

        {/* Sibling of the trigger (no nested buttons); after it in tab order (Req 4.1). */}
        {selected && (
          <button
            type="button"
            aria-label={`Clear ${lowerLabel}`}
            onClick={handleClear}
            className={`absolute right-9 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-[2px] text-gold-light hover:bg-gold/10 ${focusRing}`}
          >
            <ClearIcon />
          </button>
        )}

        <input type="hidden" name={name} value={selected ? formatIso(selected) : ""} />
      </div>

      {open && (
        <CalendarPopup
          id={popupId}
          label={label}
          selected={selected}
          triggerRef={triggerRef}
          onSelect={handleSelect}
          onClose={handleClose}
        />
      )}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-gold"
    >
      <rect x="2" y="3" width="12" height="11" rx="1.5" />
      <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    >
      <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
    </svg>
  );
}
