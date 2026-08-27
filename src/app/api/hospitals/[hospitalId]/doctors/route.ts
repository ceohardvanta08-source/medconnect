import { NextResponse } from "next/server";
import { addDoctor } from "@/lib/data";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ hospitalId: string }> }
) {
  const { hospitalId } = await params;
  const body = await request.json().catch(() => ({}));
  const { name, specialty } = body ?? {};

  if (!name || !specialty) {
    return NextResponse.json(
      { error: "Name and specialty are required." },
      { status: 400 }
    );
  }

  const result = addDoctor(hospitalId, { name, specialty });
  if (!result) {
    return NextResponse.json({ error: "Hospital not found." }, { status: 404 });
  }

  return NextResponse.json(
    { doctor: result.doctor, tempPassword: result.tempPassword },
    { status: 201 }
  );
}
