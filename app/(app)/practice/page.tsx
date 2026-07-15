import { redirect } from "next/navigation";
import { hasActiveSubscription } from "@/lib/subscription";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function PracticeSetupPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect("/login");

const subscribed = await hasActiveSubscription(user.id);
if (!subscribed) redirect("/trial");

  const { data: domains } = await supabaseAdmin
    .from("domains")
    .select("id, name")
    .order("name");

  const { data: allQuestions } = await supabaseAdmin
    .from("questions")
    .select("domain_id")
    .eq("is_active", true);

  const countMap: Record<string, number> = {};
  allQuestions?.forEach((q: any) => {
    countMap[q.domain_id] = (countMap[q.domain_id] || 0) + 1;
  });

  return (
    <div className="min-h-screen bg-paper px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard" className="text-sm text-slate hover:text-ink transition">
          ← Back to dashboard
        </Link>
        <h1 className="text-2xl font-semibold text-ink mt-4 mb-2">Practice by domain</h1>
        <p className="text-sm text-slate mb-8">
          Untimed practice, one question at a time, with explanations shown immediately.
        </p>

        <div className="grid gap-3">
          {domains?.map((d: any) => {
            const count = countMap[d.id] || 0;
            return (
              <Link
                key={d.id}
                href={count > 0 ? `/practice/${d.id}` : "#"}
                className={`bg-white border border-line rounded-md p-4 flex items-center justify-between ${
                  count === 0 ? "opacity-50 pointer-events-none" : "hover:border-slate transition"
                }`}
              >
                <span className="font-medium text-ink">{d.name}</span>
                <span className="text-sm text-slate">{count} question{count !== 1 ? "s" : ""}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
