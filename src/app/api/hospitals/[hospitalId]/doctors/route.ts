import { NextResponse } from "next/server";
import { addDoctor, findHospitalById } from "@/lib/hospitalStore";

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
    const { name, specialty } = body ?? {};

    if (!name || !specialty) {
      return NextResponse.json(
        { error: "name and specialty are both required." },
        { status: 400 }
      );
    }

    const doctor = addDoctor(hospitalId, { name, specialty });
    return NextResponse.json({ doctor }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
