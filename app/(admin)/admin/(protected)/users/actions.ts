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
  const returnQuery = (formData.get("returnQuery") as string) || "";

  await supabaseAdmin
    .from("users")
    .update({ is_suspended: !currentlySuspended })
    .eq("id", userId);

  redirect(`/admin/users${returnQuery ? `?${returnQuery}` : ""}`);
}

export async function deleteUser(formData: FormData) {
  await checkPermission();
  const userId = formData.get("userId") as string;
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) {
    redirect(`/admin/users?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/admin/users");
}
