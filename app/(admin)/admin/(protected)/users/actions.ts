"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { PLAN_DURATIONS } from "@/lib/subscription";

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
  const returnQuery = (formData.get("returnQuery") as string) || "";

  await supabaseAdmin
    .from("users")
    .update({ is_suspended: !currentlySuspended })
    .eq("id", userId);

  redirect(`/admin/users${returnQuery ? `?${returnQuery}` : ""}`);
}

export async function updateSubscription(formData: FormData) {
  await checkPermission();

  const userId = formData.get("userId") as string;
  const plan = formData.get("plan") as string;
  const status = formData.get("status") as string;
  const returnQuery = (formData.get("returnQuery") as string) || "";

  let current_period_end: string | null = null;
  if (plan !== "FREE" && PLAN_DURATIONS[plan]) {
    const end = new Date();
    end.setDate(end.getDate() + PLAN_DURATIONS[plan]);
    current_period_end = end.toISOString();
  }

  const { data: existing } = await supabaseAdmin
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (existing) {
    await supabaseAdmin
      .from("subscriptions")
      .update({ plan, status, current_period_end })
      .eq("user_id", userId);
  } else {
    await supabaseAdmin
      .from("subscriptions")
      .insert({ user_id: userId, plan, status, current_period_end });
  }

  redirect(`/admin/users${returnQuery ? `?${returnQuery}` : ""}`);
}

export async function deleteUser(formData: FormData) {
  await checkPermission();
  const userId = formData.get("userId") as string;
  await supabaseAdmin.auth.admin.deleteUser(userId);
  redirect("/admin/users");
}
