// Shared Application_Form field styles, used by ApplicationForm and DateField.
// Kept in their own module so DateField doesn't import ApplicationForm (cycle).

export const fieldClass =
  "h-11 w-full rounded-[2px] border border-gold/30 bg-transparent px-3 text-[14px] text-cream placeholder:text-faint focus:border-gold focus:outline-none";
export const labelClass = "mb-1.5 block font-mono text-[11px] uppercase tracking-[0.1em] text-dim";
