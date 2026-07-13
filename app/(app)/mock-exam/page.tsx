import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Link from "next/link";
import MockExamPicker from "@/components/exam/MockExamPicker";

export default async function MockExamSetupPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: templates } = await supabaseAdmin
    .from("exam_templates")
    .select("*")
    .order("exam_type")
    .order("question_count", { ascending: false });

  return (
    <div className="min-h-screen bg-paper px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="text-sm text-slate hover:text-ink transition">
          ← Back to dashboard
        </Link>
        <h1 className="text-2xl font-semibold text-ink mt-4 mb-8">Choose a mock exam</h1>

        <MockExamPicker templates={templates ?? []} />
      </div>
    </div>
  );
}
