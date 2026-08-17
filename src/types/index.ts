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
