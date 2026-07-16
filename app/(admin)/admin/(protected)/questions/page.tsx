import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import QuestionsTable from "@/components/admin/QuestionsTable";

const PAGE_SIZE = 25;
const DIFFICULTY_OPTIONS = ["EASY", "MEDIUM", "HARD"];

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
  searchParams: {
    page?: string;
    search?: string;
    domain?: string;
    difficulty?: string;
    status?: string;
    sort?: string;
  };
}) {
  await checkAccess();

  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);
  const search = searchParams.search?.trim() || "";
  const domainFilter = searchParams.domain || "";
  const difficultyFilter = searchParams.difficulty || "";
  const statusFilter = searchParams.status || "";
  const sort = searchParams.sort || "newest";

  // Domain counts (all questions are few enough to pull domain_id in one go)
  const { data: allDomainIds } = await supabaseAdmin.from("questions").select("domain_id");
  const { data: domains } = await supabaseAdmin.from("domains").select("id, name").order("name", { ascending: true });

  const countMap: Record<string, number> = {};
  allDomainIds?.forEach((q: any) => {
    countMap[q.domain_id] = (countMap[q.domain_id] || 0) + 1;
  });

  const domainSummary = (domains || [])
    .map((d: any) => ({
      label: d.name,
      count: countMap[d.id] || 0,
    }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count);

  const totalQuestions = allDomainIds?.length || 0;

  // Build the filtered, sorted, paginated query
  let query = supabaseAdmin
    .from("questions")
    .select("id, stem, correct_option, difficulty, is_active, domain_id", { count: "exact" });

  if (search) {
    query = query.ilike("stem", `%${search}%`);
  }
  if (domainFilter) {
    query = query.eq("domain_id", domainFilter);
  }
  if (difficultyFilter) {
    query = query.eq("difficulty", difficultyFilter);
  }
  if (statusFilter === "active") {
    query = query.eq("is_active", true);
  } else if (statusFilter === "inactive") {
    query = query.eq("is_active", false);
  }

  switch (sort) {
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "stem_asc":
      query = query.order("stem", { ascending: true });
      break;
    case "stem_desc":
      query = query.order("stem", { ascending: false });
      break;
    case "difficulty_asc":
      query = query.order("difficulty", { ascending: true });
      break;
    case "difficulty_desc":
      query = query.order("difficulty", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false }); // newest
  }

  query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const { data: questionRows, count } = await query;

  const domainLookup: Record<string, string> = {};
  domains?.forEach((d: any) => {
    domainLookup[d.id] = d.name;
  });

  const questions = (questionRows || []).map((q: any) => ({
    ...q,
    domainLabel: domainLookup[q.domain_id] || "Unknown",
  }));

  const totalPages = Math.max(1, Math.ceil((count || 0) / PAGE_SIZE));

  // Preserve current filters when building pagination links
  const filterParams = new URLSearchParams();
  if (search) filterParams.set("search", search);
  if (domainFilter) filterParams.set("domain", domainFilter);
  if (difficultyFilter) filterParams.set("difficulty", difficultyFilter);
  if (statusFilter) filterParams.set("status", statusFilter);
  if (sort) filterParams.set("sort", sort);
  const filterQueryString = filterParams.toString();

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

      <form method="GET" className="bg-white border border-line rounded-md p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-slate mb-1">Search</label>
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search question text..."
            className="border border-line rounded-sm px-3 py-2 text-sm w-56"
          />
        </div>

        <div>
          <label className="block text-xs text-slate mb-1">Domain</label>
          <select
            name="domain"
            defaultValue={domainFilter}
            className="border border-line rounded-sm px-3 py-2 text-sm w-44"
          >
            <option value="">All domains</option>
            {domains?.map((d: any) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate mb-1">Difficulty</label>
          <select
            name="difficulty"
            defaultValue={difficultyFilter}
            className="border border-line rounded-sm px-3 py-2 text-sm w-36"
          >
            <option value="">All difficulties</option>
            {DIFFICULTY_OPTIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate mb-1">Status</label>
          <select
            name="status"
            defaultValue={statusFilter}
            className="border border-line rounded-sm px-3 py-2 text-sm w-36"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-slate mb-1">Sort by</label>
          <select
            name="sort"
            defaultValue={sort}
            className="border border-line rounded-sm px-3 py-2 text-sm w-48"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="stem_asc">Question text (A–Z)</option>
            <option value="stem_desc">Question text (Z–A)</option>
            <option value="difficulty_asc">Difficulty (A–Z)</option>
            <option value="difficulty_desc">Difficulty (Z–A)</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-ink text-paper px-4 py-2 rounded-sm text-sm font-medium"
        >
          Apply
        </button>

        {(search || domainFilter || difficultyFilter || statusFilter || sort !== "newest") && (
  <Link
    href="/admin/questions"
    className="text-xs font-medium text-amber bg-amber/10 px-3 py-2 rounded-sm hover:bg-amber/20 transition"
  >
    Clear filters
  </Link>
)}
      </form>

      <QuestionsTable questions={questions} page={page} currentQuery={filterQueryString} />

      <div className="flex items-center gap-3 mt-6">
        {page > 1 && (
          <Link
            href={`/admin/questions?page=${page - 1}${filterQueryString ? `&${filterQueryString}` : ""}`}
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
            href={`/admin/questions?page=${page + 1}${filterQueryString ? `&${filterQueryString}` : ""}`}
            className="text-xs border border-line px-3 py-1.5 rounded-sm hover:bg-mist transition"
          >
            Next
          </Link>
        )}
      </div>
    </div>
  );
}
