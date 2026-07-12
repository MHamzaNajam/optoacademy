import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(
  req: NextRequest,
  { params }: { params: { attemptId: string } }
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: attempt } = await supabaseAdmin
    .from("attempts")
    .select("id, user_id, submitted_at")
    .eq("id", params.attemptId)
    .single();

  if (!attempt || attempt.user_id !== user.id) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  }
  if (attempt.submitted_at) {
    return NextResponse.json({ error: "Already submitted" }, { status: 400 });
  }

  const { data: answers } = await supabaseAdmin
    .from("answers")
    .select("id, selected, questions(correct_option, domain_id, domains(name))")
    .eq("attempt_id", params.attemptId);

  const domainStats: Record<string, { name: string; correct: number; total: number }> = {};
  let totalCorrect = 0;

  (answers ?? []).forEach((a: any) => {
    const domainId = a.questions?.domain_id;
    const domainName = a.questions?.domains?.name ?? "Unknown";
    if (!domainStats[domainId]) {
      domainStats[domainId] = { name: domainName, correct: 0, total: 0 };
    }
    domainStats[domainId].total += 1;

    const isCorrect = a.selected && a.selected === a.questions?.correct_option;
    if (isCorrect) {
      domainStats[domainId].correct += 1;
      totalCorrect += 1;
    }
  });

  const totalQuestions = answers?.length ?? 0;
  const overallScore = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

  await supabaseAdmin
    .from("attempts")
    .update({ score: overallScore, submitted_at: new Date().toISOString() })
    .eq("id", params.attemptId);

  return NextResponse.json({ success: true, score: overallScore });
}
