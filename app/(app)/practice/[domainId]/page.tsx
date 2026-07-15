"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type PracticeQuestion = {
  id: string;
  stem: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string | null;
  correct_option: string;
  explanation: string;
};

export default function PracticeDomainPage() {
  const params = useParams();
  const router = useRouter();
  const domainId = params.domainId as string;

  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [domainName, setDomainName] = useState("");
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: domain } = await supabase
        .from("domains")
        .select("name")
        .eq("id", domainId)
        .single();
      setDomainName(domain?.name ?? "Practice");

      const { data: qs } = await supabase
        .from("questions")
        .select("id, stem, option_a, option_b, option_c, option_d, option_e, correct_option, explanation")
        .eq("domain_id", domainId)
        .eq("is_active", true);

      setQuestions(qs ?? []);
      setLoading(false);
    }
    load();
  }, [domainId, router]);

  function selectOption(letter: string) {
    if (showAnswer) return;
    setSelected(letter);
    setShowAnswer(true);
  }

  function nextQuestion() {
    setSelected(null);
    setShowAnswer(false);
    setCurrent((c) => c + 1);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <p className="text-sm text-slate">Loading practice questions...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper px-6">
        <div className="text-center">
          <p className="text-sm text-slate mb-4">No questions available in this domain yet.</p>
          <Link href="/practice" className="text-teal font-medium text-sm">
            ← Back to domains
          </Link>
        </div>
      </div>
    );
  }

  if (current >= questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper px-6">
        <div className="text-center">
          <p className="text-lg font-semibold text-ink mb-2">Practice session complete</p>
          <p className="text-sm text-slate mb-6">
            You've gone through all {questions.length} questions in {domainName}.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/practice" className="border border-line px-5 py-2.5 rounded-sm text-sm text-ink">
              Choose another domain
            </Link>
            <Link href="/dashboard" className="bg-ink text-paper px-5 py-2.5 rounded-sm text-sm">
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const options = [
    { letter: "A", text: q.option_a },
    { letter: "B", text: q.option_b },
    { letter: "C", text: q.option_c },
    { letter: "D", text: q.option_d },
    ...(q.option_e ? [{ letter: "E", text: q.option_e }] : []),
  ];

  return (
    <div className="min-h-screen bg-paper px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-3">
          <Link href="/practice" className="text-sm text-slate hover:text-ink transition whitespace-nowrap">
            ← Domains
          </Link>
          <span className="text-sm text-slate text-center flex-1">
            {domainName} · Question {current + 1} of {questions.length}
          </span>
          <Link
            href="/dashboard"
            className="text-xs font-medium bg-amber text-white px-4 py-2 rounded-sm hover:bg-amber/90 transition whitespace-nowrap"
          >
            Finish practice
          </Link>
        </div>

        <div className="bg-white border border-line rounded-md p-6">
          <p className="text-base text-ink mb-5">{q.stem}</p>

          <div className="flex flex-col gap-2.5">
            {options.map((opt) => {
              const isSelected = selected === opt.letter;
              const isCorrect = opt.letter === q.correct_option;
              let styling = "border-line hover:border-teal/60";
              if (showAnswer && isCorrect) styling = "border-teal bg-teal/5";
              else if (showAnswer && isSelected && !isCorrect) styling = "border-[#c0392b] bg-[#c0392b]/5";

              return (
                <div
                  key={opt.letter}
                  onClick={() => selectOption(opt.letter)}
                  className={`flex items-center gap-3 border rounded-sm px-3.5 py-3 text-sm cursor-pointer ${styling}`}
                >
                  <div className="w-[22px] h-[22px] rounded-full border flex items-center justify-center text-xs font-semibold shrink-0 bg-white">
                    {opt.letter}
                  </div>
                  {opt.text}
                </div>
              );
            })}
          </div>

          {showAnswer && (
            <div className="mt-5 p-4 bg-mist border-l-[3px] border-teal text-sm leading-relaxed">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal mb-1">
                {selected === q.correct_option ? "Correct" : "Explanation"}
              </p>
              {q.explanation}
            </div>
          )}

          {showAnswer && (
            <button
              onClick={nextQuestion}
              className="mt-5 bg-ink text-paper px-5 py-2.5 rounded-sm text-sm font-medium"
            >
              Next question →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
