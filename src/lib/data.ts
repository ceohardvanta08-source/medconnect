// lib/data.ts
//
// Every piece of server-side state and logic lives in this one file:
// shared types, password hashing, and the in-memory store for hospitals,
// resources, tests, doctors, and emergency alerts.
//
// Data is kept on globalThis so it survives Next.js dev hot-reloads instead
// of resetting on every file save.

import { randomUUID, randomBytes, scryptSync, timingSafeEqual } from "crypto";

// ---------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------

/** Available -> Occupied -> Maintenance -> back to Available, cycled by clicking the badge */
export type StatusValue = "available" | "occupied" | "maintenance";

export type EmergencyStatus = "pending" | "accepted" | "declined";

export interface ResourceRecord {
  id: string;
  name: string;
  category: string;
  quantity: number;
  status: StatusValue;
}

export interface TestRecord {
  id: string;
  name: string;
  status: StatusValue;
}

export interface DoctorRecord {
  id: string;
  name: string;
  specialty: string;
  doctorCode: string;
}

export interface EmergencyAlert {
  id: string;
  message: string;
  location?: string;
  contactNumber?: string;
  status: EmergencyStatus;
  createdAt: string; // ISO timestamp
}

export interface HospitalRecord {
  id: string;
  hospitalCode: string;
  name: string;
  address: string;
  contactNumber: string;
  resources: ResourceRecord[];
  testTypes: TestRecord[];
  doctors: DoctorRecord[];
  emergencyAlerts: EmergencyAlert[];
}

/** Common specialties for the "Issue a new Doctor ID" dropdown */
export const DOCTOR_SPECIALTIES = [
  "General Physician",
  "Cardiologist",
  "Orthopedic Surgeon",
  "Pediatrician",
  "Dermatologist",
  "Neurologist",
  "Gynecologist",
  "ENT Specialist",
  "Psychiatrist",
  "Radiologist",
  "General Surgeon",
  "Other",
] as const;

// ---------------------------------------------------------------------
// Password hashing (Node's built-in crypto — no extra dependency)
// ---------------------------------------------------------------------

const KEY_LEN = 64;

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, KEY_LEN).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, derivedHex] = stored.split(":");
  if (!salt || !derivedHex) return false;
  const derived = scryptSync(password, salt, KEY_LEN);
  const storedBuf = Buffer.from(derivedHex, "hex");
  if (derived.length !== storedBuf.length) return false;
  return timingSafeEqual(derived, storedBuf);
}

function generateTempPassword(): string {
  return randomBytes(4).toString("hex"); // 8 characters, e.g. "a3f9c1e2"
}

// ---------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------

interface StoredHospital extends HospitalRecord {
  passwordHash: string;
}

interface StoredDoctorAuth {
  hospitalId: string;
  doctorId: string;
  doctorCode: string;
  passwordHash: string;
}

interface Store {
  hospitals: StoredHospital[];
  doctorAuth: StoredDoctorAuth[];
}

const globalForStore = globalThis as unknown as { __medconnectStore?: Store };

const store: Store =
  globalForStore.__medconnectStore ??
  (globalForStore.__medconnectStore = { hospitals: [], doctorAuth: [] });

