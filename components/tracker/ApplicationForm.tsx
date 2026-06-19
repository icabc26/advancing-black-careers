"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createApplication, updateApplication } from "@/app/tracker/actions";
import { STATUSES, type Application } from "@/data/tracker";

const fieldClass =
  "h-11 w-full rounded-[2px] border border-gold/30 bg-transparent px-3 text-[14px] text-cream placeholder:text-faint focus:border-gold focus:outline-none";
const labelClass = "mb-1.5 block font-mono text-[11px] uppercase tracking-[0.1em] text-dim";

export default function ApplicationForm({
  application,
  onClose,
}: {
  /** Provided = edit mode; omitted = create mode. */
  application?: Application;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const editing = Boolean(application);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = editing
        ? await updateApplication(formData)
        : await createApplication(formData);
      if (res.ok) {
        router.refresh();
        onClose();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-[520px] rounded-[3px] border border-card bg-panel-2 p-7 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-5 font-serif text-[26px]">
          {editing ? "Edit application" : "New application"}
        </h2>

        <form onSubmit={handleSubmit}>
          {editing && <input type="hidden" name="id" defaultValue={application!.id} />}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="company">
                Company
              </label>
              <input
                id="company"
                name="company"
                required
                defaultValue={application?.company ?? ""}
                placeholder="e.g. JP Morgan"
                className={fieldClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="position">
                Position
              </label>
              <input
                id="position"
                name="position"
                defaultValue={application?.position ?? ""}
                placeholder="e.g. SWE Summer Intern"
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="date_applied">
                Date applied
              </label>
              <input
                id="date_applied"
                name="date_applied"
                type="date"
                defaultValue={application?.date_applied ?? ""}
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="deadline">
                Deadline
              </label>
              <input
                id="deadline"
                name="deadline"
                type="date"
                defaultValue={application?.deadline ?? ""}
                className={fieldClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="status">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={application?.status ?? "Submitted"}
                className={`${fieldClass} appearance-none`}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-panel-2 text-cream">
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="notes">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                defaultValue={application?.notes ?? ""}
                placeholder="Optional"
                className="w-full rounded-[2px] border border-gold/30 bg-transparent px-3 py-2 text-[14px] text-cream placeholder:text-faint focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          {error && <p className="mt-4 text-[13px] text-[#e0a0a0]">{error}</p>}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[2px] border border-gold/40 px-5 py-2.5 text-[13.5px] text-gold-light transition-colors hover:bg-gold/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-[2px] bg-gold px-6 py-2.5 text-[13.5px] font-semibold text-base transition-all hover:brightness-110 disabled:opacity-60"
            >
              {pending ? "Saving…" : editing ? "Save changes" : "Add application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
