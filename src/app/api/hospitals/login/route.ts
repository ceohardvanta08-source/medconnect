import { NextResponse } from "next/server";
import { findHospitalByCode } from "@/lib/hospitalStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { hospitalCode } = body ?? {};

    if (!hospitalCode) {
      return NextResponse.json({ error: "hospitalCode is required." }, { status: 400 });
    }

    const hospital = findHospitalByCode(hospitalCode);
    if (!hospital) {
      return NextResponse.json(
        { error: "No hospital found with that ID." },
        { status: 404 }
      );
    }

    return NextResponse.json({ hospital });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
