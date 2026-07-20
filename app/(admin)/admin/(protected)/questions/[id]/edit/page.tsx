import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { updateQuestion } from "../../actions";

const DIFFICULTY_OPTIONS = ["EASY", "MEDIUM", "HARD"];
const CORRECT_OPTIONS = ["A", "B", "C", "D", "E"];

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

export default async function EditQuestionPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { returnQuery?: string };
}) {
  await checkAccess();

  const { data: question } = await supabaseAdmin
    .from("questions")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!question) notFound();

  const { data: domains } = await supabaseAdmin
    .from("domains")
    .select("id, name")
    .order("name", { ascending: true });

  const returnQuery = searchParams.returnQuery || "";
  const cancelHref = `/admin/questions${returnQuery ? `?${returnQuery}` : ""}`;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-ink mb-8">Edit question</h1>

      <form action={updateQuestion} className="bg-white border border-line rounded-md p-6 flex flex-col gap-4">
        <input type="hidden" name="id" value={question.id} />
        <input type="hidden" name="returnQuery" value={returnQuery} />

        <div>
          <label className="block text-xs text-slate mb-1">Domain</label>
          <select
            name="domain_id"
            defaultValue={question.domain_id}
            required
            className="border border-line rounded-sm px-3 py-2 text-sm w-full"
          >
            {domains?.map((d: any) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate mb-1">Question (stem)</label>
          <textarea
            name="stem"
            defaultValue={question.stem}
            required
            rows={3}
            className="border border-line rounded-sm px-3 py-2 text-sm w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate mb-1">Option A</label>
            <input
              type="text"
              name="option_a"
              defaultValue={question.option_a}
              required
              className="border border-line rounded-sm px-3 py-2 text-sm w-full"
            />
          </div>
          <div>
            <label className="block text-xs text-slate mb-1">Option B</label>
            <input
              type="text"
              name="option_b"
              defaultValue={question.option_b}
              required
              className="border border-line rounded-sm px-3 py-2 text-sm w-full"
            />
          </div>
          <div>
            <label className="block text-xs text-slate mb-1">Option C</label>
            <input
              type="text"
              name="option_c"
              defaultValue={question.option_c}
              required
              className="border border-line rounded-sm px-3 py-2 text-sm w-full"
            />
          </div>
          <div>
            <label className="block text-xs text-slate mb-1">Option D</label>
            <input
              type="text"
              name="option_d"
              defaultValue={question.option_d ?? ""}
              className="border border-line rounded-sm px-3 py-2 text-sm w-full"
            />
          </div>
          <div>
            <label className="block text-xs text-slate mb-1">Option E (optional)</label>
            <input
              type="text"
              name="option_e"
              defaultValue={question.option_e ?? ""}
              className="border border-line rounded-sm px-3 py-2 text-sm w-full"
            />
          </div>
          <div>
            <label className="block text-xs text-slate mb-1">Correct option</label>
            <select
              name="correct_option"
              defaultValue={question.correct_option}
              required
              className="border border-line rounded-sm px-3 py-2 text-sm w-full"
            >
              {CORRECT_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate mb-1">Explanation</label>
          <textarea
            name="explanation"
            defaultValue={question.explanation ?? ""}
            rows={3}
            className="border border-line rounded-sm px-3 py-2 text-sm w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate mb-1">Difficulty</label>
            <select
              name="difficulty"
              defaultValue={question.difficulty}
              required
              className="border border-line rounded-sm px-3 py-2 text-sm w-full"
            >
              {DIFFICULTY_OPTIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate mb-1">Trial order (lower shows first)</label>
            <input
              type="number"
              name="trial_order"
              defaultValue={question.trial_order ?? ""}
              placeholder="e.g. 1"
              className="border border-line rounded-sm px-3 py-2 text-sm w-full"
            />
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" name="is_active" defaultChecked={question.is_active} className="accent-ink" />
            Active (shown to candidates)
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" name="is_trial" defaultChecked={question.is_trial} className="accent-ink" />
            Trial question (free preview)
          </label>
        </div>

        <div className="flex gap-3 mt-2">
          <button
            type="submit"
            className="bg-ink text-paper px-6 py-2.5 rounded-sm font-medium text-sm"
          >
            Save changes
          </button>
          <a
            href={cancelHref}
            className="border border-line px-6 py-2.5 rounded-sm font-medium text-sm text-ink flex items-center"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
