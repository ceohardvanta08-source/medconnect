import { NextResponse } from "next/server";
import {
  addDoctor,
  assignPatientToDoctor,
  dischargePatientFromDoctor,
  type PatientSeverity,
} from "@/lib/data";

// POST /api/hospitals/[hospitalId]/doctors -> issue a new Doctor ID + starting password
export async function POST(
  request: Request,
  { params }: { params: Promise<{ hospitalId: string }> }
) {
  const { hospitalId } = await params;
  const body = await request.json().catch(() => ({}));
  const { name, specialty } = body ?? {};

  if (!name || !specialty) {
    return NextResponse.json(
      { error: "Name and specialty are required." },
      { status: 400 }
    );
  }

  const result = addDoctor(hospitalId, { name, specialty });
  if (!result) {
    return NextResponse.json({ error: "Hospital not found." }, { status: 404 });
  }

  return NextResponse.json(
    { doctor: result.doctor, tempPassword: result.tempPassword },
    { status: 201 }
  );
}

const VALID_SEVERITIES: PatientSeverity[] = ["critical", "stable", "recovering", "observation"];

// PATCH /api/hospitals/[hospitalId]/doctors
// body: { action: "assign", doctorId, patientName, condition, severity }
//    or { action: "discharge", doctorId, patientCaseId }
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ hospitalId: string }> }
) {
  const { hospitalId } = await params;
  const body = await request.json().catch(() => ({}));
  const { action, doctorId } = body ?? {};

  if (!doctorId) {
    return NextResponse.json({ error: "doctorId is required." }, { status: 400 });
  }

  if (action === "assign") {
    const { patientName, condition, severity } = body ?? {};
    if (!patientName || !condition || !severity) {
      return NextResponse.json(
        { error: "patientName, condition and severity are required." },
        { status: 400 }
      );
    }
    if (!VALID_SEVERITIES.includes(severity)) {
      return NextResponse.json({ error: "Invalid severity." }, { status: 400 });
    }

    const patientCase = assignPatientToDoctor(hospitalId, doctorId, {
      patientName,
      condition,
      severity,
    });
    if (!patientCase) {
      return NextResponse.json({ error: "Doctor not found." }, { status: 404 });
    }
    return NextResponse.json({ patientCase }, { status: 201 });
  }

  if (action === "discharge") {
    const { patientCaseId } = body ?? {};
    if (!patientCaseId) {
      return NextResponse.json({ error: "patientCaseId is required." }, { status: 400 });
    }
    const ok = dischargePatientFromDoctor(hospitalId, doctorId, patientCaseId);
    if (!ok) {
      return NextResponse.json({ error: "Patient case not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action. Use 'assign' or 'discharge'." }, { status: 400 });
}