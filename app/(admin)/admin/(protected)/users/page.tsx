import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
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
      <UsersTableClient users={users || []} />
    </div>
  );
}
