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

  // Find the existing Supabase Auth user by email
  const { data: usersList, error: listError } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (listError) {
    redirect("/admin/admins?error=lookupfailed");
  }

  const matchedUser = usersList.users.find(
    (u) => u.email?.toLowerCase() === email
  );

  if (!matchedUser) {
    redirect("/admin/admins?error=notfound");
  }

  const { error: insertError } = await supabaseAdmin.from("admin_users").upsert({
    id: matchedUser!.id,
    email: matchedUser!.email,
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

  redirect("/admin/admins?success=added");
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

  await supabaseAdmin
    .from("admin_users")
    .delete()
    .eq("id", id)
    .eq("role", "admin"); // safety: can never delete a super_admin row

  redirect("/admin/admins?success=removed");
}
