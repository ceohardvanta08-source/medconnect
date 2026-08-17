import { NextResponse } from "next/server";
import { findDoctorByCode } from "@/lib/hospitalStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { doctorCode } = body ?? {};

    if (!doctorCode) {
      return NextResponse.json({ error: "doctorCode is required." }, { status: 400 });
    }

    const result = findDoctorByCode(doctorCode);
    if (!result) {
      return NextResponse.json(
        { error: "No doctor found with that ID." },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
