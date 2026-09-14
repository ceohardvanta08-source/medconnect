"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import type { RowItem, StatItem } from "@/types";

const PATIENT_ROWS: RowItem[] = [
  { icon: "📅", title: "Upcoming consultation", sub: "Today · 10:30 AM" },
  { icon: "📋", title: "Recent health record", sub: "Blood test · 14 Aug" },
  { icon: "🚨", title: "Emergency centre", sub: "Available 24/7" },
];

const DOCTOR_ROWS: RowItem[] = [
  { icon: "👥", title: "Patient queue", sub: "8 patients today" },
  { icon: "🔬", title: "Lab results pending", sub: "3 awaiting review" },
  { icon: "📝", title: "E-Prescriptions", sub: "Write prescription" },
];

const HOSPITAL_ROWS: RowItem[] = [
  { icon: "🏥", title: "Ward occupancy", sub: "87% capacity" },
  { icon: "📊", title: "Daily admissions", sub: "24 today" },
  { icon: "🔧", title: "Equipment status", sub: "All systems active" },
];

const PATIENT_STATS: StatItem[] = [
  { label: "Upcoming", value: "2", sub: "appointments" },
  { label: "Reports", value: "12", sub: "available" },
  { label: "Care plan", value: "3", sub: "active items" },
];

const DOCTOR_STATS: StatItem[] = [
  { label: "Today", value: "8", sub: "patients" },
  { label: "Pending", value: "3", sub: "lab reports" },
  { label: "Referrals", value: "1", sub: "outgoing" },
];

const HOSPITAL_STATS: StatItem[] = [
  { label: "Admitted", value: "142", sub: "patients" },
  { label: "Doctors", value: "38", sub: "on duty" },
  { label: "Alerts", value: "0", sub: "critical" },
];

type PortalRole = "patient" | "doctor" | "hospital";

const PORTAL_LINKS: Record<PortalRole, string> = {
  patient: "/patient/dashboard",
  doctor: "/doctor/dashboard",
  hospital: "/hospital/dashboard",
};

const BREADCRUMB_LABEL: Record<PortalRole, string> = {
  patient: "Patient Portal",
  doctor: "Doctor Portal",
  hospital: "Hospital Portal",
};

const GREETING_NAME: Record<PortalRole, string> = {
  patient: "Patient",
  doctor: "Doctor",
  hospital: "Admin",
};

const AVATAR_LABEL: Record<PortalRole, string> = {
  patient: "P",
  doctor: "D",
  hospital: "H",
};

const ROW_LINKS: Record<PortalRole, Record<string, string>> = {
  patient: {
    "Upcoming consultation": "/patient/appointments",
    "Recent health record": "/patient/records",
    "Emergency centre": "/emergency",
  },
  doctor: {
    "Patient queue": "/doctor/patients",
    "Lab results pending": "/doctor/lab-results",
    "E-Prescriptions": "/doctor/prescriptions",
  },
  hospital: {
    "Ward occupancy": "/hospital/wards",
    "Daily admissions": "/hospital/admissions",
    "Equipment status": "/hospital/equipment",
  },
};

export default function PortalSection() {
  const [activeTab, setActiveTab] = useState<PortalRole>("patient");

  const rows =
    activeTab === "patient"
      ? PATIENT_ROWS
      : activeTab === "doctor"
      ? DOCTOR_ROWS
      : HOSPITAL_ROWS;

  const stats =
    activeTab === "patient"
      ? PATIENT_STATS
      : activeTab === "doctor"
      ? DOCTOR_STATS
      : HOSPITAL_STATS;

  return (
    <section id="portal" className="mc-portal-section">
      <div className="mc-portal">
        {/* LEFT */}
        <div>
          <p className="mc-eyebrow">Role-Based Portal</p>
          <h2 className="mc-h2">
            One platform.
            <br />
            <span className="mc-accent">Two experiences.</span>
          </h2>

          <p className="mc-body mc-portal__desc">
            Patients get a simple care dashboard. Doctors get the tools they
            need to manage appointments and patient information.
          </p>

          {/* Tabs */}
          <div className="mc-portal__toggle" role="tablist">
            {(["patient", "doctor", "hospital"] as PortalRole[]).map((role) => (
              <button
                key={role}
                type="button"
                role="tab"
                aria-selected={activeTab === role}
                className={`mc-portal__tab ${
                  activeTab === role
                    ? "mc-portal__tab--active"
                    : "mc-portal__tab--inactive"
                }`}
                onClick={() => setActiveTab(role)}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>

          <Link href={PORTAL_LINKS[activeTab]} className="mc-btn mc-btn--primary">
            Open portal <ArrowRightIcon />
          </Link>
        </div>

        {/* RIGHT — Live Dashboard */}
        <div className="mc-dash">
          {/* Top bar */}
          <div className="mc-dash__topbar">
            <div>
              <div className="mc-dash__breadcrumb">
                MedConnect / {BREADCRUMB_LABEL[activeTab]}
              </div>
              <div className="mc-dash__greeting">
                Good morning, {GREETING_NAME[activeTab]}
              </div>
            </div>
            <div className="mc-dash__avatar">{AVATAR_LABEL[activeTab]}</div>
          </div>

          {/* Stats */}
          <div className="mc-dash__stats">
            {stats.map((stat) => (
              <div key={stat.label} className="mc-dash__stat">
                <div className="mc-dash__stat-lbl">{stat.label}</div>
                <div className="mc-dash__stat-num">{stat.value}</div>
                <div className="mc-dash__stat-sub">{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Row items — all linked to live routes */}
          <div className="mc-dash__rows">
            {rows.map((row) => {
              const href =
                ROW_LINKS[activeTab][row.title] ?? PORTAL_LINKS[activeTab];
              return (
                <Link
                  key={row.title}
                  href={href}
                  className="mc-dash__row mc-dash__row--link"
                >
                  <div className="mc-dash__row-icon" aria-hidden="true">
                    {row.icon}
                  </div>
                  <div>
                    <div className="mc-dash__row-title">{row.title}</div>
                    <div className="mc-dash__row-sub">{row.sub}</div>
                  </div>
                  <span className="mc-dash__row-arrow">→</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .mc-dash__row--link {
          display: flex;
          align-items: center;
          text-decoration: none;
          color: inherit;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .mc-dash__row--link:hover {
          background: rgba(0, 0, 0, 0.03);
          border-radius: 8px;
        }

        .mc-dash__row--link:focus-visible {
          outline: 2px solid currentColor;
          outline-offset: 2px;
          border-radius: 8px;
        }
      `}</style>
    </section>
  );
}