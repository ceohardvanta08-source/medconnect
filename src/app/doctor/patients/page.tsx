"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface PatientRow {
  id: string;
  name: string;
  healthId: string;
  lastVisit: string;
  condition: string;
  status: "stable" | "review" | "critical";
}

const PATIENTS: PatientRow[] = [
  { id: "p1", name: "Rohit Verma", healthId: "MC-2026-104829", lastVisit: "04 Aug 2026", condition: "Hypertension", status: "stable" },
  { id: "p2", name: "Ayesha Khan", healthId: "MC-2026-118342", lastVisit: "22 Jul 2026", condition: "Chest pain — evaluation", status: "review" },
  { id: "p3", name: "Suresh Patil", healthId: "MC-2026-100211", lastVisit: "15 Jul 2026", condition: "Diabetes Type 2", status: "stable" },
  { id: "p4", name: "Priya Nair", healthId: "MC-2026-109987", lastVisit: "02 Jul 2026", condition: "Post-op recovery", status: "critical" },
];

const STATUS_LABEL: Record<PatientRow["status"], string> = {
  stable: "Stable",
  review: "Needs review",
  critical: "Critical",
};

const STATUS_CLASS: Record<PatientRow["status"], string> = {
  stable: "mc-badge--success",
  review: "mc-badge--pending",
  critical: "mc-badge--danger",
};

export default function DoctorPatientsPage() {
  const [query, setQuery] = useState("");

  const filteredPatients = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return PATIENTS;
    return PATIENTS.filter(
      (patient) =>
        patient.name.toLowerCase().includes(search) ||
        patient.healthId.toLowerCase().includes(search) ||
        patient.condition.toLowerCase().includes(search)
    );
  }, [query]);

  return (
    <>
      <Navbar />
      <main className="mc-page">
        <div className="mc-page__head">
          <div>
            <p className="mc-page__breadcrumb">MedConnect / Doctor Portal</p>
            <h1 className="mc-page__title">Patients</h1>
            <p className="mc-page__subtitle">
              {filteredPatients.length} of {PATIENTS.length} patients
            </p>
          </div>
          <input
            type="search"
            className="mc-auth__input"
            style={{ maxWidth: "280px" }}
            placeholder="Search by name, ID or condition..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search patients"
          />
        </div>

        <div className="mc-card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="mc-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Health ID</th>
                <th>Last visit</th>
                <th>Condition</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id}>
                  <td style={{ fontWeight: 600, color: "var(--text-head)" }}>
                    {patient.name}
                  </td>
                  <td>{patient.healthId}</td>
                  <td>{patient.lastVisit}</td>
                  <td>{patient.condition}</td>
                  <td>
                    <span className={`mc-badge ${STATUS_CLASS[patient.status]}`}>
                      {STATUS_LABEL[patient.status]}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)" }}>
                    No patients match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </>
  );
}
