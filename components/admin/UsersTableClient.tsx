"use client";

import { useState } from "react";
import Link from "next/link";
import { toggleSuspend } from "@/app/(admin)/admin/(protected)/users/actions";
import { DeleteUserButton, BulkDeleteBar } from "./UsersDeleteControls";

const PLAN_OPTIONS = ["FREE", "MONTH_1", "MONTH_3", "MONTH_6"];
const STATUS_OPTIONS = ["active", "canceled", "expired"];

function SubscriptionEditor({
  user,
  onUpdated,
}: {
  user: any;
  onUpdated: (userId: string, data: any) => void;
}) {
  const sub = user.subscriptions?.[0];
  const [plan, setPlan] = useState(sub?.plan ?? "FREE");
  const [status, setStatus] = useState(sub?.status ?? "active");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users/update-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, plan, status }),
      });
      if (res.ok) {
        const data = await res.json();
        onUpdated(user.id, data);
      } else {
        const errBody = await res.json().catch(() => ({}));
        alert(`Could not update subscription: ${errBody.error || "unknown error"}`);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <select
        value={plan}
        onChange={(e) => setPlan(e.target.value)}
        disabled={saving}
        className="border border-line rounded-sm text-xs px-2 py-1"
      >
        {PLAN_OPTIONS.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        disabled={saving}
        className="border border-line rounded-sm text-xs px-2 py-1"
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <button
        onClick={handleSave}
        disabled={saving}
        className="text-xs border border-line px-2 py-1 rounded-sm hover:bg-mist transition flex items-center justify-center gap-1.5 disabled:opacity-60"
      >
        {saving && <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />}
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}

export default function UsersTableClient({ users, returnQuery }: { users: any[]; returnQuery: string }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [userData, setUserData] = useState(users);

  const allSelected = userData.length > 0 && selected.length === userData.length;

  function toggleAll() {
    setSelected(allSelected ? [] : userData.map((u) => u.id));
  }

  function toggleOne(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleSubUpdated(userId: string, data: any) {
    setUserData((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              subscriptions: [{ plan: data.plan, status: data.status, current_period_end: data.current_period_end }],
              daysLeft: data.daysLeft,
            }
          : u
      )
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
              <th className="px-4 py-3">Time left</th>
              <th className="px-4 py-3">Account status</th>
              <th className="px-4 py-3">Mock exam settings</th>
              <th className="px-4 py-3">Delete</th>
            </tr>
          </thead>
          <tbody>
            {userData.map((u: any) => (
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
                  <SubscriptionEditor user={u} onUpdated={handleSubUpdated} />
                </td>
                <td className="px-4 py-3 text-slate whitespace-nowrap">
                  {u.daysLeft !== null && u.daysLeft !== undefined ? `${u.daysLeft} day(s)` : "—"}
                </td>
                <td className="px-4 py-3">
                  <form action={toggleSuspend}>
                    <input type="hidden" name="userId" value={u.id} />
                    <input type="hidden" name="currentlySuspended" value={String(u.is_suspended)} />
                    <input type="hidden" name="returnQuery" value={returnQuery} />
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
            ))}
            {userData.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-slate text-sm">
                  No users match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
