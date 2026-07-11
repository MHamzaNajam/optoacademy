"use client";

import { useState } from "react";
import ExamTimer from "@/components/exam/ExamTimer";
import QuestionNavigator from "@/components/exam/QuestionNavigator";
import QuestionPanel, { QuestionData } from "@/components/exam/QuestionPanel";

// Placeholder question set — replace with a fetch() to /api/attempts/[id]/questions
const SAMPLE_QUESTIONS: QuestionData[] = [
  {
    id: 3,
    stem: "A 34-year-old patient presents with sudden painless vision loss in one eye. Fundoscopy reveals a pale retina with a cherry-red spot at the macula. Which of the following is the most likely diagnosis?",
    options: [
      { letter: "A", text: "Central retinal artery occlusion" },
      { letter: "B", text: "Central retinal vein occlusion" },
      { letter: "C", text: "Retinal detachment" },
      { letter: "D", text: "Anterior ischemic optic neuropathy" },
      { letter: "E", text: "Vitreous hemorrhage" },
    ],
    explanation:
      "A cherry-red spot with sudden painless vision loss is the classic finding in central retinal artery occlusion — retinal ischemia causes diffuse whitening, while the thinner fovea overlying the choroidal circulation stays red by comparison.",
  },
];

const TOTAL_QUESTIONS = 60;

export default function MockExamPage() {
  const [current, setCurrent] = useState(3);
  const [answered, setAnswered] = useState<Set<number>>(new Set([1, 2, 4, 5, 7, 8, 9, 11]));
  const [flagged, setFlagged] = useState<Set<number>>(new Set([2, 6]));
  const [selections, setSelections] = useState<Record<number, string>>({});
  const [practiceMode, setPracticeMode] = useState(false);

  const question = SAMPLE_QUESTIONS.find((q) => q.id === current) ?? SAMPLE_QUESTIONS[0];

  function selectOption(letter: string) {
    setSelections((prev) => ({ ...prev, [current]: letter }));
    setAnswered((prev) => new Set(prev).add(current));
  }

  function toggleFlag() {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(current)) next.delete(current);
      else next.add(current);
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-[#e9edf0] flex items-center justify-center py-8">
      <div className="w-full max-w-[1100px] border border-[#b7c0c8] bg-white shadow-lg">
        {/* Header */}
        <div className="bg-ink text-paper flex items-center justify-between px-4 py-2.5 text-[13px]">
          <div className="flex items-center gap-2 font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-teal" />
            OPTOACADEMY — DHA MOCK EXAM
          </div>
          <div className="text-[#c9d3dc]">Section time remaining</div>
          <ExamTimer initialSeconds={29 * 60 + 18} />
          <button className="bg-[#c0392b] text-white text-xs font-semibold px-3.5 py-1.5 rounded-sm">
            Finish section
          </button>
        </div>
        <div className="bg-[#26374a] text-[#dbe3ea] flex justify-between px-4 py-1.5 text-xs">
          <span>Question {current} of {TOTAL_QUESTIONS}</span>
          <span>Candidate: Hamza M.</span>
        </div>

        {/* Body */}
        <div className="flex min-h-[520px]">
          <QuestionNavigator
            total={TOTAL_QUESTIONS}
            current={current}
            answered={answered}
            flagged={flagged}
            onSelect={setCurrent}
          />
          <QuestionPanel
     question={question}
     selected={selections[current] ?? null}
     flagged={flagged.has(current)}
     showExplanation={practiceMode}
     userName="Hamza M."
     onSelect={selectOption}
     onToggleFlag={toggleFlag}
   />
        </div>

        {/* Footer toolbar */}
        <div className="border-t border-line bg-[#f4f6f8] flex items-center justify-between px-5 py-3">
          <button
            onClick={() => setPracticeMode((v) => !v)}
            className="text-xs font-semibold border border-[#b7c0c8] px-4 py-2 rounded-sm bg-transparent"
          >
            Toggle practice mode
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrent((c) => Math.max(1, c - 1))}
              className="text-[13px] font-semibold border border-[#b7c0c8] bg-white px-4 py-2 rounded-sm"
            >
              &lt; Back
            </button>
            <button className="text-[13px] font-semibold border border-[#b7c0c8] bg-white px-4 py-2 rounded-sm">
              Review screen
            </button>
            <button
              onClick={() => setCurrent((c) => Math.min(TOTAL_QUESTIONS, c + 1))}
              className="text-[13px] font-semibold bg-ink text-paper px-4 py-2 rounded-sm"
            >
              Next &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
