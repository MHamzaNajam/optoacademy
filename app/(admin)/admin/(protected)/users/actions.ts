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

export async function toggleSuspend(formData: FormData) {
  await checkPermission();

  const userId = formData.get("userId") as string;
  const currentlySuspended = formData.get("currentlySuspended") === "true";

  await supabaseAdmin
    .from("users")
    .update({ is_suspended: !currentlySuspended })
    .eq("id", userId);

  redirect("/admin/users");
}

export async function updateSubscription(formData: FormData) {
  await checkPermission();

  const userId = formData.get("userId") as string;
  const plan = formData.get("plan") as string;
  const status = formData.get("status") as string;

  const { data: existing } = await supabaseAdmin
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (existing) {
    await supabaseAdmin
      .from("subscriptions")
      .update({ plan, status })
      .eq("user_id", userId);
  } else {
    await supabaseAdmin
      .from("subscriptions")
      .insert({ user_id: userId, plan, status });
  }

  redirect("/admin/users");
}
export async function deleteUser(formData: FormData) {
  await checkPermission();

  const userId = formData.get("userId") as string;

  // Deleting the Supabase Auth user cascades to remove their row in the users table too
  await supabaseAdmin.auth.admin.deleteUser(userId);

  redirect("/admin/users");
}
