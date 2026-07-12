import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { updateWeights } from "./actions";

async function checkAccess() {
  const cookieStore = cookies();
  const adminId = cookieStore.get("admin_id")?.value;
  if (!adminId) redirect("/admin");

  const { data: adminRow } = await supabaseAdmin
    .from("admin_users")
    .select("role, can_manage_questions")
    .eq("id", adminId)
    .single();

  if (!adminRow) redirect("/admin");
  const allowed = adminRow.role === "super_admin" || adminRow.can_manage_questions;
  if (!allowed) redirect("/admin/dashboard?error=noaccess");
}

export default async function DomainsPage() {
  await checkAccess();

  const { data: domains } = await supabaseAdmin
    .from("domains")
    .select("id, name, weight_percentage")
    .order("name");

  const total = (domains ?? []).reduce((sum, d) => sum + (d.weight_percentage ?? 0), 0);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-ink mb-2">Domain weighting</h1>
      <p className="text-sm text-slate mb-8">
        Controls what percentage of questions come from each domain in a standard
        mock exam. These should add up to 100%.
      </p>

      <form action={updateWeights} className="bg-white border border-line rounded-md p-6">
        <div className="flex flex-col gap-4">
          {domains?.map((d) => (
            <div key={d.id} className="flex items-center justify-between gap-4">
              <label className="text-sm text-ink flex-1">{d.name}</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  name={`weight_${d.id}`}
                  defaultValue={d.weight_percentage}
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
            {Math.abs(total - 100) >= 0.5 && " (should equal 100%)"}
          </p>
          <button
            type="submit"
            className="bg-ink text-paper px-6 py-2 rounded-sm font-medium text-sm"
          >
            Save weights
          </button>
        </div>
      </form>
    </div>
  );
}
