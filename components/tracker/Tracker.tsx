"use client";

import { useState } from "react";
import type { Application } from "@/data/tracker";
import ApplicationsTable from "./ApplicationsTable";
import StatusBoard from "./StatusBoard";
import ApplicationForm from "./ApplicationForm";

type Tab = "table" | "board" | "chart";

const tabs: { key: Tab; label: string }[] = [
  { key: "table", label: "▦ All applications" },
  { key: "board", label: "▥ Status board" },
  { key: "chart", label: "◷ Chart" },
];

export default function Tracker({ applications }: { applications: Application[] }) {
  const [tab, setTab] = useState<Tab>("table");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Application | undefined>(undefined);

  function openNew() {
    setEditing(undefined);
    setFormOpen(true);
  }
  function openEdit(a: Application) {
    setEditing(a);
    setFormOpen(true);
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-serif text-[30px]">My applications</h2>
        <button
          type="button"
          onClick={openNew}
          className="rounded-[2px] bg-gold px-4 py-2 text-[12.5px] font-semibold text-base transition-all hover:brightness-110"
        >
          ＋ New
        </button>
      </div>

      {/* view tabs */}
      <div className="flex items-center gap-1.5 border-b border-hairline">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-4 py-[11px] text-[13px] transition-colors ${
              tab === t.key
                ? "border-gold text-cream"
                : "border-transparent text-dim hover:text-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="pt-0">
        {tab === "table" && (
          <ApplicationsTable applications={applications} onEdit={openEdit} onNew={openNew} />
        )}
        {tab === "board" && (
          <div className="pt-6">
            <StatusBoard applications={applications} onEdit={openEdit} />
          </div>
        )}
        {tab === "chart" && (
          <div className="mt-6 rounded-[3px] border border-card bg-panel p-12 text-center">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-gold-light">
              Coming soon
            </p>
            <p className="font-serif text-[24px]">Charts are on the way</p>
            <p className="mx-auto mt-2 max-w-[420px] text-[14px] text-muted">
              We&apos;re building a visual breakdown of your applications by status and season.
              For now, use the table and status board.
            </p>
          </div>
        )}
      </div>

      {formOpen && (
        <ApplicationForm application={editing} onClose={() => setFormOpen(false)} />
      )}
    </div>
  );
}
