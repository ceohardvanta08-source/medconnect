import { NextResponse } from "next/server";
import { addTestType, findHospitalById } from "@/lib/hospitalStore";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ hospitalId: string }> }
) {
  const { hospitalId } = await params;

  if (!findHospitalById(hospitalId)) {
    return NextResponse.json({ error: "Hospital not found." }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { name } = body ?? {};

    if (!name) {
      return NextResponse.json({ error: "name is required." }, { status: 400 });
    }

    const test = addTestType(hospitalId, { name });
    return NextResponse.json({ test }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
