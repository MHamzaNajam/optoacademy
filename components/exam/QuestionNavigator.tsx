"use client";

import clsx from "clsx";

type Props = {
  total: number;
  current: number;
  answered: Set<number>;
  flagged: Set<number>;
  onSelect: (n: number) => void;
};

export default function QuestionNavigator({
  total,
  current,
  answered,
  flagged,
  onSelect,
}: Props) {
  return (
    <div className="w-[74px] bg-[#f4f6f8] border-r border-line p-2 flex flex-col gap-1.5 max-h-[520px] overflow-y-auto">
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          onClick={() => onSelect(n)}
          className={clsx(
            "relative h-8 w-full rounded-sm border text-[13px] font-semibold flex items-center justify-center",
            answered.has(n)
              ? "bg-teal border-teal text-white"
              : "bg-white border-[#b7c0c8] text-ink",
            n === current && "outline outline-2 outline-offset-1 outline-amber"
          )}
        >
          {n}
          {flagged.has(n) && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber rounded-[2px]" />
          )}
        </button>
      ))}
    </div>
  );
}
