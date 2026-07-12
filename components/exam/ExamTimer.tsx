"use client";

import { useEffect, useState } from "react";

export default function ExamTimer({
  initialSeconds,
  onTimeUp,
}: {
  initialSeconds: number;
  onTimeUp?: () => void;
}) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(id);
          if (onTimeUp) onTimeUp();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [onTimeUp]);

  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");

  return (
    <span className="font-mono font-semibold bg-white/10 text-paper px-3 py-1 rounded-sm text-sm">
      {h}:{m}:{s}
    </span>
  );
}
