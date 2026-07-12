"use client";

import { deleteInquiry } from "@/app/(admin)/admin/(protected)/consultations/actions";

export default function DeleteConsultationButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteInquiry}
      onSubmit={(e) => {
        if (!confirm(`Delete the inquiry from "${name}"? This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-xs border border-red-200 text-red-600 px-2 py-1 rounded-sm hover:bg-red-50 transition"
      >
        Delete
      </button>
    </form>
  );
}
