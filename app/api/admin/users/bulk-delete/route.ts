import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const adminId = cookieStore.get("admin_id")?.value;

  if (!adminId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: adminRow } = await supabaseAdmin
    .from("admin_users")
    .select("role, can_manage_users")
    .eq("id", adminId)
    .single();

  const allowed = adminRow && (adminRow.role === "super_admin" || adminRow.can_manage_users);
  if (!allowed) {
    return NextResponse.json({ error: "No permission" }, { status: 403 });
  }

  const body = await req.json();
  const ids: string[] = body.ids;

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
  }

  for (const id of ids) {
    await supabaseAdmin.auth.admin.deleteUser(id);
  }

  return NextResponse.json({ deletedCount: ids.length });
}
