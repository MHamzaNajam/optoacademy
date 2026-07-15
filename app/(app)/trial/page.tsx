import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import TrialSession from "@/components/exam/TrialSession";

export default async function TrialPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: setting } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", "trial_question_limit")
    .single();

  const limit = parseInt(setting?.value ?? "10", 10);

  const { data: questions } = await supabaseAdmin
    .from("questions")
    .select("id, stem, option_a, option_b, option_c, option_d, option_e, correct_option, explanation")
    .eq("is_trial", true)
    .eq("is_active", true)
    .order("trial_order", { ascending: true })
    .limit(limit);

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper px-6">
        <div className="text-center">
          <p className="text-sm text-slate mb-4">
            No trial questions are set up yet. Check back soon.
          </p>
          <Link href="/dashboard" className="text-teal font-medium text-sm">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <TrialSession questions={questions} />;
}
