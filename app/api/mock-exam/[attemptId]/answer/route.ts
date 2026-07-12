import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(
  req: NextRequest,
  { params }: { params: { attemptId: string } }
) {
  const supabase = createSupabaseServerClient();
const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: attempt } = await supabaseAdmin
    .from("attempts")
    .select("id, user_id, submitted_at")
    .eq("id", params.attemptId)
    .single();

  if (!attempt || attempt.user_id !== user.id) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  }
  if (attempt.submitted_at) {
    return NextResponse.json({ error: "Exam already submitted" }, { status: 400 });
  }

  const body = await req.json();
  const { answerId, selected, flagged } = body;

  const updateData: any = {};
  if (selected !== undefined) updateData.selected = selected;
  if (flagged !== undefined) updateData.flagged = flagged;

  await supabaseAdmin.from("answers").update(updateData).eq("id", answerId);

  return NextResponse.json({ success: true });
}
