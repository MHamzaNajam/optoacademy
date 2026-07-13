import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(
  req: NextRequest,
  { params }: { params: { attemptId: string } }
) {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const { data: attempt } = await supabaseAdmin
    .from("attempts")
    .select("id, user_id, submitted_at, exam_template_id, exam_templates(name, duration_minutes)")
    .eq("id", params.attemptId)
    .single();
  if (!attempt || attempt.user_id !== user.id) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  }
  const { data: answers } = await supabaseAdmin
    .from("answers")
    .select("id, question_id, selected, flagged, questions(id, stem, option_a, option_b, option_c, option_d, option_e, domain_id, domains(name))")
    .eq("attempt_id", params.attemptId)
    .order("id");
  const questions = (answers ?? []).map((a: any) => ({
    answerId: a.id,
    questionId: a.question_id,
    stem: a.questions?.stem,
    options: [
      { letter: "A", text: a.questions?.option_a },
      { letter: "B", text: a.questions?.option_b },
      { letter: "C", text: a.questions?.option_c },
      { letter: "D", text: a.questions?.option_d },
      ...(a.questions?.option_e ? [{ letter: "E", text: a.questions.option_e }] : []),
    ],
    domainName: a.questions?.domains?.name,
    selected: a.selected,
    flagged: a.flagged,
  }));
  return NextResponse.json({
    attemptId: attempt.id,
    examName: (attempt as any).exam_templates?.name,
    durationMinutes: (attempt as any).exam_templates?.duration_minutes,
    submitted: !!attempt.submitted_at,
    questions,
  });
}
