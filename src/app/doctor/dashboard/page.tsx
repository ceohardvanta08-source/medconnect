"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { clearDoctorSession, getDoctorSession } from "@/lib/session";
import type { DoctorRecord, HospitalRecord, StatItem } from "@/types";

const STATS: StatItem[] = [
  { label: "Patients today", value: "8", sub: "3 checked in" },
  { label: "Pending lab reports", value: "3", sub: "awaiting review" },
  { label: "Outgoing referrals", value: "1", sub: "in progress" },
];

const QUEUE = [
  { id: "q1", name: "Rohit Verma", time: "10:30 AM", reason: "Follow-up consultation" },
  { id: "q2", name: "Ayesha Khan", time: "11:00 AM", reason: "Chest pain — new patient" },
  { id: "q3", name: "Suresh Patil", time: "11:30 AM", reason: "Prescription renewal" },
];

export default function DoctorDashboardPage() {
  const [doctor, setDoctor] = useState<DoctorRecord | null>(null);
  const [hospital, setHospital] = useState<HospitalRecord | null>(null);

  useEffect(() => {
    const savedCode = getDoctorSession();
    if (!savedCode) return; // no session — page still shows a generic demo view below

    fetch("/api/doctors/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorCode: savedCode }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.doctor) setDoctor(data.doctor);
        if (data.hospital) setHospital(data.hospital);
      })
      .catch(() => {
        // Silently fall back to the generic demo view if the lookup fails.
      });
  }, []);

  function handleLogout() {
    clearDoctorSession();
    setDoctor(null);
    setHospital(null);
  }

  const displayName = doctor ? doctor.name : "Doctor";
  const displaySpecialty = doctor ? doctor.specialty : "General Physician";
  const hospitalName = hospital ? hospital.name : null;

  return (
    <>
      <Navbar />
      <main className="mc-page">
        <div className="mc-page__head">
          <div>
            <p className="mc-page__breadcrumb">MedConnect / Doctor Portal</p>
            <h1 className="mc-page__title">Good morning, {displayName}</h1>
            <p className="mc-page__subtitle">
              {displaySpecialty}
              {hospitalName ? ` · ${hospitalName}` : ""} · Verified
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Link href="/doctor/patients" className="mc-btn mc-btn--primary">
              View all patients
            </Link>
            {doctor && (
              <button
                type="button"
                className="mc-btn mc-btn--outline"
                onClick={handleLogout}
              >
                Log out
              </button>
            )}
          </div>
        </div>

        <div className="mc-grid-3">
          {STATS.map((stat) => (
            <div key={stat.label} className="mc-card">
              <p className="mc-card__title">{stat.label}</p>
              <p className="mc-card__num">{stat.value}</p>
              <p className="mc-card__sub">{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="mc-mt-32">
          <h2 className="mc-h3" style={{ marginBottom: "16px" }}>
            Today&apos;s queue
          </h2>
          <div className="mc-card" style={{ padding: 0, overflow: "hidden" }}>
            <table className="mc-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {QUEUE.map((patient) => (
                  <tr key={patient.id}>
                    <td>{patient.name}</td>
                    <td>{patient.time}</td>
                    <td>{patient.reason}</td>
                    <td>
                      <span className="mc-badge mc-badge--pending">Waiting</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
