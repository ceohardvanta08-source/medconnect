/**
 * MedConnect — Shared Type Definitions
 * Central place for every domain type used across the platform.
 * These mirror the entities described in the platform blueprint:
 * Patient, Doctor, Hospital, Appointment, Prescription, HealthRecord,
 * EmergencyAlert.
 */

export type UserRole = "patient" | "doctor" | "hospital" | "admin";

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Patient extends BaseUser {
  role: "patient";
  universalHealthId: string;
  bloodGroup?: string;
  allergies?: string[];
  dateOfBirth?: string;
}

export interface Doctor extends BaseUser {
  role: "doctor";
  specialty: string;
  hospitalId: string;
  consultationFee: number;
  rating: number;
  verified: boolean;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  bedsAvailable: BedAvailability;
  contactNumber: string;
}

export interface BedAvailability {
  icu: number;
  oxygen: number;
  general: number;
  ventilators: number;
}

export type AppointmentStatus = "upcoming" | "completed" | "cancelled";

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  hospitalId: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  reason?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  issuedOn: string;
  medicines: {
    name: string;
    dosage: string;
    frequency: string;
  }[];
  notes?: string;
}

export interface HealthRecord {
  id: string;
  patientId: string;
  title: string;
  type: "lab-report" | "prescription" | "scan" | "note";
  date: string;
  fileUrl?: string;
}

export type EmergencyAlertStatus = "pending" | "acknowledged" | "resolved";

export interface EmergencyAlert {
  id: string;
  patientId: string;
  hospitalId: string;
  status: EmergencyAlertStatus;
  raisedAt: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

/** Generic dashboard stat card used across patient & doctor dashboards. */
export interface StatItem {
  label: string;
  value: string;
  sub: string;
}

/** Generic row item for dashboard activity lists. */
export interface RowItem {
  icon: string;
  title: string;
  sub: string;
}

/** Card content for the services grid on the homepage. */
export interface ServiceCard {
  icon: string;
  title: string;
  desc: string;
}

/* ────────────────────────────────────────────────────────────────
   Hospital system — hospital registration, machines/equipment,
   test types, and doctor accounts issued by a hospital.
   ──────────────────────────────────────────────────────────────── */

/** A single machine or piece of equipment a hospital tracks. */
export interface HospitalResource {
  id: string;
  name: string;
  /** e.g. "Diagnostic", "ICU", "Surgical", "Life Support" */
  category: string;
  /** How many units the hospital has of this resource. */
  quantity: number;
  /** Whether this resource is currently operational / in service. */
  active: boolean;
}

/** A diagnostic or lab test type a hospital offers. */
export interface HospitalTestType {
  id: string;
  name: string;
  /** Whether this test is currently being offered. */
  active: boolean;
}

/** A doctor account issued by a specific hospital. */
export interface DoctorRecord {
  id: string;
  /** The unique login code the doctor uses — issued by the hospital. */
  doctorCode: string;
  name: string;
  specialty: string;
  hospitalId: string;
}

/** A registered hospital, including everything it manages. */
export interface HospitalRecord {
  id: string;
  /** The unique login code the hospital uses to sign in. */
  hospitalCode: string;
  name: string;
  address: string;
  contactNumber: string;
  resources: HospitalResource[];
  testTypes: HospitalTestType[];
  doctors: DoctorRecord[];
  registeredAt: string;
}
