import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { addAdmin, updatePermissions } from "./actions";
import RemoveAdminButton from "@/components/admin/RemoveAdminButton";

const PERMISSIONS = [
  { key: "can_manage_questions", label: "Manage questions" },
  { key: "can_manage_users", label: "Manage users & subscriptions" },
  { key: "can_manage_consultations", label: "Manage consultation inquiries" },
  { key: "can_manage_blog", label: "Manage blog & announcements" },
  { key: "can_view_analytics", label: "View analytics" },
];

async function checkAccess() {
  const cookieStore = cookies();
  const adminId = cookieStore.get("admin_id")?.value;
  if (!adminId) redirect("/admin");

  const { data: adminRow } = await supabaseAdmin
    .from("admin_users")
    .select("role")
    .eq("id", adminId)
    .single();

  if (!adminRow || adminRow.role !== "super_admin") {
    redirect("/admin/dashboard?error=noaccess");
  }
}

export default async function AdminsPage({
  searchParams,
}: {
  searchParams: { error?: string; success?: string };
}) {
  await checkAccess();

  const { data: admins } = await supabaseAdmin
    .from("admin_users")
    .select("*")
    .order("role", { ascending: true });

  const errorMessages: Record<string, string> = {
    alreadyexists: "That email already has a login account. Use a different email.",
    invitefailed: "Couldn't send the invite. Check the email address and try again.",
    insertfailed: "Invite was sent, but saving their permissions failed. Contact support.",
  };
  const successMessages: Record<string, string> = {
    invited: "Invite sent! They'll get an email to set their password.",
    updated: "Permissions updated.",
    removed: "Admin removed and their login disabled.",
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold text-ink mb-8">Admins</h1>

      {searchParams.error && (
        <p className="text-red-600 text-sm mb-4">{errorMessages[searchParams.error]}</p>
      )}
      {searchParams.success && (
        <p className="text-teal text-sm mb-4">{successMessages[searchParams.success]}</p>
      )}

      <div className="bg-white border border-line rounded-md overflow-hidden mb-10">
        <table className="w-full text-sm">
          <thead className="bg-mist text-left text-slate text-xs uppercase">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Permissions</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {admins?.map((a: any) => (
              <tr key={a.id} className="border-t border-line align-top">
                <td className="px-4 py-3 text-ink whitespace-nowrap">{a.email}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium bg-teal/10 text-teal px-2 py-1 rounded-sm">
                    {a.role === "super_admin" ? "Super Admin" : "Admin"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {a.role === "super_admin" ? (
                    <span className="text-slate text-xs">Full access (all permissions)</span>
                  ) : (
                    <form action={updatePermissions} className="flex flex-col gap-1">
                      <input type="hidden" name="id" value={a.id} />
                      {PERMISSIONS.map((p) => (
                        <label key={p.key} className="flex items-center gap-2 text-xs text-slate">
                          <input
                            type="checkbox"
                            name={p.key}
                            defaultChecked={a[p.key]}
                            className="accent-ink"
                          />
                          {p.label}
                        </label>
                      ))}
                      <button
                        type="submit"
                        className="mt-1 text-xs border border-line px-2 py-1 rounded-sm hover:bg-mist transition w-fit"
                      >
                        Save
                      </button>
                    </form>
                  )}
                </td>
                <td className="px-4 py-3">
                  {a.role !== "super_admin" && <RemoveAdminButton id={a.id} email={a.email} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-line rounded-md p-6 max-w-lg">
        <h2 className="text-sm font-semibold text-ink mb-1">Invite a co-admin</h2>
        <p className="text-xs text-slate mb-4">
          They'll receive an email with a link to set their own password. No manual setup needed.
        </p>
        <form action={addAdmin} className="flex flex-col gap-3">
          <input
            type="email"
            name="email"
            placeholder="Email address"
            required
            className="border border-line rounded-sm px-3 py-2 text-sm w-full"
          />
          {PERMISSIONS.map((p) => (
            <label key={p.key} className="flex items-center gap-2 text-xs text-slate">
              <input type="checkbox" name={p.key} className="accent-ink" />
              {p.label}
            </label>
          ))}
          <button
            type="submit"
            className="bg-ink text-paper py-2 rounded-sm font-medium text-sm w-fit px-4 mt-1"
          >
            Send invite
          </button>
        </form>
      </div>
    </div>
  );
}
