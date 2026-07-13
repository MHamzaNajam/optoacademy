import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { startMockExam } from "./actions";
import Link from "next/link";

export default async function MockExamSetupPage() {
  const supabase = createSupabaseServerClient();
const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: templates } = await supabaseAdmin
    .from("exam_templates")
    .select("*")
    .order("exam_type")
    .order("question_count", { ascending: false });

  return (
    <div className="min-h-screen bg-paper px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard" className="text-sm text-slate hover:text-ink transition">
          ← Back to dashboard
        </Link>
        <h1 className="text-2xl font-semibold text-ink mt-4 mb-8">Choose a mock exam</h1>

        <div className="grid gap-4">
          {templates?.map((t: any) => (
            <form
              key={t.id}
              action={startMockExam}
              className="bg-white border border-line rounded-md p-5 flex items-center justify-between"
            >
              <input type="hidden" name="templateId" value={t.id} />
              <div>
                <p className="font-medium text-ink">{t.name}</p>
                <p className="text-sm text-slate">
                  {t.question_count} questions · {t.duration_minutes} minutes · Pass mark {t.pass_percentage}%
                </p>
              </div>
              <button
                type="submit"
                className="bg-ink text-paper px-5 py-2.5 rounded-sm font-medium text-sm"
              >
                Start
              </button>
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
