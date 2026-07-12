import { redirect } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function ResultsPage({
  params,
}: {
  params: { attemptId: string };
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: attempt } = await supabaseAdmin
    .from("attempts")
    .select("id, user_id, score, submitted_at, exam_template_id, exam_templates(name, pass_percentage)")
    .eq("id", params.attemptId)
    .single();

  if (!attempt || attempt.user_id !== user.id) {
    redirect("/dashboard");
  }

  if (!attempt.submitted_at) {
    redirect(`/mock-exam/${params.attemptId}`);
  }

  const { data: answers } = await supabaseAdmin
    .from("answers")
    .select("selected, questions(correct_option, domain_id, domains(name))")
    .eq("attempt_id", params.attemptId);

  const domainStats: Record<string, { name: string; correct: number; total: number }> = {};

  (answers ?? []).forEach((a: any) => {
    const domainId = a.questions?.domain_id;
    const domainName = a.questions?.domains?.name ?? "Unknown";
    if (!domainStats[domainId]) {
      domainStats[domainId] = { name: domainName, correct: 0, total: 0 };
    }
    domainStats[domainId].total += 1;
    if (a.selected && a.selected === a.questions?.correct_option) {
      domainStats[domainId].correct += 1;
    }
  });

  const domainBreakdown = Object.values(domainStats)
    .map((d) => ({
      ...d,
      percentage: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0,
    }))
    .sort((a, b) => a.percentage - b.percentage);

  const overallScore = Math.round(attempt.score ?? 0);
  const passMark = (attempt as any).exam_templates?.pass_percentage ?? 60;
  const passed = overallScore >= passMark;
  const examName = (attempt as any).exam_templates?.name ?? "Mock Exam";

  return (
    <div className="min-h-screen bg-paper px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard" className="text-sm text-slate hover:text-ink transition">
          ← Back to dashboard
        </Link>

        <div className="bg-white border border-line rounded-md p-8 mt-6 text-center">
          <p className="text-sm text-slate mb-2">{examName}</p>
          <p className={`text-5xl font-semibold mb-2 ${passed ? "text-teal" : "text-[#c0392b]"}`}>
            {overallScore}%
          </p>
          <p className={`text-sm font-medium mb-1 ${passed ? "text-teal" : "text-[#c0392b]"}`}>
            {passed ? "Pass" : "Below pass mark"}
          </p>
          <p className="text-xs text-slate">Pass mark: {passMark}%</p>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-ink mb-4">Domain breakdown</h2>
          <div className="flex flex-col gap-3">
            {domainBreakdown.map((d) => (
              <div key={d.name} className="bg-white border border-line rounded-md p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-ink font-medium">{d.name}</span>
                  <span className="text-sm text-slate">
                    {d.correct}/{d.total} ({d.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-mist rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 ${d.percentage >= passMark ? "bg-teal" : "bg-amber"}`}
                    style={{ width: `${d.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <Link
            href="/mock-exam"
            className="bg-ink text-paper px-6 py-3 rounded-sm font-medium text-sm"
          >
            Take another mock exam
          </Link>
          <Link
            href="/dashboard"
            className="border border-line px-6 py-3 rounded-sm font-medium text-ink text-sm"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
