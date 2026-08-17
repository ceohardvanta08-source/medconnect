import type { DoctorRecord, HospitalRecord, HospitalResource, HospitalTestType } from "@/types";

/**
 * MedConnect — Hospital Data Store (Phase 1.5, in-memory)
 *
 * This holds hospital, resource, test, and doctor data in server memory
 * for as long as the Next.js dev/production server process stays running.
 * It is NOT a database — data resets whenever the server restarts.
 *
 * Phase 2 replaces this file's contents with real Prisma/database calls,
 * without needing to change any of the API route files that import it —
 * that's the whole point of isolating storage logic here.
 */

// `globalThis` is used so the store survives Next.js's hot-reload in dev
// mode, which would otherwise re-run this module and wipe the data on
// every file save.
const globalForStore = globalThis as unknown as {
  __medconnectHospitals?: HospitalRecord[];
};

if (!globalForStore.__medconnectHospitals) {
  globalForStore.__medconnectHospitals = [];
}

const hospitals: HospitalRecord[] = globalForStore.__medconnectHospitals;

/** Generate a short, human-typeable ID, e.g. "MC-HOS-4821". */
function generateCode(prefix: string): string {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `MC-${prefix}-${random}`;
}

export function listHospitals(): HospitalRecord[] {
  return hospitals;
}

export function findHospitalById(id: string): HospitalRecord | undefined {
  return hospitals.find((hospital) => hospital.id === id);
}

export function findHospitalByCode(hospitalCode: string): HospitalRecord | undefined {
  return hospitals.find(
    (hospital) => hospital.hospitalCode.toLowerCase() === hospitalCode.toLowerCase()
  );
}

export function registerHospital(input: {
  name: string;
  address: string;
  contactNumber: string;
}): HospitalRecord {
  const hospital: HospitalRecord = {
    id: `h_${Date.now()}`,
    hospitalCode: generateCode("HOS"),
    name: input.name,
    address: input.address,
    contactNumber: input.contactNumber,
    resources: [],
    testTypes: [],
    doctors: [],
    registeredAt: new Date().toISOString(),
  };
  hospitals.push(hospital);
  return hospital;
}

export function addResource(
  hospitalId: string,
  input: { name: string; category: string; quantity: number }
): HospitalResource | null {
  const hospital = findHospitalById(hospitalId);
  if (!hospital) return null;

  const resource: HospitalResource = {
    id: `r_${Date.now()}`,
    name: input.name,
    category: input.category,
    quantity: input.quantity,
    active: true,
  };
  hospital.resources.push(resource);
  return resource;
}

export function toggleResourceActive(
  hospitalId: string,
  resourceId: string
): HospitalResource | null {
  const hospital = findHospitalById(hospitalId);
  if (!hospital) return null;

  const resource = hospital.resources.find((r) => r.id === resourceId);
  if (!resource) return null;

  resource.active = !resource.active;
  return resource;
}

export function addTestType(
  hospitalId: string,
  input: { name: string }
): HospitalTestType | null {
  const hospital = findHospitalById(hospitalId);
  if (!hospital) return null;

  const test: HospitalTestType = {
    id: `t_${Date.now()}`,
    name: input.name,
    active: true,
  };
  hospital.testTypes.push(test);
  return test;
}

export function toggleTestActive(
  hospitalId: string,
  testId: string
): HospitalTestType | null {
  const hospital = findHospitalById(hospitalId);
  if (!hospital) return null;

  const test = hospital.testTypes.find((t) => t.id === testId);
  if (!test) return null;

  test.active = !test.active;
  return test;
}

export function addDoctor(
  hospitalId: string,
  input: { name: string; specialty: string }
): DoctorRecord | null {
  const hospital = findHospitalById(hospitalId);
  if (!hospital) return null;

  const doctor: DoctorRecord = {
    id: `d_${Date.now()}`,
    doctorCode: generateCode("DOC"),
    name: input.name,
    specialty: input.specialty,
    hospitalId,
  };
  hospital.doctors.push(doctor);
  return doctor;
}

export function findDoctorByCode(
  doctorCode: string
): { doctor: DoctorRecord; hospital: HospitalRecord } | null {
  for (const hospital of hospitals) {
    const doctor = hospital.doctors.find(
      (d) => d.doctorCode.toLowerCase() === doctorCode.toLowerCase()
    );
    if (doctor) return { doctor, hospital };
  }
  return null;
}
