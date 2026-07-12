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
    .select("role, can_manage_consultations")
    .eq("id", adminId)
    .single();

  if (!adminRow) redirect("/admin");
  const allowed = adminRow.role === "super_admin" || adminRow.can_manage_consultations;
  if (!allowed) redirect("/admin/dashboard?error=noaccess");
}

export async function updateStatus(formData: FormData) {
  await checkPermission();

  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  await supabaseAdmin
    .from("consultation_inquiries")
    .update({ status })
    .eq("id", id);

  redirect("/admin/consultations");
}

export async function deleteInquiry(formData: FormData) {
  await checkPermission();

  const id = formData.get("id") as string;

  await supabaseAdmin
    .from("consultation_inquiries")
    .delete()
    .eq("id", id);

  redirect("/admin/consultations");
}
