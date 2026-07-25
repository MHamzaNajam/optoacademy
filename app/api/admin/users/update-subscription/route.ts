import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { PLAN_DURATIONS, daysRemaining } from "@/lib/subscription";

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
  const { userId, plan, status } = body;

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

  return NextResponse.json({
    plan,
    status,
    current_period_end,
    daysLeft: daysRemaining(current_period_end),
  });
}
