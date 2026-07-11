"use client";

import clsx from "clsx";

export type QuestionData = {
  id: number;
  stem: string;
  options: { letter: string; text: string }[];
  explanation?: string;
};

type Props = {
  question: QuestionData;
  selected: string | null;
  flagged: boolean;
  showExplanation: boolean;
  onSelect: (letter: string) => void;
  onToggleFlag: () => void;
};

export default function QuestionPanel({
  question,
  selected,
  flagged,
  showExplanation,
  onSelect,
  onToggleFlag,
}: Props) {
  return (
    <div className="flex-1 px-7 py-6 flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-line text-xs text-slate">
        <span className="text-sm font-semibold text-ink">
          Question {question.id}
        </span>
        <button
          onClick={onToggleFlag}
          className={clsx(
            "flex items-center gap-1.5 border rounded-sm px-2.5 py-1.5 text-xs",
            flagged
              ? "bg-amber/10 border-amber text-amber"
              : "bg-white border-[#b7c0c8] text-ink"
          )}
        >
          🚩 Flag for review
        </button>
      </div>

      <p className="text-[15px] leading-relaxed mb-5 text-ink">
        {question.stem}
      </p>

      <div className="flex flex-col gap-2.5">
        {question.options.map((opt) => (
          <div
            key={opt.letter}
            onClick={() => onSelect(opt.letter)}
            className={clsx(
              "flex items-center gap-3 border rounded-sm px-3.5 py-3 text-sm cursor-pointer",
              selected === opt.letter
                ? "border-teal bg-teal/5"
                : "border-line hover:border-teal/60 hover:bg-teal/5"
            )}
          >
            <div
              className={clsx(
                "w-[22px] h-[22px] rounded-full border flex items-center justify-center text-xs font-semibold shrink-0",
                selected === opt.letter
                  ? "bg-teal border-teal text-white"
                  : "bg-white border-[#b7c0c8] text-ink"
              )}
            >
              {opt.letter}
            </div>
            {opt.text}
          </div>
        ))}
      </div>

      {showExplanation && question.explanation && (
     <div
       className="mt-5 p-4 bg-[#f4f6f8] border-l-[3px] border-teal text-sm leading-relaxed relative overflow-hidden select-none"
       onContextMenu={(e) => e.preventDefault()}
     >
       <p className="text-xs font-semibold uppercase tracking-wide text-teal mb-1">
         Explanation
       </p>
       {question.explanation}

       <div
         className="absolute inset-0 pointer-events-none flex flex-wrap content-around justify-around opacity-[0.08] overflow-hidden"
         aria-hidden="true"
       >
         {Array.from({ length: 12 }).map((_, i) => (
           <span
             key={i}
             className="text-ink text-xs font-medium whitespace-nowrap -rotate-12"
           >
             OptoAcademy · {userName}
           </span>
         ))}
       </div>
     </div>
   )}
    </div>
  );
}
