import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import MiniHeader from "@/components/marketing/MiniHeader";

async function login(formData: FormData) {
  "use server";

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Step 1: verify email + password against Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    redirect("/admin?error=invalid");
  }

  // Step 2: confirm this user is a registered admin (not just any Supabase Auth user)
  const { data: adminRow } = await supabaseAdmin
    .from("admin_users")
    .select("id, role")
    .eq("id", data.user!.id)
    .single();

  if (!adminRow) {
    redirect("/admin?error=notadmin");
  }

  const cookieStore = cookies();
  cookieStore.set("admin_auth", "true", { httpOnly: true, maxAge: 60 * 60 * 8 });
  cookieStore.set("admin_id", adminRow.id, { httpOnly: true, maxAge: 60 * 60 * 8 });
  cookieStore.set("admin_role", adminRow.role, { httpOnly: true, maxAge: 60 * 60 * 8 });

  redirect("/admin");
}

async function logout() {
  "use server";
  const cookieStore = cookies();
  cookieStore.delete("admin_auth");
  cookieStore.delete("admin_id");
  cookieStore.delete("admin_role");
  await supabase.auth.signOut();
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const isAuthed = cookies().get("admin_auth")?.value === "true";

  if (!isAuthed) {
    const errorMessages: Record<string, string> = {
      invalid: "Incorrect email or password.",
      notadmin: "This account does not have admin access.",
    };
    const errorMsg = searchParams.error ? errorMessages[searchParams.error] : null;

    return (
      <div className="min-h-screen bg-mist">
        <MiniHeader />
        <div className="flex items-center justify-center py-16">
          <form action={login} className="bg-white border border-line rounded-md p-8 w-full max-w-sm">
            <h1 className="text-lg font-semibold text-ink mb-4">Admin login</h1>

            {errorMsg && (
              <p className="text-red-600 text-sm mb-3">{errorMsg}</p>
            )}

            <label className="block text-xs text-slate mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              className="border border-line rounded-sm px-3 py-2 text-sm w-full mb-3"
            />

            <label className="block text-xs text-slate mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              className="border border-line rounded-sm px-3 py-2 text-sm w-full mb-3"
            />

            <button type="submit" className="bg-ink text-paper py-2.5 rounded-sm font-medium text-sm w-full">
              Enter
            </button>

            <a href="/admin/forgot-password" className="block text-center text-xs text-teal mt-4">
              Forgot password?
            </a>
          </form>
        </div>
      </div>
    );
  }

  const { data: users } = await supabaseAdmin
    .from("users")
    .select("id, name, email, created_at, subscriptions(plan, status, current_period_end)")
    .order("created_at", { ascending: false });

  const { data: attempts } = await supabaseAdmin
    .from("attempts")
    .select("user_id, score, exam_type, submitted_at");

  const { data: inquiries } = await supabaseAdmin
    .from("consultation_inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  const totalUsers = users?.length ?? 0;
  const activeSubs = users?.filter((u: any) => u.subscriptions?.[0]?.status === "active").length ?? 0;

  return (
    <div className="min-h-screen bg-mist">
      <MiniHeader />
      <div className="px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold text-ink">OptoAcademy admin</h1>
            <form action={logout}>
              <button
                type="submit"
                className="border border-line bg-white px-3 py-1.5 rounded-sm text-sm text-ink hover:border-slate transition"
              >
                Log out
              </button>
            </form>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-10">
            <div className="bg-white border border-line rounded-md p-5">
              <p className="text-xs text-slate mb-1">Total users</p>
              <p className="text-2xl font-semibold text-ink">{totalUsers}</p>
            </div>
            <div className="bg-white border border-line rounded-md p-5">
              <p className="text-xs text-slate mb-1">Active subscriptions</p>
              <p className="text-2xl font-semibold text-ink">{activeSubs}</p>
            </div>
            <div className="bg-white border border-line rounded-md p-5">
              <p className="text-xs text-slate mb-1">Mock exams completed</p>
              <p className="text-2xl font-semibold text-ink">
                {attempts?.filter((a: any) => a.submitted_at).length ?? 0}
              </p>
            </div>
          </div>

          <div className="bg-white border border-line rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-mist text-left text-slate text-xs uppercase">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((u: any) => (
                  <tr key={u.id} className="border-t border-line">
                    <td className="px-4 py-3 text-ink">{u.name ?? "—"}</td>
                    <td className="px-4 py-3 text-ink">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium bg-teal/10 text-teal px-2 py-1 rounded-sm">
                        {u.subscriptions?.[0]?.plan ?? "FREE"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate">{u.subscriptions?.[0]?.status ?? "—"}</td>
                    <td className="px-4 py-3 text-slate">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-lg font-semibold text-ink mt-12 mb-4">
            Consultation inquiries {inquiries && inquiries.length > 0 && `(${inquiries.length})`}
          </h2>

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
                        <span className="text-xs font-medium bg-amber/10 text-amber px-2 py-1 rounded-sm">
                          Yes
                        </span>
                      ) : (
                        <span className="text-slate text-xs">No</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate max-w-xs">{inq.message || "—"}</td>
                    <td className="px-4 py-3 text-slate whitespace-nowrap">
                      {new Date(inq.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {(!inquiries || inquiries.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate text-sm">
                      No consultation inquiries yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
