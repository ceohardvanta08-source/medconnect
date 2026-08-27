import { NextResponse } from "next/server";
import { createEmergencyAlert, respondToEmergencyAlert } from "@/lib/data";

// POST /api/hospitals/[hospitalId]/emergency -> send an SOS alert to this hospital
export async function POST(
  request: Request,
  { params }: { params: Promise<{ hospitalId: string }> }
) {
  const { hospitalId } = await params;
  const body = await request.json().catch(() => ({}));
  const { message, location, contactNumber } = body ?? {};

  if (!message) {
    return NextResponse.json(
      { error: "A short message is required." },
      { status: 400 }
    );
  }

  const alert = createEmergencyAlert(hospitalId, { message, location, contactNumber });
  if (!alert) {
    return NextResponse.json({ error: "Hospital not found." }, { status: 404 });
  }
  return NextResponse.json({ alert }, { status: 201 });
}

// PATCH /api/hospitals/[hospitalId]/emergency?alertId=xxx -> { status: "accepted" | "declined" }
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ hospitalId: string }> }
) {
  const { hospitalId } = await params;
  const alertId = new URL(request.url).searchParams.get("alertId");

  if (!alertId) {
    return NextResponse.json(
      { error: "alertId query parameter is required." },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const { status } = body ?? {};
  if (status !== "accepted" && status !== "declined") {
    return NextResponse.json(
      { error: "Status must be 'accepted' or 'declined'." },
      { status: 400 }
    );
  }

  const alert = respondToEmergencyAlert(hospitalId, alertId, status);
  if (!alert) {
    return NextResponse.json({ error: "Alert not found." }, { status: 404 });
  }
  return NextResponse.json({ alert });
}