function makeId(prefix: string) {
  // crypto.randomUUID() — a collision here is practically impossible,
  // which is what fixes the old "two children with the same key" bug.
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 20)}`;
}

function makeHospitalCode() {
  return `MC-HOS-${Math.floor(1000 + Math.random() * 9000)}`;
}

function makeDoctorCode() {
  return `MC-DOC-${Math.floor(1000 + Math.random() * 9000)}`;
}

function toPublic(h: StoredHospital): HospitalRecord {
  const { passwordHash: _passwordHash, ...rest } = h;
  return rest;
}

const STATUS_CYCLE: StatusValue[] = ["available", "occupied", "maintenance"];

// ---- Hospitals ----

export function listHospitals(): HospitalRecord[] {
  return store.hospitals.map(toPublic);
}

export function registerHospital(input: {
  name: string;
  address: string;
  contactNumber: string;
  password: string;
}): HospitalRecord {
  const hospital: StoredHospital = {
    id: makeId("h"),
    hospitalCode: makeHospitalCode(),
    name: input.name,
    address: input.address,
    contactNumber: input.contactNumber,
    resources: [],
    testTypes: [],
    doctors: [],
    emergencyAlerts: [],
    passwordHash: hashPassword(input.password),
  };
  store.hospitals.push(hospital);
  return toPublic(hospital);
}

export function loginHospital(
  hospitalCode: string,
  password: string
): { ok: true; hospital: HospitalRecord } | { ok: false; error: string } {
  const hospital = store.hospitals.find(
    (h) => h.hospitalCode.toLowerCase() === hospitalCode.trim().toLowerCase()
  );
  if (!hospital) return { ok: false, error: "No hospital found with that ID." };
  if (!verifyPassword(password, hospital.passwordHash)) {
    return { ok: false, error: "Incorrect password." };
  }
  return { ok: true, hospital: toPublic(hospital) };
}

// ---- Resources ----

export function addResource(
  hospitalId: string,
  input: { name: string; category: string; quantity: number }
): ResourceRecord | undefined {
  const hospital = store.hospitals.find((h) => h.id === hospitalId);
  if (!hospital) return undefined;
  const resource: ResourceRecord = {
    id: makeId("r"),
    name: input.name,
    category: input.category,
    quantity: input.quantity,
    status: "available",
  };
  hospital.resources.push(resource);
  return resource;
}

export function cycleResourceStatus(
  hospitalId: string,
  resourceId: string
): ResourceRecord | undefined {
  const hospital = store.hospitals.find((h) => h.id === hospitalId);
  const resource = hospital?.resources.find((r) => r.id === resourceId);
  if (!resource) return undefined;
  const idx = STATUS_CYCLE.indexOf(resource.status);
  resource.status = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
  return resource;
}

// ---- Test types ----

export function addTest(hospitalId: string, name: string): TestRecord | undefined {
  const hospital = store.hospitals.find((h) => h.id === hospitalId);
  if (!hospital) return undefined;
  const test: TestRecord = { id: makeId("t"), name, status: "available" };
  hospital.testTypes.push(test);
  return test;
}

export function cycleTestStatus(
  hospitalId: string,
  testId: string
): TestRecord | undefined {
  const hospital = store.hospitals.find((h) => h.id === hospitalId);
  const test = hospital?.testTypes.find((t) => t.id === testId);
  if (!test) return undefined;
  const idx = STATUS_CYCLE.indexOf(test.status);
  test.status = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
  return test;
}

// ---- Doctors ----

export function addDoctor(
  hospitalId: string,
  input: { name: string; specialty: string }
): { doctor: DoctorRecord; tempPassword: string } | undefined {
  const hospital = store.hospitals.find((h) => h.id === hospitalId);
  if (!hospital) return undefined;

  const doctor: DoctorRecord = {
    id: makeId("doc"),
    name: input.name,
    specialty: input.specialty,
    doctorCode: makeDoctorCode(),
  };
  hospital.doctors.push(doctor);

  const tempPassword = generateTempPassword();
  store.doctorAuth.push({
    hospitalId,
    doctorId: doctor.id,
    doctorCode: doctor.doctorCode,
    passwordHash: hashPassword(tempPassword),
  });

  return { doctor, tempPassword };
}

export function loginDoctor(
  doctorCode: string,
  password: string
): { ok: true; doctor: DoctorRecord } | { ok: false; error: string } {
  const auth = store.doctorAuth.find(
    (d) => d.doctorCode.toLowerCase() === doctorCode.trim().toLowerCase()
  );
  if (!auth) return { ok: false, error: "No doctor found with that ID." };
  if (!verifyPassword(password, auth.passwordHash)) {
    return { ok: false, error: "Incorrect password." };
  }
  const hospital = store.hospitals.find((h) => h.id === auth.hospitalId);
  const doctor = hospital?.doctors.find((d) => d.id === auth.doctorId);
  if (!doctor) return { ok: false, error: "Doctor record not found." };
  return { ok: true, doctor };
}

// ---- Emergency alerts (SOS) ----

export function createEmergencyAlert(
  hospitalId: string,
  input: { message: string; location?: string; contactNumber?: string }
): EmergencyAlert | undefined {
  const hospital = store.hospitals.find((h) => h.id === hospitalId);
  if (!hospital) return undefined;

  const alert: EmergencyAlert = {
    id: makeId("alert"),
    message: input.message,
    location: input.location,
    contactNumber: input.contactNumber,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  // Newest first, so it always shows at the top of the dashboard list
  hospital.emergencyAlerts.unshift(alert);
  return alert;
}

export function respondToEmergencyAlert(
  hospitalId: string,
  alertId: string,
  status: "accepted" | "declined"
): EmergencyAlert | undefined {
  const hospital = store.hospitals.find((h) => h.id === hospitalId);
  const alert = hospital?.emergencyAlerts.find((a) => a.id === alertId);
  if (!alert) return undefined;
  alert.status = status;
  return alert;
}