import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import NoCopyGuard from "@/components/NoCopyGuard";

export default async function ReviewPage({
  params,
}: {
  params: { attemptId: string };
}) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: attempt } = await supabaseAdmin
    .from("attempts")
    .select("id, user_id, submitted_at, review_viewed_at")
    .eq("id", params.attemptId)
    .single();

  if (!attempt || attempt.user_id !== user.id || !attempt.submitted_at) {
    redirect("/dashboard");
  }

  if (attempt.review_viewed_at) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper px-6">
        <div className="text-center max-w-md">
          <p className="text-lg font-semibold text-ink mb-2">Review already used</p>
          <p className="text-sm text-slate mb-6">
            This mock exam's answer review was already viewed and is no longer
            available — each result comes with a one-time review.
          </p>
          <Link href="/dashboard" className="bg-ink text-paper px-6 py-3 rounded-sm font-medium text-sm inline-block">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  await supabaseAdmin
    .from("attempts")
    .update({ review_viewed_at: new Date().toISOString() })
    .eq("id", params.attemptId);

  const { data: answers } = await supabaseAdmin
    .from("answers")
    .select("selected, questions(stem, option_a, option_b, option_c, option_d, option_e, correct_option, explanation, domains(name))")
    .eq("attempt_id", params.attemptId);

  return (
    <div className="min-h-screen bg-paper px-6 py-10">
      <NoCopyGuard />
      <div className="max-w-3xl mx-auto">
        <div className="bg-amber/10 border border-amber/30 text-amber text-sm rounded-sm px-4 py-3 mb-6">
          This is your one-time review for this attempt. Once you leave this page, it can't be viewed again.
        </div>

        <Link href="/dashboard" className="text-sm text-slate hover:text-ink transition">
          ← Back to dashboard
        </Link>

        <h1 className="text-2xl font-semibold text-ink mt-4 mb-8">Answer review</h1>

        <div className="flex flex-col gap-4">
          {(answers ?? []).map((a: any, idx: number) => {
            const q = a.questions;
            const isCorrect = a.selected === q?.correct_option;
            const options = [
              { letter: "A", text: q?.option_a },
              { letter: "B", text: q?.option_b },
              { letter: "C", text: q?.option_c },
              { letter: "D", text: q?.option_d },
              ...(q?.option_e ? [{ letter: "E", text: q.option_e }] : []),
            ];

            return (
              <div key={idx} className="bg-white border border-line rounded-md p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium bg-teal/10 text-teal px-2 py-1 rounded-sm">
                    {q?.domains?.name ?? "Unknown"}
                  </span>
                  <span className={`text-xs font-semibold ${isCorrect ? "text-teal" : "text-[#c0392b]"}`}>
                    {isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </div>
                <p className="text-sm text-ink mb-3">{q?.stem}</p>
                <div className="flex flex-col gap-1.5 mb-3">
                  {options.map((opt) => {
                    const isYourAnswer = a.selected === opt.letter;
                    const isRight = opt.letter === q?.correct_option;
                    let style = "border-line";
                    if (isRight) style = "border-teal bg-teal/5";
                    else if (isYourAnswer && !isRight) style = "border-[#c0392b] bg-[#c0392b]/5";

                    return (
                      <div key={opt.letter} className={`border rounded-sm px-3 py-2 text-xs flex gap-2 ${style}`}>
                        <span className="font-semibold">{opt.letter}.</span>
                        {opt.text}
                        {isYourAnswer && <span className="ml-auto text-slate">(your answer)</span>}
                      </div>
                    );
                  })}
                </div>
                {q?.explanation && (
                  <div className="text-xs text-slate bg-mist rounded-sm p-3">
                    <strong className="text-ink">Explanation: </strong>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          <Link href="/dashboard" className="bg-ink text-paper px-6 py-3 rounded-sm font-medium text-sm inline-block">
            Done reviewing — back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
