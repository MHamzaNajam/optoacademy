import { NextRequest, NextResponse } from "next/server";
import { startMockExam } from "../actions";

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  try {
    await startMockExam(formData);
  } catch (err: any) {
    // startMockExam calls redirect() internally, which throws a special
    // Next.js redirect signal — let it propagate so the browser follows it
    throw err;
  }

  return NextResponse.json({ success: true });
}
