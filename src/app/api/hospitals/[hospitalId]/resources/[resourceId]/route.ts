import { NextResponse } from "next/server";
import { toggleResourceActive } from "@/lib/hospitalStore";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ hospitalId: string; resourceId: string }> }
) {
  const { hospitalId, resourceId } = await params;

  const resource = toggleResourceActive(hospitalId, resourceId);
  if (!resource) {
    return NextResponse.json({ error: "Resource not found." }, { status: 404 });
  }

  return NextResponse.json({ resource });
}
