import { NextResponse } from "next/server";
import { listHospitals } from "@/lib/hospitalStore";

export async function GET() {
  return NextResponse.json({ hospitals: listHospitals() });
}
