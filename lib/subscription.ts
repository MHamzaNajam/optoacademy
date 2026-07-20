import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const PLAN_DURATIONS: Record<string, number> = {
  MONTH_1: 30,
  MONTH_3: 90,
  MONTH_6: 180,
};

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("id, plan, status, current_period_end")
    .eq("user_id", userId)
    .single();

  if (!sub) return false;

  if (sub.plan !== "FREE" && sub.current_period_end && new Date(sub.current_period_end) < new Date()) {
    await supabaseAdmin
      .from("subscriptions")
      .update({ plan: "FREE", status: "expired", current_period_end: null })
      .eq("id", sub.id);
    return false;
  }

  return sub.plan !== "FREE" && sub.status === "active";
}

export function daysRemaining(currentPeriodEnd: string | null): number | null {
  if (!currentPeriodEnd) return null;
  const diff = new Date(currentPeriodEnd).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
