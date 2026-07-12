import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function AdminDashboardPage() {
  const { data: users } = await supabaseAdmin
    .from("users")
    .select("id, name, email, created_at, subscriptions(plan, status, current_period_end)")
    .order("created_at", { ascending: false });

  const { data: attempts } = await supabaseAdmin
    .from("attempts")
    .select("user_id, score, exam_type, submitted_at");

  const totalUsers = users?.length ?? 0;
  const activeSubs = users?.filter((u: any) => u.subscriptions?.[0]?.status === "active").length ?? 0;

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-semibold text-ink mb-8">Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-4 mb-10">
        <div className="bg-white border border-line rounded-md p-5">
          <p className="text-xs text-slate mb-1">Total users</p>
          <p className="text-2xl font-semibold text-ink">{totalUsers}</p>
        </div>
        <div className="bg-white border border-line rounded-md p-5">
          <p className="text-xs text-slate mb-1">Active subscriptions</p>
          <p className="text-2xl font-semibold text-ink">{activeSubs}</p>
        </div>
        <div className="bg-white border border-line rounded-md p-5">
          <p className="text-xs text-slate mb-1">Mock exams completed</p>
          <p className="text-2xl font-semibold text-ink">
            {attempts?.filter((a: any) => a.submitted_at).length ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
}
