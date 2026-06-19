"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteApplication } from "@/app/tracker/actions";
import { formatDate, type Application } from "@/data/tracker";
import StatusPill from "./StatusPill";

export default function ApplicationsTable({
  applications,
  onEdit,
  onNew,
}: {
  applications: Application[];
  onEdit: (a: Application) => void;
  onNew: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!confirm("Delete this application?")) return;
    startTransition(async () => {
      await deleteApplication(id);
      router.refresh();
    });
  }

  return (
    <div className="overflow-hidden rounded-b-[3px] border border-t-0 border-[rgba(201,162,75,.14)] bg-panel">
      {/* header row */}
      <div className="hidden bg-panel-2 font-mono text-[10.5px] uppercase tracking-[0.06em] text-[#8a847a] sm:flex">
        <div className="flex-[2] px-[18px] py-[13px]">Company</div>
        <div className="flex-[2.4] px-[18px] py-[13px]">Position</div>
        <div className="flex-[1.4] px-[18px] py-[13px]">Date applied</div>
        <div className="flex-[1.6] px-[18px] py-[13px]">Status</div>
        <div className="flex-[1.4] px-[18px] py-[13px]">Deadline</div>
        <div className="w-12 px-2 py-[13px]" />
      </div>

      {applications.length === 0 && (
        <div className="px-[18px] py-10 text-center text-[14px] text-dim">
          No applications yet. Add your first one below — or save a live opportunity above.
        </div>
      )}

      {applications.map((a) => (
        <div
          key={a.id}
          onClick={() => onEdit(a)}
          className="group flex cursor-pointer flex-col border-t border-[rgba(201,162,75,.08)] text-[13.5px] transition-colors first:border-t-0 hover:bg-gold/[0.04] sm:flex-row sm:items-center"
        >
          <div className="flex-[2] px-[18px] pt-[14px] font-semibold text-cream sm:py-[14px]">
            {a.company}
          </div>
          <div className="flex-[2.4] px-[18px] text-muted sm:py-[14px]">{a.position || "—"}</div>
          <div className="flex-[1.4] px-[18px] text-dim sm:py-[14px]">
            {formatDate(a.date_applied)}
          </div>
          <div className="flex-[1.6] px-[18px] py-2 sm:py-[14px]">
            <StatusPill status={a.status} />
          </div>
          <div className="flex-[1.4] px-[18px] pb-[14px] text-dim sm:py-[14px]">
            {a.deadline ? formatDate(a.deadline) : <span className="text-faint">—</span>}
          </div>
          <div className="w-12 px-2 pb-[14px] sm:py-[14px]">
            <button
              type="button"
              onClick={(e) => handleDelete(e, a.id)}
              disabled={pending}
              aria-label={`Delete ${a.company} application`}
              className="text-faint opacity-0 transition-opacity hover:text-[#e0a0a0] group-hover:opacity-100 disabled:opacity-40"
            >
              ✕
            </button>
          </div>
        </div>
      ))}

      {/* new row affordance */}
      <button
        type="button"
        onClick={onNew}
        className="w-full border-t border-[rgba(201,162,75,.1)] px-[18px] py-3 text-left text-[13px] text-faint transition-colors hover:text-gold-light"
      >
        ＋ New application
      </button>
    </div>
  );
}
