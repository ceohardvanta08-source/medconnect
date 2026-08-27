"use client";

import { useEffect, useState, type FormEvent } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { HospitalRecord } from "@/lib/data";

// Soft access gate — not bank-grade security (this check runs in the
// browser, so a determined person could read it in devtools), but it keeps
// this page from being wide open to anyone who guesses the URL. Set your
// own password in .env.local as NEXT_PUBLIC_ADMIN_PASSWORD; if unset, it
// falls back to "medconnect-admin". The real privacy comes from keeping
// this file out of Git entirely — see the .gitignore step in the chat.
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "medconnect-admin";
const SESSION_KEY = "medconnect_admin_unlocked";

function AdminGate({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password === ADMIN_PASSWORD) {
      window.sessionStorage.setItem(SESSION_KEY, "1");
      onUnlock();
    } else {
      setError(true);
    }
  }

  return (
    <>
      <Navbar />
      <main className="mc-auth">
        <div className="mc-auth__card">
          <h1 className="mc-auth__title">Admin access</h1>
          <p className="mc-auth__subtitle">This area is restricted. Enter the admin password to continue.</p>
          {error && <div className="mc-auth__error">Incorrect password.</div>}
          <form onSubmit={handleSubmit} noValidate>
            <div className="mc-auth__field">
              <label className="mc-auth__label" htmlFor="adminPassword">Password</label>
              <input
                id="adminPassword"
                type="password"
                className="mc-auth__input"
                value={password}
                onChange={(event) => { setPassword(event.target.value); setError(false); }}
                autoFocus
              />
            </div>
            <button type="submit" className="mc-btn mc-btn--primary mc-btn--full">Unlock</button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [checkedSession, setCheckedSession] = useState(false);
  const [hospitals, setHospitals] = useState<HospitalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (window.sessionStorage.getItem(SESSION_KEY) === "1") setUnlocked(true);
    setCheckedSession(true);
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    fetch("/api/hospitals")
      .then((response) => response.json())
      .then((data) => setHospitals(data.hospitals ?? []))
      .finally(() => setLoading(false));
  }, [unlocked]);

  if (!checkedSession) return null;

  if (!unlocked) {
    return <AdminGate onUnlock={() => setUnlocked(true)} />;
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="mc-page">
          <p className="mc-body">Loading admin overview...</p>
        </main>
        <Footer />
      </>
    );
  }

  const totalResources = hospitals.reduce((sum, h) => sum + h.resources.length, 0);
  const totalTests = hospitals.reduce((sum, h) => sum + h.testTypes.length, 0);
  const totalDoctors = hospitals.reduce((sum, h) => sum + h.doctors.length, 0);
  const allAlerts = hospitals.flatMap((h) =>
    h.emergencyAlerts.map((a) => ({ ...a, hospitalName: h.name, hospitalId: h.id }))
  );
  const pendingAlerts = allAlerts.filter((a) => a.status === "pending");

  return (
    <>
      <Navbar />
      <main className="mc-page">
        <div className="mc-page__head">
          <div>
            <p className="mc-page__breadcrumb">MedConnect / Admin</p>
            <h1 className="mc-page__title">Admin overview</h1>
            <p className="mc-page__subtitle">
              A read-only summary of every hospital registered on MedConnect.
            </p>
          </div>
        </div>

        {/* Platform-wide stats */}
        <div className="mc-grid-3">
          <div className="mc-card">
            <p className="mc-card__title">Hospitals</p>
            <p className="mc-card__num">{hospitals.length}</p>
            <p className="mc-card__sub">Registered on the platform</p>
          </div>
          <div className="mc-card">
            <p className="mc-card__title">Resources &amp; test types</p>
            <p className="mc-card__num">{totalResources + totalTests}</p>
            <p className="mc-card__sub">
              {totalResources} resources · {totalTests} test types
            </p>
          </div>
          <div className="mc-card">
            <p className="mc-card__title">Doctors issued</p>
            <p className="mc-card__num">{totalDoctors}</p>
            <p className="mc-card__sub">Across all hospitals</p>
          </div>
        </div>

        {/* Emergency alerts across the whole platform */}
        <div className="mc-mt-32">
          <h2 className="mc-h3" style={{ marginBottom: "16px" }}>
            Emergency alerts {pendingAlerts.length > 0 && `(${pendingAlerts.length} pending)`}
          </h2>
          <div className="mc-card">
            {allAlerts.length === 0 && (
              <p className="mc-card__sub">No emergency alerts have been sent yet.</p>
            )}
            <div className="mc-list">
              {allAlerts.map((alert) => (
                <div key={alert.id} className="mc-list-item">
                  <div className="mc-list-item__icon" aria-hidden="true">
                    {alert.status === "pending"
                      ? "🚨"
                      : alert.status === "accepted"
                      ? "✅"
                      : "❌"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="mc-list-item__title">{alert.message}</div>
                    <div className="mc-list-item__sub">
                      {alert.hospitalName} · {new Date(alert.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <span
                    className={`mc-badge ${
                      alert.status === "pending"
                        ? "mc-badge--danger"
                        : alert.status === "accepted"
                        ? "mc-badge--success"
                        : "mc-badge--danger"
                    }`}
                  >
                    {alert.status === "pending"
                      ? "Pending"
                      : alert.status === "accepted"
                      ? "Accepted"
                      : "Declined"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Every hospital, at a glance */}
        <div className="mc-mt-32">
          <h2 className="mc-h3" style={{ marginBottom: "16px" }}>
            All hospitals
          </h2>
          {hospitals.length === 0 && (
            <div className="mc-card">
              <p className="mc-card__sub">No hospitals have registered yet.</p>
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {hospitals.map((hospital) => (
              <div
                key={hospital.id}
                className="mc-card"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <p style={{ fontWeight: 700 }}>{hospital.name}</p>
                  <p className="mc-card__sub">
                    {hospital.hospitalCode} · {hospital.address}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "18px", fontSize: "13px" }}>
                  <span>{hospital.resources.length} resources</span>
                  <span>{hospital.testTypes.length} tests</span>
                  <span>{hospital.doctors.length} doctors</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}