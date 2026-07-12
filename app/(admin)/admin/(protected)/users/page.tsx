import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { toggleSuspend, updateSubscription } from "./actions";

const PLAN_OPTIONS = ["FREE", "MONTH_1", "MONTH_3", "LIFETIME"];
const STATUS_OPTIONS = ["active", "canceled", "expired"];

async function checkAccess() {
  const cookieStore = cookies();
  const adminId = cookieStore.get("admin_id")?.value;
  if (!adminId) redirect("/admin");

  const { data: adminRow } = await supabaseAdmin
    .from("admin_users")
    .select("role, can_manage_users")
    .eq("id", adminId)
    .single();

  if (!adminRow) redirect("/admin");
  const allowed = adminRow.role === "super_admin" || adminRow.can_manage_users;
  if (!allowed) redirect("/admin/dashboard?error=noaccess");
}

export default async function UsersPage() {
  await checkAccess();

  const { data: users } = await supabaseAdmin
    .from("users")
    .select("id, name, email, mobile_number, institute_name, is_suspended, created_at, subscriptions(plan, status)")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-semibold text-ink mb-8">
        Users {users && users.length > 0 && `(${users.length})`}
      </h1>

      <div className="bg-white border border-line rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-mist text-left text-slate text-xs uppercase">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Institute</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Subscription</th>
              <th className="px-4 py-3">Account status</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u: any) => {
              const sub = u.subscriptions?.[0];
              return (
                <tr key={u.id} className="border-t border-line align-top">
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
                </tr>
              );
            })}
            {(!users || users.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate text-sm">
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
