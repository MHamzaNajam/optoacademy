import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import QuestionsTable from "@/components/admin/QuestionsTable";

const PAGE_SIZE = 25;

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

export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  await checkAccess();

  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);
  const search = searchParams.search?.trim() || "";

  // Domain counts (all questions are few enough to pull domain_id in one go)
  const { data: allDomainIds } = await supabaseAdmin.from("questions").select("domain_id");
  const { data: domains } = await supabaseAdmin.from("domains").select("id, name, exam_type");

  const countMap: Record<string, number> = {};
  allDomainIds?.forEach((q: any) => {
    countMap[q.domain_id] = (countMap[q.domain_id] || 0) + 1;
  });

  const domainSummary = (domains || [])
    .map((d: any) => ({
      label: `${d.name} · ${d.exam_type}`,
      count: countMap[d.id] || 0,
    }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count);

  const totalQuestions = allDomainIds?.length || 0;

  // Paginated, searchable question list
  let query = supabaseAdmin
    .from("questions")
    .select("id, stem, correct_option, difficulty, is_active, domain_id", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (search) {
    query = query.ilike("stem", `%${search}%`);
  }

  const { data: questionRows, count } = await query;

  const domainLookup: Record<string, string> = {};
  domains?.forEach((d: any) => {
    domainLookup[d.id] = `${d.name} · ${d.exam_type}`;
  });

  const questions = (questionRows || []).map((q: any) => ({
    ...q,
    domainLabel: domainLookup[q.domain_id] || "Unknown",
  }));

  const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-ink">
          Questions {totalQuestions > 0 && `(${totalQuestions})`}
        </h1>
        <Link
          href="/admin/questions/bulk-upload"
          className="text-sm border border-line bg-white px-4 py-2 rounded-sm text-ink hover:border-slate transition"
        >
          Bulk upload
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-3 mb-8">
        {domainSummary.map((d) => (
          <div key={d.label} className="bg-white border border-line rounded-md p-4">
            <p className="text-xs text-slate mb-1">{d.label}</p>
            <p className="text-xl font-semibold text-ink">{d.count}</p>
          </div>
        ))}
        {domainSummary.length === 0 && (
          <p className="text-sm text-slate col-span-3">No questions yet.</p>
        )}
      </div>

      <form className="mb-4" method="GET">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search question text..."
          className="border border-line rounded-sm px-3 py-2 text-sm w-full max-w-sm"
        />
      </form>

      <QuestionsTable questions={questions} page={page} />

      <div className="flex items-center gap-3 mt-6">
        {page > 1 && (
          <Link
            href={`/admin/questions?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
            className="text-xs border border-line px-3 py-1.5 rounded-sm hover:bg-mist transition"
          >
            Previous
          </Link>
        )}
        <span className="text-xs text-slate">
          Page {page} of {totalPages}
        </span>
        {page < totalPages && (
          <Link
            href={`/admin/questions?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ""}`}
            className="text-xs border border-line px-3 py-1.5 rounded-sm hover:bg-mist transition"
          >
            Next
          </Link>
        )}
      </div>
    </div>
  );
}
