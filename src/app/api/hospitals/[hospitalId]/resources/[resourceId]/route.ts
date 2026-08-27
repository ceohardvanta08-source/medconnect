import { NextResponse } from "next/server";
import { cycleResourceStatus } from "@/lib/data";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ hospitalId: string; resourceId: string }> }
) {
  const { hospitalId, resourceId } = await params;
  const resource = cycleResourceStatus(hospitalId, resourceId);
  if (!resource) {
    return NextResponse.json({ error: "Resource not found." }, { status: 404 });
  }
  return NextResponse.json({ resource });
}
