"use client";

import { removeAdmin } from "@/app/(admin)/admin/(protected)/admins/actions";

export default function RemoveAdminButton({ id, email }: { id: string; email: string }) {
  return (
    <form
      action={removeAdmin}
      onSubmit={(e) => {
        if (!confirm(`Remove admin access for "${email}"? They will no longer be able to log into /admin.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-xs border border-red-200 text-red-600 px-2 py-1 rounded-sm hover:bg-red-50 transition"
      >
        Remove
      </button>
    </form>
  );
}
