import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { saveUserWeights, resetToDefault } from "./actions";

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

export default async function UserWeightsPage({
  searchParams,
}: {
  searchParams: { userId?: string; saved?: string };
}) {
  await checkAccess();

  const userId = searchParams.userId;
  if (!userId) {
    return (
      <div className="max-w-2xl">
        <p className="text-sm text-slate">
          No user selected. Go to the Users page and click "Custom weighting" next to a specific user.
        </p>
      </div>
    );
  }

  const { data: user } = await supabaseAdmin
    .from("users")
    .select("name, email")
    .eq("id", userId)
    .single();

  const { data: domains } = await supabaseAdmin
    .from("domains")
    .select("id, name, weight_percentage")
    .order("name");

  const { data: customWeights } = await supabaseAdmin
    .from("user_domain_weights")
    .select("domain_id, weight_percentage")
    .eq("user_id", userId);

  const customMap = new Map((customWeights ?? []).map((w) => [w.domain_id, w.weight_percentage]));
  const hasCustom = (customWeights?.length ?? 0) > 0;

  const rows = (domains ?? []).map((d) => ({
    id: d.id,
    name: d.name,
    value: customMap.has(d.id) ? customMap.get(d.id) : d.weight_percentage,
  }));

  const total = rows.reduce((sum, r) => sum + (r.value ?? 0), 0);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-ink mb-1">Custom domain weighting</h1>
      <p className="text-sm text-slate mb-1">
        For: <span className="text-ink font-medium">{user?.name ?? user?.email}</span>
      </p>
      <p className="text-xs text-slate mb-8">
        {hasCustom
          ? "This candidate currently has custom weights, overriding the global default."
          : "This candidate is currently using the global default weighting."}
      </p>

      {searchParams.saved && (
        <p className="text-xs text-teal bg-teal/5 border border-teal/20 rounded-sm px-3 py-2 mb-4">
          Saved successfully.
        </p>
      )}

      <form action={saveUserWeights} className="bg-white border border-line rounded-md p-6">
        <input type="hidden" name="userId" value={userId} />
        <div className="flex flex-col gap-4">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-4">
              <label className="text-sm text-ink flex-1">{r.name}</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  name={`weight_${r.id}`}
                  defaultValue={r.value}
                  className="border border-line rounded-sm px-3 py-1.5 text-sm w-24 text-right"
                />
                <span className="text-sm text-slate">%</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-line">
          <p className={`text-sm font-medium ${Math.abs(total - 100) < 0.5 ? "text-teal" : "text-[#c0392b]"}`}>
            Total: {total.toFixed(2)}%
          </p>
          <button type="submit" className="bg-ink text-paper px-6 py-2 rounded-sm font-medium text-sm">
            Save custom weights
          </button>
        </div>
      </form>

      <form action={resetToDefault} className="mt-4">
        <input type="hidden" name="userId" value={userId} />
        <button
          type="submit"
          className="text-xs text-slate border border-line px-4 py-2 rounded-sm hover:bg-mist transition"
        >
          Reset to global default
        </button>
      </form>
    </div>
  );
}
