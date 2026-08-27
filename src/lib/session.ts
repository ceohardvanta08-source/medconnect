// lib/session.ts
// Browser-only helpers. Kept separate from lib/data.ts on purpose: this file
// runs in the browser (localStorage), while data.ts runs on the server
// (Node's crypto) — mixing them into one file can break the client bundle.

const HOSPITAL_KEY = "medconnect_hospital_id";
const DOCTOR_KEY = "medconnect_doctor_code";
const PATIENT_KEY = "medconnect_patient_email";

function isBrowser() {
  return typeof window !== "undefined";
}

export function saveHospitalSession(hospitalId: string) {
  if (isBrowser()) window.localStorage.setItem(HOSPITAL_KEY, hospitalId);
}
export function getHospitalSession(): string | null {
  return isBrowser() ? window.localStorage.getItem(HOSPITAL_KEY) : null;
}
export function clearHospitalSession() {
  if (isBrowser()) window.localStorage.removeItem(HOSPITAL_KEY);
}

export function saveDoctorSession(doctorCode: string) {
  if (isBrowser()) window.localStorage.setItem(DOCTOR_KEY, doctorCode);
}
export function getDoctorSession(): string | null {
  return isBrowser() ? window.localStorage.getItem(DOCTOR_KEY) : null;
}
export function clearDoctorSession() {
  if (isBrowser()) window.localStorage.removeItem(DOCTOR_KEY);
}

export function savePatientSession(email: string) {
  if (isBrowser()) window.localStorage.setItem(PATIENT_KEY, email);
}
export function getPatientSession(): string | null {
  return isBrowser() ? window.localStorage.getItem(PATIENT_KEY) : null;
}
export function clearPatientSession() {
  if (isBrowser()) window.localStorage.removeItem(PATIENT_KEY);
}