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
