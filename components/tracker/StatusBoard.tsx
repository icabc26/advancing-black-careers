"use client";

import { BOARD_COLUMNS, type Application } from "@/data/tracker";

export default function StatusBoard({
  applications,
  onEdit,
}: {
  applications: Application[];
  onEdit: (a: Application) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
      {BOARD_COLUMNS.map((col) => {
        const items = applications.filter((a) => col.statuses.includes(a.status));
        return (
          <div
            key={col.key}
            className="rounded-[3px] border border-[rgba(201,162,75,.14)] bg-panel p-3.5"
          >
            <div
              className="mb-3.5 flex items-center justify-between font-mono text-[11px] tracking-[0.06em]"
              style={{ color: col.color }}
            >
              <span>{col.label}</span>
              <span className="text-faint">{items.length}</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {items.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => onEdit(a)}
                  className="rounded-[3px] border bg-panel-2 p-3 text-left transition-colors hover:border-gold/50"
                  style={{ borderColor: col.cardBorder ?? "rgba(201,162,75,.16)" }}
                >
                  <div className="mb-0.5 text-[13px] text-cream">{a.company}</div>
                  <div className="text-[11.5px] text-dim">{a.position || "—"}</div>
                </button>
              ))}
              {items.length === 0 && (
                <p className="px-1 py-2 text-[12px] text-faint">Nothing here yet.</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
