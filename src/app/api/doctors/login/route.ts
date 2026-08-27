import { NextResponse } from "next/server";
import { loginDoctor } from "@/lib/data";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { doctorCode, password } = body ?? {};

  if (!doctorCode || !password) {
    return NextResponse.json(
      { error: "Doctor ID and password are both required." },
      { status: 400 }
    );
  }

  const result = loginDoctor(doctorCode, password);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }
  return NextResponse.json({ doctor: result.doctor });
}
