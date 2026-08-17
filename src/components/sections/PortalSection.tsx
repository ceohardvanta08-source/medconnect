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

type PortalRole = "patient" | "doctor";

export default function PortalSection() {
  const [activeTab, setActiveTab] = useState<PortalRole>("patient");

  const rows = activeTab === "patient" ? PATIENT_ROWS : DOCTOR_ROWS;
  const stats = activeTab === "patient" ? PATIENT_STATS : DOCTOR_STATS;
  const portalHref =
    activeTab === "patient" ? "/patient/dashboard" : "/doctor/dashboard";

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
            need to manage appointments and patient information. This demo
            shows the direction for the real portal.
          </p>

          {/* Tabs */}
          <div className="mc-portal__toggle" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "patient"}
              className={`mc-portal__tab ${
                activeTab === "patient"
                  ? "mc-portal__tab--active"
                  : "mc-portal__tab--inactive"
              }`}
              onClick={() => setActiveTab("patient")}
            >
              Patient
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "doctor"}
              className={`mc-portal__tab ${
                activeTab === "doctor"
                  ? "mc-portal__tab--active"
                  : "mc-portal__tab--inactive"
              }`}
              onClick={() => setActiveTab("doctor")}
            >
              Doctor
            </button>
          </div>

          <Link href={portalHref} className="mc-btn mc-btn--primary">
            Open demo portal <ArrowRightIcon />
          </Link>
        </div>

        {/* RIGHT — Dashboard mock */}
        <div className="mc-dash">
          {/* Top bar */}
          <div className="mc-dash__topbar">
            <div>
              <div className="mc-dash__breadcrumb">
                MedConnect / {activeTab === "patient" ? "Patient" : "Doctor"}{" "}
                Portal
              </div>
              <div className="mc-dash__greeting">
                Good morning, {activeTab === "patient" ? "Patient" : "Doctor"}
              </div>
            </div>
            <div className="mc-dash__avatar">
              {activeTab === "patient" ? "P" : "D"}
            </div>
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

          {/* Row items */}
          <div className="mc-dash__rows">
            {rows.map((row) => (
              <div key={row.title} className="mc-dash__row">
                <div className="mc-dash__row-icon" aria-hidden="true">
                  {row.icon}
                </div>
                <div>
                  <div className="mc-dash__row-title">{row.title}</div>
                  <div className="mc-dash__row-sub">{row.sub}</div>
                </div>
                <span className="mc-dash__row-arrow">→</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
