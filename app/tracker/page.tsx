import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Tracker from "@/components/tracker/Tracker";
import OpportunityCard from "@/components/tracker/OpportunityCard";
import type { Application, Opportunity } from "@/data/tracker";

export const metadata: Metadata = {
  title: "Internship Tracker · Imperial ABC",
  description: "Live opportunities curated by ABC plus your personal application board.",
};

export default async function TrackerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware already guards this, but double-check on the server.
  if (!user) redirect("/login?redirect=/tracker");

  const [{ data: opportunities }, { data: applications }] = await Promise.all([
    supabase
      .from("opportunities")
      .select("id, role_title, employer, location, season, closes_on, link")
      .order("closes_on", { ascending: true }),
    supabase
      .from("applications")
      .select("id, company, position, date_applied, status, deadline, notes")
      .order("created_at", { ascending: false }),
  ]);

  const opps = (opportunities ?? []) as Opportunity[];
  const apps = (applications ?? []) as Application[];

  return (
    <div className="mx-auto max-w-[1320px] px-5 sm:px-8 md:px-14">
      {/* Header */}
      <header className="max-w-[720px] pt-16 md:pt-20">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-mono-label">
          For members
        </p>
        <h1 className="font-serif text-5xl font-semibold leading-[1.02] sm:text-6xl md:text-[64px]">
          Internship Tracker
        </h1>
        <p className="mt-4 text-[16px] leading-[1.65] text-muted">
          Live opportunities curated by ABC, plus your own application board — so nothing slips
          through the cracks.
        </p>
      </header>

      {/* Live opportunities */}
      {opps.length > 0 && (
        <section className="pt-14">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="font-serif text-[30px]">Live opportunities</h2>
          </div>
          <div className="grid gap-[18px] md:grid-cols-2 lg:grid-cols-3">
            {opps.map((o) => (
              <OpportunityCard key={o.id} opportunity={o} />
            ))}
          </div>
        </section>
      )}

      {/* My applications */}
      <section className="py-16 pt-16">
        <Tracker applications={apps} />
      </section>
    </div>
  );
}
