import { NextResponse } from "next/server";
import { addResource, findHospitalById } from "@/lib/hospitalStore";

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
    const { name, category, quantity } = body ?? {};

    if (!name || !category || quantity === undefined) {
      return NextResponse.json(
        { error: "name, category and quantity are all required." },
        { status: 400 }
      );
    }

    const resource = addResource(hospitalId, {
      name,
      category,
      quantity: Number(quantity),
    });

    return NextResponse.json({ resource }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}
