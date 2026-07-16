import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function logout() {
  "use server";
  const supabase = createSupabaseServerClient();
  const cookieStore = cookies();
  cookieStore.delete("admin_auth");
  cookieStore.delete("admin_id");
  cookieStore.delete("admin_role");
  await supabase.auth.signOut();
  redirect("/admin");
}

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const isAuthed = cookieStore.get("admin_auth")?.value === "true";
  const adminId = cookieStore.get("admin_id")?.value;

  if (!isAuthed || !adminId) {
    redirect("/admin");
  }

  let adminRow: any = null;
  let queryErrorMessage: string | null = null;

  try {
    const result = await supabaseAdmin
      .from("admin_users")
      .select("email, role, can_manage_questions, can_manage_users, can_manage_consultations, can_manage_blog, can_view_analytics")
      .eq("id", adminId)
      .single();

    adminRow = result.data;
    if (result.error) {
      queryErrorMessage = result.error.message;
    }
  } catch (err: any) {
    queryErrorMessage = err?.message || String(err);
  }

  if (queryErrorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mist px-6">
        <div className="max-w-lg bg-white border border-[#c0392b]/30 rounded-md p-6">
          <h1 className="text-lg font-semibold text-[#c0392b] mb-2">Admin panel error</h1>
          <p className="text-sm text-slate mb-2">The admin_users lookup failed:</p>
          <pre className="text-xs bg-mist p-3 rounded-sm overflow-auto text-ink">{queryErrorMessage}</pre>
        </div>
      </div>
    );
  }

  if (!adminRow) {
    redirect("/admin");
  }

  const isSuperAdmin = adminRow.role === "super_admin";

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", show: isSuperAdmin || adminRow.can_view_analytics },
    { href: "/admin/questions", label: "Questions", show: isSuperAdmin || adminRow.can_manage_questions },
    { href: "/admin/domains", label: "Domain Weighting", show: isSuperAdmin || adminRow.can_manage_questions },
    { href: "/admin/users", label: "Users", show: isSuperAdmin || adminRow.can_manage_users },
    { href: "/admin/consultations", label: "Consultations", show: isSuperAdmin || adminRow.can_manage_consultations },
    { href: "/admin/blog", label: "Blog", show: isSuperAdmin || adminRow.can_manage_blog },
    { href: "/admin/admins", label: "Admins", show: isSuperAdmin },
    { href: "/admin/settings", label: "Settings", show: isSuperAdmin },
  ];

  return (
    <div className="min-h-screen bg-mist flex">
      <aside className="w-56 bg-ink text-paper flex flex-col justify-between min-h-screen p-4">
        <div>
          <p className="text-sm font-semibold mb-2">OptoAcademy Admin</p>
          <Link
            href="/"
            target="_blank"
            className="text-xs text-white/60 hover:text-white transition mb-6 block"
          >
            View live site ↗
          </Link>
          <nav className="flex flex-col gap-1">
            {navItems
              .filter((item) => item.show)
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm px-3 py-2 rounded-sm hover:bg-white/10 transition"
                >
                  {item.label}
                </Link>
              ))}
          </nav>
        </div>
        <div>
          <p className="text-xs text-white/60 mb-2">
            {adminRow.email} · {isSuperAdmin ? "Super Admin" : "Admin"}
          </p>
          <form action={logout}>
            <button
              type="submit"
              className="text-xs border border-white/20 px-3 py-1.5 rounded-sm w-full hover:bg-white/10 transition"
            >
              Log out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
