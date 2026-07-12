"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteUser } from "@/app/(admin)/admin/(protected)/users/actions";

export function UserRowCheckbox({
  id,
  selected,
  onToggle,
}: {
  id: string;
  selected: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <input
      type="checkbox"
      checked={selected}
      onChange={() => onToggle(id)}
      className="accent-ink"
    />
  );
}

export function DeleteUserButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteUser}
      onSubmit={(e) => {
        if (!confirm(`Permanently delete "${name}"? This removes their login and all account data. This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="userId" value={id} />
      <button
        type="submit"
        className="text-xs border border-red-200 text-red-600 px-2 py-1 rounded-sm hover:bg-red-50 transition"
      >
        Delete
      </button>
    </form>
  );
}

export function BulkDeleteBar({ selected, onCleared }: { selected: string[]; onCleared: () => void }) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  if (selected.length === 0) return null;

  async function handleBulkDelete() {
    if (!confirm(`Permanently delete ${selected.length} selected user(s)? This cannot be undone.`)) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/users/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected }),
      });
      if (res.ok) {
        onCleared();
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
  );
}
