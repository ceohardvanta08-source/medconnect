import { NextResponse } from "next/server";
import { registerHospital } from "@/lib/data";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { name, address, contactNumber, password } = body ?? {};

  if (!name || !address || !contactNumber || !password) {
    return NextResponse.json(
      { error: "All fields, including a password, are required." },
      { status: 400 }
    );
  }
  if (String(password).length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 }
    );
  }

  const hospital = registerHospital({ name, address, contactNumber, password });
  return NextResponse.json({ hospital }, { status: 201 });
}
