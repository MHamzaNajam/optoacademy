import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const cookieStore = cookies();
  const adminId = cookieStore.get("admin_id")?.value;

  if (!adminId) {
    return NextResponse.json({ isAdmin: false });
  }

  const { data: adminRow } = await supabaseAdmin
    .from("admin_users")
    .select("role")
    .eq("id", adminId)
    .single();

  return NextResponse.json({ isAdmin: !!adminRow });
}
