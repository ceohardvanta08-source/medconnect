import { NextResponse } from "next/server";
import { toggleTestActive } from "@/lib/hospitalStore";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ hospitalId: string; testId: string }> }
) {
  const { hospitalId, testId } = await params;

  const test = toggleTestActive(hospitalId, testId);
  if (!test) {
    return NextResponse.json({ error: "Test type not found." }, { status: 404 });
  }

  return NextResponse.json({ test });
}
