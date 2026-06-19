"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveOpportunity } from "@/app/tracker/actions";
import { formatShortDate, type Opportunity } from "@/data/tracker";

export default function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    startTransition(async () => {
      const res = await saveOpportunity(opportunity.id);
      if (res.ok) {
        setSaved(true);
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col rounded-[3px] border border-card bg-panel p-[26px]">
      <div className="mb-[18px] flex items-start justify-between">
        <div className="glow-fill h-[42px] w-[42px] rounded-md border border-gold/35" />
        {opportunity.season && (
          <span className="rounded-[20px] border border-gold/30 px-[9px] py-1 font-mono text-[10px] text-gold-light">
            {opportunity.season}
          </span>
        )}
      </div>
      <div className="font-serif text-[21px] leading-[1.15]">{opportunity.role_title}</div>
      <div className="mb-5 mt-1.5 text-[12.5px] text-dim">
        {[opportunity.employer, opportunity.location].filter(Boolean).join(" · ")}
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-[rgba(201,162,75,.12)] pt-4">
        <span className="font-mono text-[11px] text-[#c98a4b]">
          {opportunity.closes_on ? `Closes ${formatShortDate(opportunity.closes_on)}` : "Open"}
        </span>
        <button
          type="button"
          onClick={handleSave}
          disabled={pending || saved}
          className="rounded-[2px] border border-gold/40 px-4 py-2 text-[11.5px] text-gold-light transition-colors hover:bg-gold/10 disabled:opacity-60"
        >
          {saved ? "Saved ✓" : pending ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
