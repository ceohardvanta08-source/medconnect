import { NextResponse } from "next/server";
import { registerHospital } from "@/lib/hospitalStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, address, contactNumber } = body ?? {};

    if (!name || !address || !contactNumber) {
      return NextResponse.json(
        { error: "name, address and contactNumber are all required." },
        { status: 400 }
      );
    }

    const hospital = registerHospital({ name, address, contactNumber });
    return NextResponse.json({ hospital }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
