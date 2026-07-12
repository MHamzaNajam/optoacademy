import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import DeleteConsultationButton from "@/components/admin/DeleteConsultationButton";

const STATUS_OPTIONS = ["new", "contacted", "converted", "closed"];

async function checkPermission() {
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

async function updateStatus(formData: FormData) {
  "use server";
  await checkPermission();

  const id = formData.get("id") as string;
  const status = formData.get("status") as string;

  await supabaseAdmin
    .from("consultation_inquiries")
    .update({ status })
    .eq("id", id);

  redirect("/admin/consultations");
}

export async function deleteInquiry(formData: FormData) {
  "use server";
  await checkPermission();

  const id = formData.get("id") as string;

  await supabaseAdmin
    .from("consultation_inquiries")
    .delete()
    .eq("id", id);

  redirect("/admin/consultations");
}

export default async function ConsultationsPage() {
  await checkPermission();

  const { data: inquiries } = await supabaseAdmin
    .from("consultation_inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-semibold text-ink mb-8">
        Consultation inquiries {inquiries && inquiries.length > 0 && `(${inquiries.length})`}
      </h1>

      <div className="bg-white border border-line rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-mist text-left text-slate text-xs uppercase">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Exam</th>
              <th className="px-4 py-3">Docs add-on</th>
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
                <td className="px-4 py-3 text-slate">
                  <div>{inq.email}</div>
                  <div>{inq.phone}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium bg-teal/10 text-teal px-2 py-1 rounded-sm">
                    {inq.exam_type ?? "—"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {inq.wants_document_processing ? (
                    <span className="text-xs font-medium bg-amber/10 text-amber px-2 py-1 rounded-sm">Yes</span>
                  ) : (
                    <span className="text-slate text-xs">No</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate max-w-xs">{inq.message || "—"}</td>
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
                        <option key={s} value={s}>
                          {s}
                        </option>
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
                  <DeleteConsultationButton id={inq.id} name={inq.name} />
                </td>
              </tr>
            ))}
            {(!inquiries || inquiries.length === 0) && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate text-sm">
                  No consultation inquiries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
