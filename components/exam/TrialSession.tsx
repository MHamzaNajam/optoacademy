"use client";

import { useState } from "react";
import Link from "next/link";

type TrialQuestion = {
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

export default function TrialSession({ questions }: { questions: TrialQuestion[] }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

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

  if (current >= questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper px-6">
        <div className="text-center max-w-md">
          <p className="text-lg font-semibold text-ink mb-2">Trial session complete</p>
          <p className="text-sm text-slate mb-6">
            That's the full sample. Subscribe to unlock the complete question
            bank, timed mock exams, and domain-by-domain performance tracking.
          </p>
          <Link href="/pricing" className="bg-ink text-paper px-6 py-3 rounded-sm font-medium text-sm inline-block">
            View pricing
          </Link>
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
        <div className="bg-amber/10 border border-amber/30 text-amber text-sm rounded-sm px-4 py-3 mb-6 flex items-center justify-between">
          <span>
            <strong>Trial session</strong> — {questions.length} sample questions. Subscribe for full access.
          </span>
          <Link href="/pricing" className="font-medium underline whitespace-nowrap ml-4">
            View plans
          </Link>
        </div>

        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard" className="text-sm text-slate hover:text-ink transition">
            ← Dashboard
          </Link>
          <span className="text-sm text-slate">
            Question {current + 1} of {questions.length}
          </span>
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
              {current + 1 >= questions.length ? "Finish trial" : "Next question →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
