import { NextResponse } from "next/server";
import { listHospitals } from "@/lib/data";

// GET /api/hospitals -> list every hospital
export async function GET() {
  return NextResponse.json({ hospitals: listHospitals() });
}
