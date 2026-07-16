"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function checkPermission() {
  const cookieStore = cookies();
  const adminId = cookieStore.get("admin_id")?.value;
  if (!adminId) redirect("/admin");

  const { data: adminRow } = await supabaseAdmin
    .from("admin_users")
    .select("role, can_manage_questions")
    .eq("id", adminId)
    .single();

  if (!adminRow) redirect("/admin");
  const allowed = adminRow.role === "super_admin" || adminRow.can_manage_questions;
  if (!allowed) redirect("/admin/dashboard?error=noaccess");
}

export async function deleteQuestion(formData: FormData) {
  await checkPermission();

  const id = formData.get("id") as string;
  const page = formData.get("page") as string;

  await supabaseAdmin.from("questions").delete().eq("id", id);

  redirect(`/admin/questions?page=${page || "1"}`);
}

export async function updateQuestion(formData: FormData) {
  await checkPermission();
  const id = formData.get("id") as string;
  const domain_id = formData.get("domain_id") as string;
  const stem = formData.get("stem") as string;
  const option_a = formData.get("option_a") as string;
  const option_b = formData.get("option_b") as string;
  const option_c = formData.get("option_c") as string;
  const option_d = formData.get("option_d") as string;
  const option_e = formData.get("option_e") as string;
  const correct_option = formData.get("correct_option") as string;
  const explanation = formData.get("explanation") as string;
  const difficulty = formData.get("difficulty") as string;
  const is_active = formData.get("is_active") === "on";
  const is_trial = formData.get("is_trial") === "on";
  const trialOrderRaw = formData.get("trial_order") as string;
  const trial_order = trialOrderRaw ? parseInt(trialOrderRaw, 10) : null;
  const returnQuery = (formData.get("returnQuery") as string) || "";

  await supabaseAdmin
    .from("questions")
    .update({
      domain_id,
      stem,
      option_a,
      option_b,
      option_c,
      option_d: option_d || null,
      option_e: option_e || null,
      correct_option,
      explanation,
      difficulty,
      is_active,
      is_trial,
      trial_order,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  redirect(`/admin/questions?success=updated${returnQuery ? `&${returnQuery}` : ""}`);
}
