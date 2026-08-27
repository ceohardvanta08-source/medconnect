"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { HospitalRecord, StatusValue } from "@/lib/data";

const STATUS_META: Record<StatusValue, { label: string; bg: string; fg: string }> = {
  available: { label: "Available", bg: "rgba(34,197,94,0.15)", fg: "#22c55e" },
  occupied: { label: "Occupied", bg: "rgba(249,115,22,0.15)", fg: "#f97316" },
  maintenance: { label: "Maintenance", bg: "rgba(148,163,184,0.18)", fg: "#94a3b8" },
};

function StatusPill({ status }: { status: StatusValue }) {
  const meta = STATUS_META[status];
  return (
    <span
      style={{
        borderRadius: "999px",
        padding: "3px 10px",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: ".03em",
        textTransform: "uppercase",
        background: meta.bg,
        color: meta.fg,
      }}
    >
      {meta.label}
    </span>
  );
}

/** Small live indicator dot + label, matching the one on the hospital dashboard */
function LiveIndicator({ lastSynced }: { lastSynced: Date | null }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <span
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "999px",
          background: "#22c55e",
          display: "inline-block",
          animation: "mc-live-pulse 1.8s ease-in-out infinite",
        }}
        aria-hidden="true"
      />
      <span
        style={{
          fontSize: "11px",
          fontWeight: 800,
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: "#16a34a",
        }}
      >
        Live
      </span>
      <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
        {lastSynced ? `Updated ${lastSynced.toLocaleTimeString()}` : "Syncing..."}
      </span>
    </div>
  );
}

