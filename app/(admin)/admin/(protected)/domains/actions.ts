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

export async function updateWeights(formData: FormData) {
  await checkPermission();

  const { data: domains } = await supabaseAdmin.from("domains").select("id");
  if (!domains) return;

  for (const d of domains) {
    const value = formData.get(`weight_${d.id}`);
    if (value !== null) {
      await supabaseAdmin
        .from("domains")
        .update({ weight_percentage: parseFloat(value as string) || 0 })
        .eq("id", d.id);
    }
  }

  redirect("/admin/domains");
}
