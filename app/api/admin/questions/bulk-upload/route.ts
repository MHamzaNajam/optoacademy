import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const VALID_DIFFICULTIES = ["EASY", "MEDIUM", "HARD"];
const VALID_OPTIONS = ["A", "B", "C", "D", "E"];

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const adminId = cookieStore.get("admin_id")?.value;

  if (!adminId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: adminRow } = await supabaseAdmin
    .from("admin_users")
    .select("role, can_manage_questions")
    .eq("id", adminId)
    .single();

  const allowed = adminRow && (adminRow.role === "super_admin" || adminRow.can_manage_questions);
  if (!allowed) {
    return NextResponse.json({ error: "No permission" }, { status: 403 });
  }

  const body = await req.json();
  const rows: any[] = body.rows;

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "No rows provided" }, { status: 400 });
  }

  const { data: allDomains } = await supabaseAdmin.from("domains").select("id, name");
  const domainMap = new Map(
    (allDomains ?? []).map((d) => [d.name.trim().toLowerCase(), d.id])
  );

  const validRows: any[] = [];
  const errors: { row: number; reason: string }[] = [];

  rows.forEach((r, idx) => {
    const rowNum = idx + 1;
    const domainName = (r.domain_name || "").trim();
    const stem = (r.stem || "").trim();
    const optionA = (r.option_a || "").trim();
    const optionB = (r.option_b || "").trim();
    const optionC = (r.option_c || "").trim();
    const optionD = (r.option_d || "").trim();
    const optionE = (r.option_e || "").trim();
    const correctOption = (r.correct_option || "").trim().toUpperCase();
    const explanation = (r.explanation || "").trim();
    const difficulty = (r.difficulty || "MEDIUM").trim().toUpperCase();
    const isTrial = String(r.is_trial || "").trim().toUpperCase() === "TRUE";

    if (!stem) {
      errors.push({ row: rowNum, reason: "Missing question stem" });
      return;
    }
    if (!optionA || !optionB || !optionC || !optionD) {
      errors.push({ row: rowNum, reason: "Missing one or more of options A-D" });
      return;
    }
    if (!VALID_OPTIONS.includes(correctOption) || (correctOption === "E" && !optionE)) {
      errors.push({ row: rowNum, reason: `Invalid correct_option "${r.correct_option}"` });
      return;
    }
    if (!VALID_DIFFICULTIES.includes(difficulty)) {
      errors.push({ row: rowNum, reason: `Invalid difficulty "${r.difficulty}"` });
      return;
    }

    const domainId = domainMap.get(domainName.toLowerCase());
    if (!domainId) {
      errors.push({ row: rowNum, reason: `Domain "${domainName}" not found` });
      return;
    }

    validRows.push({
      domain_id: domainId,
      stem,
      option_a: optionA,
      option_b: optionB,
      option_c: optionC,
      option_d: optionD,
      option_e: optionE || null,
      correct_option: correctOption,
      explanation,
      difficulty,
      is_trial: isTrial,
      is_active: true,
    });
  });

  let insertedCount = 0;
  if (validRows.length > 0) {
    const { data, error: insertError } = await supabaseAdmin
      .from("questions")
      .insert(validRows)
      .select("id");

    if (insertError) {
      return NextResponse.json(
        { error: `Database error: ${insertError.message}`, errors },
        { status: 500 }
      );
    }
    insertedCount = data?.length ?? 0;
  }

  return NextResponse.json({
    insertedCount,
    errorCount: errors.length,
    errors,
  });
}
