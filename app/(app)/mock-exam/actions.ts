"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
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

  const supabase = createSupabaseServerClient();
const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: template } = await supabaseAdmin
    .from("exam_templates")
    .select("*")
    .eq("id", templateId)
    .single();

  if (!template) throw new Error("Exam template not found");

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

  const totalQuestions = template.question_count;
  const domainList = domains ?? [];

  // Fetch and shuffle available active question pools per domain up front
  const poolByDomain = new Map<string, string[]>();
  for (const d of domainList) {
    const { data: domainQuestions } = await supabaseAdmin
      .from("questions")
      .select("id")
      .eq("domain_id", d.id)
      .eq("is_active", true);
    poolByDomain.set(d.id, shuffle((domainQuestions ?? []).map((q) => q.id)));
  }

  // Initial quota per domain, based on weight
  let allocated = 0;
  const quotas: { domainId: string; quota: number }[] = [];
  domainList.forEach((d, idx) => {
    const weight = weightMap.get(d.id) ?? 0;
    const isLast = idx === domainList.length - 1;
    const quota = isLast ? totalQuestions - allocated : Math.round((weight / 100) * totalQuestions);
    allocated += quota;
    quotas.push({ domainId: d.id, quota: Math.max(0, quota) });
  });

  // Take what's actually available per domain, track shortfall
  const taken = new Map<string, number>();
  let shortfall = 0;

  for (const q of quotas) {
    const pool = poolByDomain.get(q.domainId) ?? [];
    const available = pool.length;
    const actualTake = Math.min(q.quota, available);
    taken.set(q.domainId, actualTake);
    shortfall += q.quota - actualTake;
  }

  // Redistribute shortfall round-robin across domains with remaining capacity
  if (shortfall > 0) {
    let progress = true;
    while (shortfall > 0 && progress) {
      progress = false;
      for (const d of domainList) {
        if (shortfall <= 0) break;
        const pool = poolByDomain.get(d.id) ?? [];
        const currentlyTaken = taken.get(d.id) ?? 0;
        if (currentlyTaken < pool.length) {
          taken.set(d.id, currentlyTaken + 1);
          shortfall -= 1;
          progress = true;
        }
      }
    }
  }

  // Assemble final question set
  let selectedQuestionIds: string[] = [];
  for (const d of domainList) {
    const count = taken.get(d.id) ?? 0;
    const pool = poolByDomain.get(d.id) ?? [];
    selectedQuestionIds = selectedQuestionIds.concat(pool.slice(0, count));
  }
  selectedQuestionIds = shuffle(selectedQuestionIds);

  if (selectedQuestionIds.length === 0) {
    throw new Error("No questions available yet for this exam. Please check back soon.");
  }

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

  const answerRows = selectedQuestionIds.map((qId) => ({
    attempt_id: attempt.id,
    question_id: qId,
    selected: null,
    flagged: false,
  }));

  await supabaseAdmin.from("answers").insert(answerRows);

  redirect(`/mock-exam/${attempt.id}`);
}
