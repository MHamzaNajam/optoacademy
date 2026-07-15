import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { updateTrialLimit } from "./actions";

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

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: { saved?: string };
}) {
  await checkAccess();

  const { data: setting } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", "trial_question_limit")
    .single();

  const { count: trialCount } = await supabaseAdmin
    .from("questions")
    .select("id", { count: "exact", head: true })
    .eq("is_trial", true);

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-ink mb-8">Settings</h1>

      {searchParams.saved && (
        <p className="text-xs text-teal bg-teal/5 border border-teal/20 rounded-sm px-3 py-2 mb-4">
          Saved successfully.
        </p>
      )}

      <div className="bg-white border border-line rounded-md p-6">
        <h2 className="text-sm font-semibold text-ink mb-1">Trial session limit</h2>
        <p className="text-xs text-slate mb-4">
          Number of questions shown to logged-in users without an active
          subscription. Currently {trialCount ?? 0} question(s) are marked
          as trial content.
        </p>

        <form action={updateTrialLimit} className="flex items-center gap-3">
          <input
            type="number"
            name="trial_limit"
            min="1"
            max="50"
            defaultValue={setting?.value ?? "10"}
            className="border border-line rounded-sm px-3 py-2 text-sm w-24"
          />
          <button
            type="submit"
            className="bg-ink text-paper px-5 py-2 rounded-sm font-medium text-sm"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  );
}
