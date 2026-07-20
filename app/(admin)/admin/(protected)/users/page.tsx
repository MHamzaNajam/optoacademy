import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { daysRemaining } from "@/lib/subscription";
import UsersTableClient from "@/components/admin/UsersTableClient";

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

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { search?: string; plan?: string; status?: string };
}) {
  await checkAccess();

  const search = searchParams.search?.trim() || "";
  const planFilter = searchParams.plan || "";
  const statusFilter = searchParams.status || "";

  let query = supabaseAdmin
    .from("users")
    .select("id, name, email, mobile_number, institute_name, is_suspended, created_at, subscriptions(plan, status, current_period_end)")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data: usersRaw } = await query;

  let users = (usersRaw ?? []).map((u: any) => ({
    ...u,
    daysLeft: daysRemaining(u.subscriptions?.[0]?.current_period_end ?? null),
  }));

  if (planFilter) {
    users = users.filter((u: any) => (u.subscriptions?.[0]?.plan ?? "FREE") === planFilter);
  }
  if (statusFilter === "suspended") {
    users = users.filter((u: any) => u.is_suspended);
  } else if (statusFilter === "active") {
    users = users.filter((u: any) => !u.is_suspended);
  }

  const filterParams = new URLSearchParams();
  if (search) filterParams.set("search", search);
  if (planFilter) filterParams.set("plan", planFilter);
  if (statusFilter) filterParams.set("status", statusFilter);
  const filterQueryString = filterParams.toString();

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-semibold text-ink mb-6">
        Users {users.length > 0 && `(${users.length})`}
      </h1>

      <form method="GET" className="bg-white border border-line rounded-md p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-slate mb-1">Search</label>
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Name or email..."
            className="border border-line rounded-sm px-3 py-2 text-sm w-56"
          />
        </div>
        <div>
          <label className="block text-xs text-slate mb-1">Plan</label>
          <select name="plan" defaultValue={planFilter} className="border border-line rounded-sm px-3 py-2 text-sm w-40">
            <option value="">All plans</option>
            <option value="FREE">FREE</option>
            <option value="MONTH_1">MONTH_1</option>
            <option value="MONTH_3">MONTH_3</option>
            <option value="MONTH_6">MONTH_6</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-slate mb-1">Status</label>
          <select name="status" defaultValue={statusFilter} className="border border-line rounded-sm px-3 py-2 text-sm w-40">
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <button type="submit" className="bg-ink text-paper px-4 py-2 rounded-sm text-sm font-medium">
          Apply
        </button>
        {(search || planFilter || statusFilter) && (
          <a href="/admin/users" className="text-xs font-medium text-amber bg-amber/10 px-3 py-2 rounded-sm hover:bg-amber/20 transition">
            Clear filters
          </a>
        )}
      </form>

      <UsersTableClient users={users} returnQuery={filterQueryString} />
    </div>
  );
}
