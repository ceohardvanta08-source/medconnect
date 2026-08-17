import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { HealthRecord, StatItem } from "@/types";
import { formatShortDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Patient Dashboard — MedConnect",
  description: "Your health records, appointments and care plan in one place.",
};

const STATS: StatItem[] = [
  { label: "Upcoming appointments", value: "2", sub: "next: 18 Aug" },
  { label: "Health records", value: "12", sub: "reports available" },
  { label: "Active prescriptions", value: "3", sub: "care plan items" },
];

const RECORDS: HealthRecord[] = [
  { id: "r1", patientId: "p1", title: "Complete Blood Count (CBC)", type: "lab-report", date: "2026-08-04" },
  { id: "r2", patientId: "p1", title: "Chest X-Ray", type: "scan", date: "2026-07-22" },
  { id: "r3", patientId: "p1", title: "Amoxicillin — Dr. Rao", type: "prescription", date: "2026-07-15" },
];

export default function PatientDashboardPage() {
  return (
    <>
      <Navbar />
      <main className="mc-page">
        <div className="mc-page__head">
          <div>
            <p className="mc-page__breadcrumb">MedConnect / Patient Portal</p>
            <h1 className="mc-page__title">Good morning, Patient</h1>
            <p className="mc-page__subtitle">
              Universal Health ID:{" "}
              <strong style={{ color: "var(--text-head)" }}>MC-2026-104829</strong>
            </p>
          </div>
          <Link href="/patient/appointments" className="mc-btn mc-btn--primary">
            Book appointment
          </Link>
        </div>

        {/* Stat cards */}
        <div className="mc-grid-3">
          {STATS.map((stat) => (
            <div key={stat.label} className="mc-card">
              <p className="mc-card__title">{stat.label}</p>
              <p className="mc-card__num">{stat.value}</p>
              <p className="mc-card__sub">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Health records list */}
        <div className="mc-mt-32">
          <h2 className="mc-h3" style={{ marginBottom: "16px" }}>
            Recent health records
          </h2>
          <div className="mc-list">
            {RECORDS.map((record) => (
              <div key={record.id} className="mc-list-item">
                <div className="mc-list-item__icon" aria-hidden="true">
                  {record.type === "lab-report" && "🧪"}
                  {record.type === "scan" && "🩻"}
                  {record.type === "prescription" && "📝"}
                  {record.type === "note" && "📋"}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="mc-list-item__title">{record.title}</div>
                  <div className="mc-list-item__sub">
                    {formatShortDate(record.date)}
                  </div>
                </div>
                <span className="mc-badge mc-badge--success">Available</span>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
