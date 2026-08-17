import { NextResponse } from "next/server";
import type { Appointment } from "@/types";

/**
 * Phase 1 demo API route.
 * Returns in-memory mock data so the frontend has a real endpoint to call.
 * Phase 2 replaces this with a database-backed implementation (Prisma).
 */

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "a1",
    patientId: "p1",
    doctorId: "d1",
    hospitalId: "h1",
    date: "2026-08-18",
    time: "10:30",
    status: "upcoming",
    reason: "General check-up",
  },
  {
    id: "a2",
    patientId: "p1",
    doctorId: "d2",
    hospitalId: "h1",
    date: "2026-08-25",
    time: "14:00",
    status: "upcoming",
    reason: "Cardiology follow-up",
  },
];

export async function GET() {
  return NextResponse.json({ appointments: MOCK_APPOINTMENTS });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body?.date || !body?.time) {
      return NextResponse.json(
        { error: "Both 'date' and 'time' are required." },
        { status: 400 }
      );
    }

    const newAppointment: Appointment = {
      id: `a${Date.now()}`,
      patientId: body.patientId ?? "p1",
      doctorId: body.doctorId ?? "unassigned",
      hospitalId: body.hospitalId ?? "h1",
      date: body.date,
      time: body.time,
      status: "upcoming",
      reason: body.reason,
    };

    return NextResponse.json({ appointment: newAppointment }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }
}
