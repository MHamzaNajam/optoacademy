"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import ExamTimer from "@/components/exam/ExamTimer";
import QuestionNavigator from "@/components/exam/QuestionNavigator";
import QuestionPanel from "@/components/exam/QuestionPanel";
import NoCopyGuard from "@/components/NoCopyGuard";
import { supabase } from "@/lib/supabaseClient";

type AttemptQuestion = {
  answerId: string;
  questionId: string;
  stem: string;
  options: { letter: string; text: string }[];
  domainName: string;
  selected: string | null;
  flagged: boolean;
};

export default function MockExamPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const [loading, setLoading] = useState(true);
  const [examName, setExamName] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [questions, setQuestions] = useState<AttemptQuestion[]>([]);
  const [current, setCurrent] = useState(1);
  const [selections, setSelections] = useState<Record<number, string>>({});
  const [flaggedSet, setFlaggedSet] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("Candidate");

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("name")
        .eq("id", userData.user.id)
        .single();
      setUserName(profile?.name ?? userData.user.email ?? "Candidate");

      const res = await fetch(`/api/mock-exam/${attemptId}`);
      if (!res.ok) {
        setError("This exam attempt could not be found.");
        setLoading(false);
        return;
      }
      const data = await res.json();

      if (data.submitted) {
        router.push(`/mock-exam/${attemptId}/results`);
        return;
      }

      setExamName(data.examName);
      setDurationMinutes(data.durationMinutes);
      setQuestions(data.questions);

      const initialSelections: Record<number, string> = {};
      const initialFlagged = new Set<number>();
      data.questions.forEach((q: AttemptQuestion, idx: number) => {
        if (q.selected) initialSelections[idx + 1] = q.selected;
        if (q.flagged) initialFlagged.add(idx + 1);
      });
      setSelections(initialSelections);
      setFlaggedSet(initialFlagged);
      setLoading(false);
    }
    load();
  }, [attemptId, router]);

  const currentQuestion = questions[current - 1];

  async function saveAnswer(position: number, letter: string) {
    const q = questions[position - 1];
    if (!q) return;
    setSelections((prev) => ({ ...prev, [position]: letter }));
    await fetch(`/api/mock-exam/${attemptId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answerId: q.answerId, selected: letter }),
    });
  }

  async function toggleFlag(position: number) {
    const q = questions[position - 1];
    if (!q) return;
    const newFlagged = new Set(flaggedSet);
    const isNowFlagged = !newFlagged.has(position);
    if (isNowFlagged) newFlagged.add(position);
    else newFlagged.delete(position);
    setFlaggedSet(newFlagged);
    await fetch(`/api/mock-exam/${attemptId}/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answerId: q.answerId, flagged: isNowFlagged }),
    });
  }

  const handleSubmit = useCallback(async () => {
    if (submitting) return;
    setSubmitting(true);
    await fetch(`/api/mock-exam/${attemptId}/submit`, { method: "POST" });
    router.push(`/mock-exam/${attemptId}/results`);
  }, [attemptId, submitting, router]);

  function confirmSubmit() {
    const unanswered = questions.length - Object.keys(selections).length;
    const flaggedCount = flaggedSet.size;
    const proceed = confirm(
      `You have ${unanswered} unanswered and ${flaggedCount} flagged question(s). Submit anyway?`
    );
    if (proceed) handleSubmit();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e9edf0]">
        <p className="text-sm text-slate-500">Loading your exam...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e9edf0]">
        <p className="text-sm text-[#c0392b]">{error}</p>
      </div>
    );
  }

  const answeredPositions = new Set(
    Object.keys(selections).map((k) => parseInt(k, 10))
  );

  return (
    <div className="min-h-screen bg-[#e9edf0] flex items-center justify-center py-8">
      <NoCopyGuard />
      <div className="w-full max-w-[1100px] border border-[#b7c0c8] bg-white shadow-lg">
        <div className="bg-ink text-paper flex items-center justify-between px-4 py-2.5 text-[13px]">
          <div className="flex items-center gap-2 font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-teal" />
            OPTOACADEMY — {examName.toUpperCase()}
          </div>
          <div className="text-[#c9d3dc]">Section time remaining</div>
          <ExamTimer
            initialSeconds={durationMinutes * 60}
            onTimeUp={handleSubmit}
          />
          <button
            onClick={confirmSubmit}
            disabled={submitting}
            className="bg-[#c0392b] text-white text-xs font-semibold px-3.5 py-1.5 rounded-sm disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Finish section"}
          </button>
        </div>
        <div className="bg-[#26374a] text-[#dbe3ea] flex justify-between px-4 py-1.5 text-xs">
          <span>Question {current} of {questions.length}</span>
          <span>Candidate: {userName}</span>
        </div>

        <div className="flex min-h-[520px]">
          <QuestionNavigator
            total={questions.length}
            current={current}
            answered={answeredPositions}
            flagged={flaggedSet}
            onSelect={setCurrent}
          />
          {currentQuestion && (
            <QuestionPanel
              question={{
                id: current,
                stem: currentQuestion.stem,
                options: currentQuestion.options,
              }}
              selected={selections[current] ?? null}
              flagged={flaggedSet.has(current)}
              showExplanation={false}
              userName={userName}
              onSelect={(letter) => saveAnswer(current, letter)}
              onToggleFlag={() => toggleFlag(current)}
            />
          )}
        </div>

        <div className="border-t border-line bg-[#f4f6f8] flex items-center justify-between px-5 py-3">
          <span className="text-xs text-slate-500">
            {currentQuestion?.domainName}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrent((c) => Math.max(1, c - 1))}
              className="text-[13px] font-semibold border border-[#b7c0c8] bg-white px-4 py-2 rounded-sm"
            >
              &lt; Back
            </button>
            {current < questions.length ? (
              <button
                onClick={() => setCurrent((c) => Math.min(questions.length, c + 1))}
                className="text-[13px] font-semibold bg-ink text-paper px-4 py-2 rounded-sm"
              >
                Next &gt;
              </button>
            ) : (
              <button
                onClick={confirmSubmit}
                disabled={submitting}
                className="text-[13px] font-semibold bg-[#c0392b] text-white px-4 py-2 rounded-sm disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Finish & Submit"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
