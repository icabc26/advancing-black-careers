"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { STATUSES, type Status } from "@/data/tracker";

export type ActionResult = { ok: true } | { ok: false; error: string };

function parseStatus(v: FormDataEntryValue | null): Status {
  const s = String(v ?? "Submitted");
  return (STATUSES as readonly string[]).includes(s) ? (s as Status) : "Submitted";
}

function dateOrNull(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Create a new application owned by the current member. */
export async function createApplication(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const company = String(formData.get("company") ?? "").trim();
  if (!company) return { ok: false, error: "Company is required." };

  const { error } = await supabase.from("applications").insert({
    user_id: user.id,
    company,
    position: String(formData.get("position") ?? "").trim(),
    date_applied: dateOrNull(formData.get("date_applied")),
    status: parseStatus(formData.get("status")),
    deadline: dateOrNull(formData.get("deadline")),
    notes: String(formData.get("notes") ?? "").trim() || null,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/tracker");
  return { ok: true };
}

/** Update an existing application (RLS ensures it belongs to the member). */
export async function updateApplication(formData: FormData): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing application id." };

  const company = String(formData.get("company") ?? "").trim();
  if (!company) return { ok: false, error: "Company is required." };

  const { error } = await supabase
    .from("applications")
    .update({
      company,
      position: String(formData.get("position") ?? "").trim(),
      date_applied: dateOrNull(formData.get("date_applied")),
      status: parseStatus(formData.get("status")),
      deadline: dateOrNull(formData.get("deadline")),
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/tracker");
  return { ok: true };
}

/** Delete an application. */
export async function deleteApplication(id: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { error } = await supabase.from("applications").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/tracker");
  return { ok: true };
}

/** "Save" a Live opportunity onto the member's board as a Submitted row. */
export async function saveOpportunity(opportunityId: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const { data: opp, error: oppErr } = await supabase
    .from("opportunities")
    .select("role_title, employer")
    .eq("id", opportunityId)
    .maybeSingle();

  if (oppErr) return { ok: false, error: oppErr.message };
  if (!opp) return { ok: false, error: "Opportunity not found." };

  const { error } = await supabase.from("applications").insert({
    user_id: user.id,
    company: opp.employer,
    position: opp.role_title,
    date_applied: new Date().toISOString().slice(0, 10),
    status: "Submitted",
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/tracker");
  return { ok: true };
}