export default function HospitalsDirectoryPage() {
  const [hospitals, setHospitals] = useState<HospitalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  // Emergency SOS form state — which hospital's form is open, and its fields
  const [sosHospitalId, setSosHospitalId] = useState<string | null>(null);
  const [sosMessage, setSosMessage] = useState("");
  const [sosLocation, setSosLocation] = useState("");
  const [sosContact, setSosContact] = useState("");
  const [sosSending, setSosSending] = useState(false);
  const [sosSentFor, setSosSentFor] = useState<string | null>(null);

  function loadHospitals() {
    fetch("/api/hospitals")
      .then((response) => response.json())
      .then((data) => {
        setHospitals(data.hospitals ?? []);
        setLastSynced(new Date());
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadHospitals();
  }, []);

  // Keep the public directory live too, so availability visitors see is
  // never more than a few seconds stale.
  useEffect(() => {
    const interval = setInterval(loadHospitals, 10000);
    return () => clearInterval(interval);
  }, []);

  function openSosForm(hospitalId: string) {
    setSosHospitalId(hospitalId);
    setSosMessage("");
    setSosLocation("");
    setSosContact("");
    setSosSentFor(null);
  }

  async function handleSendSos(hospitalId: string) {
    if (!sosMessage) return;
    setSosSending(true);
    try {
      const response = await fetch(`/api/hospitals/${hospitalId}/emergency`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: sosMessage,
          location: sosLocation || undefined,
          contactNumber: sosContact || undefined,
        }),
      });
      if (response.ok) {
        setSosSentFor(hospitalId);
        setSosHospitalId(null);
      }
    } finally {
      setSosSending(false);
    }
  }

  return (
    <>
      <style>{`
        @keyframes mc-live-pulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34,197,94,0.45); }
          50% { opacity: 0.6; box-shadow: 0 0 0 4px rgba(34,197,94,0); }
        }
      `}</style>
      <Navbar />
      <main className="mc-page">
        <div className="mc-page__head">
          <div>
            <p className="mc-page__breadcrumb">MedConnect / Hospitals</p>
            <h1 className="mc-page__title">Registered hospitals</h1>
            <p className="mc-page__subtitle">
              Live machine, equipment and bed availability across every
              hospital on MedConnect.
            </p>
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <LiveIndicator lastSynced={lastSynced} />
        </div>

        {loading && <p className="mc-body">Loading hospitals...</p>}

        {!loading && hospitals.length === 0 && (
          <div className="mc-card">
            <p className="mc-body">
              No hospitals have registered yet.{" "}
              <a href="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>
                Register a hospital
              </a>{" "}
              to be the first to appear here.
            </p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {hospitals.map((hospital) => {
            const availableResources = hospital.resources.filter(
              (r) => r.status === "available"
            );
            const availableTests = hospital.testTypes.filter(
              (t) => t.status === "available"
            );

            // Same live bed-capacity math as the hospital's own dashboard,
            // shown here as a public, read-only summary.
            const bedResources = hospital.resources.filter((r) => r.category === "Bed");
            const totalBedCapacity = bedResources.reduce((sum, r) => sum + r.quantity, 0);
            const occupiedBedCapacity = bedResources
              .filter((r) => r.status === "occupied")
              .reduce((sum, r) => sum + r.quantity, 0);
            const availableBedCapacity = bedResources
              .filter((r) => r.status === "available")
              .reduce((sum, r) => sum + r.quantity, 0);
            const occupancyPct =
              totalBedCapacity > 0
                ? Math.round((occupiedBedCapacity / totalBedCapacity) * 100)
                : 0;
            const occupancyColor =
              occupancyPct >= 90 ? "#ef4444" : occupancyPct >= 70 ? "#f97316" : "#22c55e";

            return (
              <div key={hospital.id} className="mc-card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <h2 className="mc-h3">{hospital.name}</h2>
                    <p className="mc-card__sub">
                      {hospital.address} · {hospital.contactNumber}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span className="mc-badge mc-badge--success">
                      {availableResources.length} resources available
                    </span>
                    <button
                      type="button"
                      onClick={() => openSosForm(hospital.id)}
                      style={{
                        border: "none",
                        cursor: "pointer",
                        borderRadius: "999px",
                        padding: "8px 16px",
                        fontSize: "13px",
                        fontWeight: 700,
                        background: "#ef4444",
                        color: "#fff",
                      }}
                    >
                      🚨 Send Emergency SOS
                    </button>
                  </div>
                </div>

                {/* Live bed capacity summary */}
                {totalBedCapacity > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "10px",
                      alignItems: "center",
                      marginBottom: "16px",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      background: "rgba(0,0,0,0.02)",
                    }}
                  >
                    <span style={{ fontSize: "13px", fontWeight: 700 }}>
                      🛏️ {occupiedBedCapacity} patients admitted
                    </span>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      · {availableBedCapacity} beds available of {totalBedCapacity}
                    </span>
                    <div
                      style={{
                        flex: "1 1 140px",
                        height: "8px",
                        borderRadius: "999px",
                        background: "rgba(0,0,0,0.06)",
                        overflow: "hidden",
                        minWidth: "100px",
                      }}
                    >
                      <div
                        style={{
                          width: `${occupancyPct}%`,
                          height: "100%",
                          background: occupancyColor,
                          transition: "width .5s ease",
                        }}
                      />
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: occupancyColor }}>
                      {occupancyPct}% full
                    </span>
                  </div>
                )}

                {sosSentFor === hospital.id && (
                  <div
                    style={{
                      background: "rgba(34,197,94,0.12)",
                      color: "#16a34a",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      marginBottom: "16px",
                    }}
                  >
                    Alert sent — this hospital has been notified and can accept
                    or decline it from their dashboard.
                  </div>
                )}

                {sosHospitalId === hospital.id && (
                  <div
                    style={{
                      border: "1px solid #ef4444",
                      borderRadius: "10px",
                      padding: "14px 16px",
                      marginBottom: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <div className="mc-auth__field" style={{ margin: 0 }}>
                      <label className="mc-auth__label" htmlFor={`sos-message-${hospital.id}`}>
                        What&apos;s the emergency?
                      </label>
                      <input
                        id={`sos-message-${hospital.id}`}
                        type="text"
                        className="mc-auth__input"
                        placeholder="e.g. Road accident, needs ICU bed"
                        value={sosMessage}
                        onChange={(event) => setSosMessage(event.target.value)}
                      />
                    </div>
                    <div className="mc-grid-2" style={{ gap: "12px" }}>
                      <div className="mc-auth__field" style={{ margin: 0 }}>
                        <label className="mc-auth__label" htmlFor={`sos-location-${hospital.id}`}>
                          Location (optional)
                        </label>
                        <input
                          id={`sos-location-${hospital.id}`}
                          type="text"
                          className="mc-auth__input"
                          placeholder="Near MG Road signal"
                          value={sosLocation}
                          onChange={(event) => setSosLocation(event.target.value)}
                        />
                      </div>
                      <div className="mc-auth__field" style={{ margin: 0 }}>
                        <label className="mc-auth__label" htmlFor={`sos-contact-${hospital.id}`}>
                          Contact number (optional)
                        </label>
                        <input
                          id={`sos-contact-${hospital.id}`}
                          type="tel"
                          className="mc-auth__input"
                          placeholder="+91 98765 43210"
                          value={sosContact}
                          onChange={(event) => setSosContact(event.target.value)}
                        />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        type="button"
                        className="mc-btn mc-btn--primary"
                        disabled={!sosMessage || sosSending}
                        onClick={() => handleSendSos(hospital.id)}
                      >
                        {sosSending ? "Sending..." : "Send Alert"}
                      </button>
                      <button
                        type="button"
                        className="mc-btn mc-btn--outline"
                        onClick={() => setSosHospitalId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="mc-grid-2">
                  {/* Resources */}
                  <div>
                    <p
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: ".05em",
                        color: "var(--text-muted)",
                        marginBottom: "10px",
                      }}
                    >
                      Machines &amp; equipment
                    </p>
                    {hospital.resources.length === 0 && (
                      <p className="mc-card__sub">Nothing listed yet.</p>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {hospital.resources.map((resource) => (
                        <div
                          key={resource.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: "13px",
                          }}
                        >
                          <span style={{ color: "var(--text-body)" }}>
                            {resource.name}{" "}
                            <span style={{ color: "var(--text-muted)" }}>
                              ({resource.category}, ×{resource.quantity})
                            </span>
                          </span>
                          <StatusPill status={resource.status} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tests */}
                  <div>
                    <p
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: ".05em",
                        color: "var(--text-muted)",
                        marginBottom: "10px",
                      }}
                    >
                      Test types ({availableTests.length} available)
                    </p>
                    {hospital.testTypes.length === 0 && (
                      <p className="mc-card__sub">Nothing listed yet.</p>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {hospital.testTypes.map((test) => (
                        <div
                          key={test.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontSize: "13px",
                          }}
                        >
                          <span style={{ color: "var(--text-body)" }}>{test.name}</span>
                          <StatusPill status={test.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </>
  );
}