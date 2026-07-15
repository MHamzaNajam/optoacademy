import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", userId)
    .single();

  if (!sub) return false;
  return sub.plan !== "FREE" && sub.status === "active";
}
