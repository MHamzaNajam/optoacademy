import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { updateStatus, deleteInquiry } from "./actions";

const STATUS_OPTIONS = ["new", "in_progress", "resolved"];

async function checkAccess() {
  const cookieStore = cookies();
  const adminId = cookieStore.get("admin_id")?.value;
  if (!adminId) redirect("/admin");

  const { data: adminRow } = await supabaseAdmin
    .from("admin_users")
    .select("role, can_manage_consultations")
    .eq("id", adminId)
    .single();

  if (!adminRow) redirect("/admin");
  const allowed = adminRow.role === "super_admin" || adminRow.can_manage_consultations;
  if (!allowed) redirect("/admin/dashboard?error=noaccess");
}

export default async function SupportInquiriesPage() {
  await checkAccess();

  const { data: inquiries } = await supabaseAdmin
    .from("general_inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-semibold text-ink mb-8">
        Contact Us messages {inquiries && inquiries.length > 0 && `(${inquiries.length})`}
      </h1>

      <div className="bg-white border border-line rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-mist text-left text-slate text-xs uppercase">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Delete</th>
            </tr>
          </thead>
          <tbody>
            {inquiries?.map((inq: any) => (
              <tr key={inq.id} className="border-t border-line align-top">
                <td className="px-4 py-3 text-ink whitespace-nowrap">{inq.name}</td>
                <td className="px-4 py-3 text-slate">{inq.email}</td>
                <td className="px-4 py-3 text-slate max-w-sm">{inq.message}</td>
                <td className="px-4 py-3 text-slate whitespace-nowrap">
                  {new Date(inq.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <form action={updateStatus} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={inq.id} />
                    <select
                      name="status"
                      defaultValue={inq.status ?? "new"}
                      className="border border-line rounded-sm text-xs px-2 py-1"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <button type="submit" className="text-xs border border-line px-2 py-1 rounded-sm hover:bg-mist transition">
                      Save
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3">
                  <form action={deleteInquiry}>
                    <input type="hidden" name="id" value={inq.id} />
                    <button type="submit" className="text-xs border border-red-200 text-red-600 px-2 py-1 rounded-sm hover:bg-red-50 transition">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {(!inquiries || inquiries.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate text-sm">
                  No messages yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
