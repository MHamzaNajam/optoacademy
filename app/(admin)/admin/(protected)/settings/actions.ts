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
    .select("role")
    .eq("id", adminId)
    .single();

  if (!adminRow || adminRow.role !== "super_admin") {
    redirect("/admin/dashboard?error=noaccess");
  }
}

export async function updateTrialLimit(formData: FormData) {
  await checkPermission();

  const limit = formData.get("trial_limit") as string;

  await supabaseAdmin
    .from("app_settings")
    .update({ value: limit })
    .eq("key", "trial_question_limit");

  redirect("/admin/settings?saved=1");
}
