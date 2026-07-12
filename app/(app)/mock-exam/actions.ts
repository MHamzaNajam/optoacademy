"use server";

import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function startMockExam(formData: FormData) {
  const templateId = formData.get("templateId") as string;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: template } = await supabaseAdmin
    .from("exam_templates")
    .select("*")
    .eq("id", templateId)
    .single();

  if (!template) throw new Error("Exam template not found");

  // Check for a per-candidate custom weighting; fall back to global default
  const { data: customWeights } = await supabaseAdmin
    .from("user_domain_weights")
    .select("domain_id, weight_percentage")
    .eq("user_id", user.id);

  const { data: domains } = await supabaseAdmin
    .from("domains")
    .select("id, name, weight_percentage");

  const weightMap = new Map(
    (customWeights && customWeights.length > 0
      ? customWeights.map((w) => [w.domain_id, w.weight_percentage])
      : (domains ?? []).map((d) => [d.id, d.weight_percentage]))
  );

  // Work out how many questions to pull from each domain
  const totalQuestions = template.question_count;
  const domainQuotas: { domainId: string; count: number }[] = [];
  let allocated = 0;

  const domainList = domains ?? [];
  domainList.forEach((d, idx) => {
    const weight = weightMap.get(d.id) ?? 0;
    const isLast = idx === domainList.length - 1;
    const count = isLast
      ? totalQuestions - allocated // last domain absorbs any rounding remainder
      : Math.round((weight / 100) * totalQuestions);
    allocated += count;
    domainQuotas.push({ domainId: d.id, count: Math.max(0, count) });
  });

  // Pull randomly selected active questions per domain
  let selectedQuestionIds: string[] = [];

  for (const quota of domainQuotas) {
    if (quota.count <= 0) continue;

    const { data: domainQuestions } = await supabaseAdmin
      .from("questions")
      .select("id")
      .eq("domain_id", quota.domainId)
      .eq("is_active", true);

    const pool = shuffle(domainQuestions ?? []);
    const picked = pool.slice(0, quota.count).map((q) => q.id);
    selectedQuestionIds = selectedQuestionIds.concat(picked);
  }

  selectedQuestionIds = shuffle(selectedQuestionIds);

  if (selectedQuestionIds.length === 0) {
    throw new Error("No questions available yet for this exam. Please check back soon.");
  }

  // Create the attempt
  const { data: attempt, error: attemptError } = await supabaseAdmin
    .from("attempts")
    .insert({
      user_id: user.id,
      exam_template_id: templateId,
      mode: "TIMED_MOCK",
    })
    .select("id")
    .single();

  if (attemptError || !attempt) throw new Error("Could not start exam attempt");

  // Create a blank answer row per selected question, preserving order
  const answerRows = selectedQuestionIds.map((qId, idx) => ({
    attempt_id: attempt.id,
    question_id: qId,
    selected: null,
    flagged: false,
  }));

  await supabaseAdmin.from("answers").insert(answerRows);

  redirect(`/mock-exam/${attempt.id}`);
}
