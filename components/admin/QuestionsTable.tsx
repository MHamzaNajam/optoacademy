"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteQuestion } from "@/app/(admin)/admin/(protected)/questions/actions";

type Question = {
  id: string;
  stem: string;
  correct_option: string;
  difficulty: string;
  is_active: boolean;
  domainLabel: string;
};

export default function QuestionsTable({
  questions,
  page,
}: {
  questions: Question[];
  page: number;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const allSelected = questions.length > 0 && selected.length === questions.length;

  function toggleAll() {
    setSelected(allSelected ? [] : questions.map((q) => q.id));
  }

  function toggleOne(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleBulkDelete() {
    if (selected.length === 0) return;
    if (!confirm(`Delete ${selected.length} selected question(s)? This cannot be undone.`)) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/questions/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected }),
      });
      if (res.ok) {
        setSelected([]);
        router.refresh();
      } else {
        const body = await res.json();
        alert(`Delete failed: ${body.error || "unknown error"}`);
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      {selected.length > 0 && (
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-slate">{selected.length} selected</span>
          <button
            onClick={handleBulkDelete}
            disabled={deleting}
            className="text-xs border border-red-200 text-red-600 px-3 py-1.5 rounded-sm hover:bg-red-50 transition disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete selected"}
          </button>
        </div>
      )}

      <div className="bg-white border border-line rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-mist text-left text-slate text-xs uppercase">
            <tr>
              <th className="px-4 py-3">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-ink" />
              </th>
              <th className="px-4 py-3">Domain</th>
              <th className="px-4 py-3">Question</th>
              <th className="px-4 py-3">Answer</th>
              <th className="px-4 py-3">Difficulty</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3">Delete</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.id} className="border-t border-line align-top">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(q.id)}
                    onChange={() => toggleOne(q.id)}
                    className="accent-ink"
                  />
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium bg-teal/10 text-teal px-2 py-1 rounded-sm whitespace-nowrap">
                    {q.domainLabel}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink max-w-md">{q.stem}</td>
                <td className="px-4 py-3 text-slate">{q.correct_option}</td>
                <td className="px-4 py-3 text-slate">{q.difficulty}</td>
                <td className="px-4 py-3">
                  {q.is_active ? (
                    <span className="text-xs text-teal">Yes</span>
                  ) : (
                    <span className="text-xs text-slate">No</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <form action={deleteQuestion}>
                    <input type="hidden" name="id" value={q.id} />
                    <input type="hidden" name="page" value={page} />
                    <button
                      type="submit"
                      className="text-xs border border-red-200 text-red-600 px-2 py-1 rounded-sm hover:bg-red-50 transition"
                    >
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {questions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate text-sm">
                  No questions match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
