"use client";

import { useState } from "react";
import Link from "next/link";
import { toggleSuspend, updateSubscription } from "@/app/(admin)/admin/(protected)/users/actions";
import { DeleteUserButton, BulkDeleteBar } from "./UsersDeleteControls";

const PLAN_OPTIONS = ["FREE", "MONTH_1", "MONTH_3", "LIFETIME"];
const STATUS_OPTIONS = ["active", "canceled", "expired"];

export default function UsersTableClient({ users }: { users: any[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const allSelected = users.length > 0 && selected.length === users.length;

  function toggleAll() {
    setSelected(allSelected ? [] : users.map((u) => u.id));
  }

  function toggleOne(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <div>
      <BulkDeleteBar selected={selected} onCleared={() => setSelected([])} />

      <div className="bg-white border border-line rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-mist text-left text-slate text-xs uppercase">
            <tr>
              <th className="px-4 py-3">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-ink" />
              </th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Institute</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Subscription</th>
              <th className="px-4 py-3">Account status</th>
              <th className="px-4 py-3">Mock exam settings</th>
              <th className="px-4 py-3">Delete</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => {
              const sub = u.subscriptions?.[0];
              return (
                <tr key={u.id} className="border-t border-line align-top">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(u.id)}
                      onChange={() => toggleOne(u.id)}
                      className="accent-ink"
                    />
                  </td>
                  <td className="px-4 py-3 text-ink whitespace-nowrap">
                    {u.name ?? "—"}
                    {u.is_suspended && (
                      <span className="block text-xs font-medium text-[#c0392b] mt-1">
                        Suspended
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate">
                    <div>{u.email}</div>
                    <div>{u.mobile_number}</div>
                  </td>
                  <td className="px-4 py-3 text-slate">{u.institute_name ?? "—"}</td>
                  <td className="px-4 py-3 text-slate whitespace-nowrap">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <form action={updateSubscription} className="flex flex-col gap-1.5">
                      <input type="hidden" name="userId" value={u.id} />
                      <select
                        name="plan"
                        defaultValue={sub?.plan ?? "FREE"}
                        className="border border-line rounded-sm text-xs px-2 py-1"
                      >
                        {PLAN_OPTIONS.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                      <select
                        name="status"
                        defaultValue={sub?.status ?? "active"}
                        className="border border-line rounded-sm text-xs px-2 py-1"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="text-xs border border-line px-2 py-1 rounded-sm hover:bg-mist transition"
                      >
                        Save
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <form action={toggleSuspend}>
                      <input type="hidden" name="userId" value={u.id} />
                      <input type="hidden" name="currentlySuspended" value={String(u.is_suspended)} />
                      <button
                        type="submit"
                        className={`text-xs px-2 py-1 rounded-sm border transition ${
                          u.is_suspended
                            ? "border-teal text-teal hover:bg-teal/10"
                            : "border-[#c0392b] text-[#c0392b] hover:bg-[#c0392b]/10"
                        }`}
                      >
                        {u.is_suspended ? "Reactivate" : "Suspend"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/users/weights?userId=${u.id}`}
                      className="text-xs border border-line px-2 py-1 rounded-sm hover:bg-mist transition text-ink"
                    >
                      Custom weighting
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <DeleteUserButton id={u.id} name={u.name ?? u.email} />
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate text-sm">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
