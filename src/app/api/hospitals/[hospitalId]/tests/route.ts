import { NextResponse } from "next/server";
import { addTest } from "@/lib/data";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ hospitalId: string }> }
) {
  const { hospitalId } = await params;
  const body = await request.json().catch(() => ({}));
  const { name } = body ?? {};

  if (!name) {
    return NextResponse.json({ error: "Test name is required." }, { status: 400 });
  }

  const test = addTest(hospitalId, name);
  if (!test) {
    return NextResponse.json({ error: "Hospital not found." }, { status: 404 });
  }
  return NextResponse.json({ test }, { status: 201 });
}
