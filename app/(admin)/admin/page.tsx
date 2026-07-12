import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import MiniHeader from "@/components/marketing/MiniHeader";

async function login(formData: FormData) {
  "use server";

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    redirect("/admin?error=invalid");
  }

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

  redirect("/admin/dashboard");
}

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const isAuthed = cookies().get("admin_auth")?.value === "true";
  if (isAuthed) {
    redirect("/admin/dashboard");
  }

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

          {errorMsg && <p className="text-red-600 text-sm mb-3">{errorMsg}</p>}

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
