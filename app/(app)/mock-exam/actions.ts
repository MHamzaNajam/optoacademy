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
  let attemptId: string | null = null;

  try {
    if (!templateId) {
      redirect("/mock-exam?error=" + encodeURIComponent("Please choose a format before starting."));
    }

    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: template, error: templateError } = await supabaseAdmin
      .from("exam_templates")
      .select("*")
      .eq("id", templateId)
      .single();

    if (templateError || !template) {
      redirect("/mock-exam?error=" + encodeURIComponent("Exam template not found: " + (templateError?.message || "unknown")));
    }

    const { data: customWeights } = await supabaseAdmin
      .from("user_domain_weights")
      .select("domain_id, weight_percentage")
      .eq("user_id", user.id);

    const { data: domains, error: domainsError } = await supabaseAdmin
      .from("domains")
      .select("id, name, weight_percentage");

    if (domainsError) {
      redirect("/mock-exam?error=" + encodeURIComponent("Could not load domains: " + domainsError.message));
    }

    const weightMap = new Map(
      (customWeights && customWeights.length > 0
        ? customWeights.map((w) => [w.domain_id, w.weight_percentage])
        : (domains ?? []).map((d) => [d.id, d.weight_percentage]))
    );

    const totalQuestions = template!.question_count;
    const domainList = domains ?? [];

    const poolByDomain = new Map<string, string[]>();
    const domainResults = await Promise.all(
      domainList.map((d) =>
        supabaseAdmin
          .from("questions")
          .select("id")
          .eq("domain_id", d.id)
          .eq("is_active", true)
      )
    );
    domainList.forEach((d, idx) => {
      const domainQuestions = domainResults[idx].data;
      poolByDomain.set(d.id, shuffle((domainQuestions ?? []).map((q) => q.id)));
    });

    let allocated = 0;
    const quotas: { domainId: string; quota: number }[] = [];
    domainList.forEach((d, idx) => {
      const weight = weightMap.get(d.id) ?? 0;
      const isLast = idx === domainList.length - 1;
      const quota = isLast ? totalQuestions - allocated : Math.round((weight / 100) * totalQuestions);
      allocated += quota;
      quotas.push({ domainId: d.id, quota: Math.max(0, quota) });
    });

    const taken = new Map<string, number>();
    let shortfall = 0;

    for (const q of quotas) {
      const pool = poolByDomain.get(q.domainId) ?? [];
      const available = pool.length;
      const actualTake = Math.min(q.quota, available);
      taken.set(q.domainId, actualTake);
      shortfall += q.quota - actualTake;
    }

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

    let selectedQuestionIds: string[] = [];
    for (const d of domainList) {
      const count = taken.get(d.id) ?? 0;
      const pool = poolByDomain.get(d.id) ?? [];
      selectedQuestionIds = selectedQuestionIds.concat(pool.slice(0, count));
    }
    selectedQuestionIds = shuffle(selectedQuestionIds);

    if (selectedQuestionIds.length === 0) {
      redirect("/mock-exam?error=" + encodeURIComponent("No questions available yet for this exam."));
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

    if (attemptError || !attempt) {
      redirect("/mock-exam?error=" + encodeURIComponent("Could not create attempt: " + (attemptError?.message || "unknown")));
    }

    attemptId = attempt!.id;

    const answerRows = selectedQuestionIds.map((qId) => ({
      attempt_id: attempt!.id,
      question_id: qId,
      selected: null,
      flagged: false,
    }));

    const { error: answersError } = await supabaseAdmin.from("answers").insert(answerRows);

    if (answersError) {
      redirect("/mock-exam?error=" + encodeURIComponent("Could not create answer rows: " + answersError.message));
    }
  } catch (err: any) {
    // redirect() throws internally by design — let that specific case pass through untouched
    if (err?.digest?.startsWith?.("NEXT_REDIRECT")) {
      throw err;
    }
    redirect("/mock-exam?error=" + encodeURIComponent("Unexpected error: " + (err?.message || String(err))));
  }

  redirect(`/mock-exam/${attemptId}`);
}
