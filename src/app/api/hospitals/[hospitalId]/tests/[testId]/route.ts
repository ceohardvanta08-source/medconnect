import { NextResponse } from "next/server";
import { cycleTestStatus } from "@/lib/data";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ hospitalId: string; testId: string }> }
) {
  const { hospitalId, testId } = await params;
  const test = cycleTestStatus(hospitalId, testId);
  if (!test) {
    return NextResponse.json({ error: "Test not found." }, { status: 404 });
  }
  return NextResponse.json({ test });
}
