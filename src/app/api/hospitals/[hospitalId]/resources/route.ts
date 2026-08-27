import { NextResponse } from "next/server";
import { addResource } from "@/lib/data";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ hospitalId: string }> }
) {
  const { hospitalId } = await params;
  const body = await request.json().catch(() => ({}));
  const { name, category, quantity } = body ?? {};

  if (!name || !category) {
    return NextResponse.json(
      { error: "Name and category are required." },
      { status: 400 }
    );
  }

  const resource = addResource(hospitalId, {
    name,
    category,
    quantity: Number(quantity) || 1,
  });

  if (!resource) {
    return NextResponse.json({ error: "Hospital not found." }, { status: 404 });
  }
  return NextResponse.json({ resource }, { status: 201 });
}
