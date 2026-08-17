/**
 * MedConnect — Client-side session helpers (Phase 1.5)
 *
 * Stores "who is currently logged in" in the browser's localStorage so a
 * hospital or doctor stays logged in across page refreshes within this
 * demo. This is NOT secure authentication — there's no password check,
 * no server session, no token expiry. Phase 2 replaces this entirely
 * with NextAuth.js + real sessions once a database is wired up.
 */

const HOSPITAL_SESSION_KEY = "medconnect_hospital_id";
const DOCTOR_SESSION_KEY = "medconnect_doctor_code";

export function saveHospitalSession(hospitalId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HOSPITAL_SESSION_KEY, hospitalId);
}

export function getHospitalSession(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(HOSPITAL_SESSION_KEY);
}

export function clearHospitalSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(HOSPITAL_SESSION_KEY);
}

export function saveDoctorSession(doctorCode: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DOCTOR_SESSION_KEY, doctorCode);
}

export function getDoctorSession(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(DOCTOR_SESSION_KEY);
}

export function clearDoctorSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DOCTOR_SESSION_KEY);
}
