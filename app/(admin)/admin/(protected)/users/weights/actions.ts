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
    .select("role, can_manage_users")
    .eq("id", adminId)
    .single();

  if (!adminRow) redirect("/admin");
  const allowed = adminRow.role === "super_admin" || adminRow.can_manage_users;
  if (!allowed) redirect("/admin/dashboard?error=noaccess");
}

export async function saveUserWeights(formData: FormData) {
  await checkPermission();

  const userId = formData.get("userId") as string;
  const { data: domains } = await supabaseAdmin.from("domains").select("id");
  if (!domains) return;

  for (const d of domains) {
    const value = formData.get(`weight_${d.id}`);
    const weight = parseFloat(value as string) || 0;

    await supabaseAdmin
      .from("user_domain_weights")
      .upsert(
        { user_id: userId, domain_id: d.id, weight_percentage: weight },
        { onConflict: "user_id,domain_id" }
      );
  }

  redirect(`/admin/users/weights?userId=${userId}&saved=1`);
}

export async function resetToDefault(formData: FormData) {
  await checkPermission();

  const userId = formData.get("userId") as string;

  await supabaseAdmin
    .from("user_domain_weights")
    .delete()
    .eq("user_id", userId);

  redirect(`/admin/users/weights?userId=${userId}&saved=1`);
}
