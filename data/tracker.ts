/**
 * Internship tracker — shared types, the status enum, and the maps that keep
 * the table view and the kanban board in sync. Single source of truth.
 */

export const STATUSES = [
  "Submitted",
  "OA completed",
  "HV completed",
  "Interview sent",
  "Successful",
  "Rejected",
] as const;

export type Status = (typeof STATUSES)[number];

export type Application = {
  id: string;
  company: string;
  position: string;
  date_applied: string | null; // ISO date
  status: Status;
  deadline: string | null; // ISO date
  notes: string | null;
};

export type Opportunity = {
  id: string;
  role_title: string;
  employer: string;
  location: string | null;
  season: string | null;
  closes_on: string | null; // ISO date
  link: string | null;
};

/** Status → pill colours (from the design handoff status-pill table). */
export const STATUS_PILL: Record<Status, { bg: string; fg: string }> = {
  Submitted: { bg: "rgba(201,162,75,.2)", fg: "#e6c878" },
  "OA completed": { bg: "rgba(150,150,150,.18)", fg: "#c3bdb2" },
  "HV completed": { bg: "rgba(90,130,180,.22)", fg: "#a6c4e8" },
  "Interview sent": { bg: "rgba(150,110,180,.22)", fg: "#cbaee0" },
  Successful: { bg: "rgba(95,150,95,.22)", fg: "#9fd49f" },
  Rejected: { bg: "rgba(180,90,90,.2)", fg: "#e0a0a0" },
};

/** Kanban columns (design has 4; we add a muted Rejected column so no data hides). */
export type BoardColumn = {
  key: string;
  label: string;
  /** mono header colour */
  color: string;
  statuses: Status[];
  /** offer/rejected get a tinted mini-card border */
  cardBorder?: string;
};

export const BOARD_COLUMNS: BoardColumn[] = [
  { key: "submitted", label: "SUBMITTED", color: "#e6c878", statuses: ["Submitted"] },
  { key: "oa", label: "OA / TEST", color: "#c3bdb2", statuses: ["OA completed"] },
  {
    key: "interview",
    label: "INTERVIEW",
    color: "#cbaee0",
    statuses: ["HV completed", "Interview sent"],
  },
  {
    key: "offer",
    label: "OFFER",
    color: "#9fd49f",
    statuses: ["Successful"],
    cardBorder: "rgba(95,150,95,.3)",
  },
  {
    key: "rejected",
    label: "REJECTED",
    color: "#9a948a",
    statuses: ["Rejected"],
    cardBorder: "rgba(180,90,90,.22)",
  },
];

/** Pretty date like "2 Sep 2025" from an ISO date string. */
export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Short date like "30 Nov" for opportunity deadlines. */
export function formatShortDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}
