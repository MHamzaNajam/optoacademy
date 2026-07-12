"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function checkSuperAdmin() {
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

  return adminId;
}

export async function addAdmin(formData: FormData) {
  const myId = await checkSuperAdmin();

  const email = (formData.get("email") as string).trim().toLowerCase();
  const can_manage_questions = formData.get("can_manage_questions") === "on";
  const can_manage_users = formData.get("can_manage_users") === "on";
  const can_manage_consultations = formData.get("can_manage_consultations") === "on";
  const can_manage_blog = formData.get("can_manage_blog") === "on";
  const can_view_analytics = formData.get("can_view_analytics") === "on";

  // Create their login account AND email them an invite to set a password — all in one step
  const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    email,
    { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password` }
  );

  if (inviteError || !inviteData?.user) {
    if (inviteError?.message?.toLowerCase().includes("already registered")) {
      redirect("/admin/admins?error=alreadyexists");
    }
    redirect("/admin/admins?error=invitefailed");
  }

  const { error: insertError } = await supabaseAdmin.from("admin_users").upsert({
    id: inviteData!.user!.id,
    email: inviteData!.user!.email,
    role: "admin",
    can_manage_questions,
    can_manage_users,
    can_manage_consultations,
    can_manage_blog,
    can_view_analytics,
    invited_by: myId,
  });

  if (insertError) {
    redirect("/admin/admins?error=insertfailed");
  }

  redirect("/admin/admins?success=invited");
}

export async function updatePermissions(formData: FormData) {
  await checkSuperAdmin();

  const id = formData.get("id") as string;
  const can_manage_questions = formData.get("can_manage_questions") === "on";
  const can_manage_users = formData.get("can_manage_users") === "on";
  const can_manage_consultations = formData.get("can_manage_consultations") === "on";
  const can_manage_blog = formData.get("can_manage_blog") === "on";
  const can_view_analytics = formData.get("can_view_analytics") === "on";

  await supabaseAdmin
    .from("admin_users")
    .update({
      can_manage_questions,
      can_manage_users,
      can_manage_consultations,
      can_manage_blog,
      can_view_analytics,
    })
    .eq("id", id)
    .eq("role", "admin"); // safety: this action can never touch a super_admin row

  redirect("/admin/admins?success=updated");
}

export async function removeAdmin(formData: FormData) {
  await checkSuperAdmin();

  const id = formData.get("id") as string;

  // Remove their admin panel access
  await supabaseAdmin.from("admin_users").delete().eq("id", id).eq("role", "admin");

  // Also delete their login account entirely, since you asked for full control —
  // they shouldn't be able to log in anywhere once removed
  await supabaseAdmin.auth.admin.deleteUser(id);

  redirect("/admin/admins?success=removed");
}
