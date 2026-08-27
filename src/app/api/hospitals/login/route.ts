import { NextResponse } from "next/server";
import { loginHospital } from "@/lib/data";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { hospitalCode, password } = body ?? {};

  if (!hospitalCode || !password) {
    return NextResponse.json(
      { error: "Hospital ID and password are both required." },
      { status: 400 }
    );
  }

  const result = loginHospital(hospitalCode, password);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }
  return NextResponse.json({ hospital: result.hospital });
}
