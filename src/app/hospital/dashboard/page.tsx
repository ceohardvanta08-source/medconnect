"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { clearHospitalSession, getHospitalSession } from "@/lib/session";
import type { HospitalRecord, StatusValue, PatientSeverity } from "@/lib/data";
import { DOCTOR_SPECIALTIES, PATIENT_SEVERITIES } from "@/lib/data";

const RESOURCE_CATEGORIES = [
  "Diagnostic",
  "ICU",
  "Surgical",
  "Life Support",
  "Bed",
  "Other",
];

// Available -> Occupied -> Maintenance -> back to Available
const STATUS_META: Record<StatusValue, { label: string; bg: string; fg: string }> = {
  available: { label: "Available", bg: "rgba(34,197,94,0.15)", fg: "#22c55e" },
  occupied: { label: "Occupied", bg: "rgba(249,115,22,0.15)", fg: "#f97316" },
  maintenance: { label: "Maintenance", bg: "rgba(148,163,184,0.18)", fg: "#94a3b8" },
};

function StatusBadge({ status, onClick }: { status: StatusValue; onClick: () => void }) {
  const meta = STATUS_META[status];
  return (
    <button
      type="button"
      onClick={onClick}
      title="Click to change status"
      style={{
        border: "none",
        cursor: "pointer",
        borderRadius: "999px",
        padding: "4px 12px",
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: ".03em",
        textTransform: "uppercase",
        background: meta.bg,
        color: meta.fg,
      }}
    >
      {meta.label}
    </button>
  );
}

/** Small live indicator dot + label, reused in a couple of places on this page */
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

/** Small colored count pill used in the equipment status strip */
function CountPill({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontSize: "12px",
        fontWeight: 700,
        color: "var(--text-body)",
        background: "var(--card, #fff)",
        border: "1px solid var(--border, rgba(0,0,0,0.08))",
        borderRadius: "999px",
        padding: "5px 12px",
      }}
    >
      <span
        style={{ width: "8px", height: "8px", borderRadius: "999px", background: color }}
        aria-hidden="true"
      />
      {count} {label}
    </span>
  );
}

/** Colors for a patient's condition severity, shown on a doctor's patient list */
const SEVERITY_META: Record<PatientSeverity, { label: string; bg: string; fg: string }> = {
  critical: { label: "Critical", bg: "rgba(239,68,68,0.15)", fg: "#ef4444" },
  stable: { label: "Stable", bg: "rgba(34,197,94,0.15)", fg: "#22c55e" },
  recovering: { label: "Recovering", bg: "rgba(59,130,246,0.15)", fg: "#3b82f6" },
  observation: { label: "Under Observation", bg: "rgba(249,115,22,0.15)", fg: "#f97316" },
};

function SeverityBadge({ severity }: { severity: PatientSeverity }) {
  const meta = SEVERITY_META[severity];
  return (
    <span
      style={{
        borderRadius: "999px",
        padding: "3px 10px",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: ".02em",
        background: meta.bg,
        color: meta.fg,
        whiteSpace: "nowrap",
      }}
    >
      {meta.label}
    </span>
  );
}

export default function HospitalDashboardPage() {
  const router = useRouter();
  const [hospital, setHospital] = useState<HospitalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [respondingAlertId, setRespondingAlertId] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  // Add-resource form state
  const [resourceName, setResourceName] = useState("");
  const [resourceCategory, setResourceCategory] = useState(RESOURCE_CATEGORIES[0]);
  const [resourceQty, setResourceQty] = useState("1");

  // Add-test form state
  const [testName, setTestName] = useState("");

  // Add-doctor form state
  const [doctorName, setDoctorName] = useState("");
  const [doctorSpecialty, setDoctorSpecialty] = useState<string>(DOCTOR_SPECIALTIES[0]);
  const [newDoctorCode, setNewDoctorCode] = useState<string | null>(null);
  const [newDoctorPassword, setNewDoctorPassword] = useState<string | null>(null);

  // Doctor patient-assignment panel state
  const [expandedDoctorId, setExpandedDoctorId] = useState<string | null>(null);
  const [assignPatientName, setAssignPatientName] = useState("");
  const [assignCondition, setAssignCondition] = useState("");
  const [assignSeverity, setAssignSeverity] = useState<PatientSeverity>(PATIENT_SEVERITIES[0].value);
  const [assigningDoctor, setAssigningDoctor] = useState(false);
  const [dischargingCaseId, setDischargingCaseId] = useState<string | null>(null);

  const hospitalId = hospital?.id;

  async function loadHospital(id: string) {
    try {
      const response = await fetch(`/api/hospitals`);
      const data = await response.json();
      const found = (data.hospitals as HospitalRecord[]).find((h) => h.id === id);

      if (!found) {
        setNotFound(true);
      } else {
        setHospital(found);
        setLastSynced(new Date());
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const savedId = getHospitalSession();
    if (!savedId) {
      router.push("/login");
      return;
    }
    loadHospital(savedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll every 8 seconds so bed occupancy, patient counts, and SOS alerts
  // update live without a manual refresh.
  useEffect(() => {
    if (!hospitalId) return;
    const interval = setInterval(() => loadHospital(hospitalId), 8000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hospitalId]);

  function handleLogout() {
    clearHospitalSession();
    router.push("/login");
  }

  async function handleAddResource(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hospitalId || !resourceName) return;

    const response = await fetch(`/api/hospitals/${hospitalId}/resources`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: resourceName,
        category: resourceCategory,
        quantity: Number(resourceQty) || 1,
      }),
    });

    if (response.ok) {
      setResourceName("");
      setResourceQty("1");
      await loadHospital(hospitalId);
    }
  }

  async function handleCycleResource(resourceId: string) {
    if (!hospitalId) return;
    const response = await fetch(
      `/api/hospitals/${hospitalId}/resources/${resourceId}`,
      { method: "PATCH" }
    );
    if (response.ok) await loadHospital(hospitalId);
  }

  async function handleAddTest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hospitalId || !testName) return;

    const response = await fetch(`/api/hospitals/${hospitalId}/tests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: testName }),
    });

    if (response.ok) {
      setTestName("");
      await loadHospital(hospitalId);
    }
  }

  async function handleCycleTest(testId: string) {
    if (!hospitalId) return;
    const response = await fetch(`/api/hospitals/${hospitalId}/tests/${testId}`, {
      method: "PATCH",
    });
    if (response.ok) await loadHospital(hospitalId);
  }

  async function handleAddDoctor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hospitalId || !doctorName || !doctorSpecialty) return;

    const response = await fetch(`/api/hospitals/${hospitalId}/doctors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: doctorName, specialty: doctorSpecialty }),
    });
    const data = await response.json();

    if (response.ok) {
      setNewDoctorCode(data.doctor.doctorCode);
      setNewDoctorPassword(data.tempPassword);
      setDoctorName("");
      setDoctorSpecialty(DOCTOR_SPECIALTIES[0]);
      await loadHospital(hospitalId);
    }
  }

  function toggleDoctorExpand(doctorId: string) {
    setExpandedDoctorId((current) => (current === doctorId ? null : doctorId));
    setAssignPatientName("");
    setAssignCondition("");
    setAssignSeverity(PATIENT_SEVERITIES[0].value);
  }

  async function handleAssignPatient(event: FormEvent<HTMLFormElement>, doctorId: string) {
    event.preventDefault();
    if (!hospitalId || !assignPatientName || !assignCondition) return;

    setAssigningDoctor(true);
    try {
      const response = await fetch(`/api/hospitals/${hospitalId}/doctors`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assign",
          doctorId,
          patientName: assignPatientName,
          condition: assignCondition,
          severity: assignSeverity,
        }),
      });
      if (response.ok) {
        setAssignPatientName("");
        setAssignCondition("");
        setAssignSeverity(PATIENT_SEVERITIES[0].value);
        await loadHospital(hospitalId);
      }
    } finally {
      setAssigningDoctor(false);
    }
  }

  async function handleDischargePatient(doctorId: string, patientCaseId: string) {
    if (!hospitalId) return;
    setDischargingCaseId(patientCaseId);
    try {
      const response = await fetch(`/api/hospitals/${hospitalId}/doctors`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "discharge", doctorId, patientCaseId }),
      });
      if (response.ok) await loadHospital(hospitalId);
    } finally {
      setDischargingCaseId(null);
    }
  }

  async function handleRespondAlert(alertId: string, status: "accepted" | "declined") {
    if (!hospitalId) return;
    setRespondingAlertId(alertId);
    try {
      const response = await fetch(`/api/hospitals/${hospitalId}/emergency?alertId=${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (response.ok) await loadHospital(hospitalId);
    } finally {
      setRespondingAlertId(null);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="mc-page">
          <p className="mc-body">Loading your hospital portal...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (notFound || !hospital) {
    return (
      <>
        <Navbar />
        <main className="mc-page">
          <p className="mc-body">
            We couldn&apos;t find your hospital session. Please log in again.
          </p>
          <a href="/login" className="mc-btn mc-btn--primary mc-mt-24">
            Go to login
          </a>
        </main>
        <Footer />
      </>
    );
  }

  // ---- Live capacity numbers, derived from existing resource data ----
  // Any resource with category "Bed" represents bed capacity. Its quantity
  // is how many beds that entry represents, and its status tells us whether
  // that block of beds is available, occupied, or under maintenance.
  // "Patients admitted now" = total occupied bed capacity. This needs no
  // separate patient-tracking system, and it updates live on every poll.
  const bedResources = hospital.resources.filter((r) => r.category === "Bed");
  const totalBedCapacity = bedResources.reduce((sum, r) => sum + r.quantity, 0);
  const occupiedBedCapacity = bedResources
    .filter((r) => r.status === "occupied")
    .reduce((sum, r) => sum + r.quantity, 0);
  const availableBedCapacity = bedResources
    .filter((r) => r.status === "available")
    .reduce((sum, r) => sum + r.quantity, 0);
  const maintenanceBedCapacity = totalBedCapacity - occupiedBedCapacity - availableBedCapacity;
  const occupancyPct =
    totalBedCapacity > 0 ? Math.round((occupiedBedCapacity / totalBedCapacity) * 100) : 0;
  const occupancyColor = occupancyPct >= 90 ? "#ef4444" : occupancyPct >= 70 ? "#f97316" : "#22c55e";

  // Equipment/machines status strip (every resource, beds included)
  const equipAvailable = hospital.resources.filter((r) => r.status === "available").length;
  const equipOccupied = hospital.resources.filter((r) => r.status === "occupied").length;
  const equipMaintenance = hospital.resources.filter((r) => r.status === "maintenance").length;

  const activeTestCount = hospital.testTypes.filter((t) => t.status === "available").length;
  const pendingAlerts = hospital.emergencyAlerts.filter((a) => a.status === "pending");

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
            <p className="mc-page__breadcrumb">MedConnect / Hospital Portal</p>
            <h1 className="mc-page__title">{hospital.name}</h1>
            <p className="mc-page__subtitle">
              Hospital ID: <strong style={{ color: "var(--text-head)" }}>{hospital.hospitalCode}</strong>
              {" · "}
              {hospital.address}
            </p>
          </div>
          <button type="button" className="mc-btn mc-btn--outline" onClick={handleLogout}>
            Log out
          </button>
        </div>

        {/* Emergency SOS alerts — always at the very top so nothing gets missed */}
        {pendingAlerts.length > 0 && (
          <div
            style={{
              marginBottom: "28px",
              border: "2px solid #ef4444",
              borderRadius: "14px",
              background: "rgba(239,68,68,0.06)",
              padding: "18px 20px",
            }}
          >
            <p
              style={{
                fontWeight: 800,
                color: "#ef4444",
                marginBottom: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              🚨 {pendingAlerts.length} emergency alert{pendingAlerts.length > 1 ? "s" : ""}{" "}
              awaiting response
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {pendingAlerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    background: "var(--card-bg, #fff)",
                    borderRadius: "10px",
                    padding: "14px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 700 }}>{alert.message}</p>
                    <p className="mc-card__sub">
                      {alert.location ? `${alert.location} · ` : ""}
                      {alert.contactNumber ? `${alert.contactNumber} · ` : ""}
                      {new Date(alert.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      className="mc-btn mc-btn--primary"
                      disabled={respondingAlertId === alert.id}
                      onClick={() => handleRespondAlert(alert.id, "accepted")}
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      className="mc-btn mc-btn--outline"
                      disabled={respondingAlertId === alert.id}
                      onClick={() => handleRespondAlert(alert.id, "declined")}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---- Live capacity overview ---- */}
        <div style={{ marginBottom: "10px" }}>
          <LiveIndicator lastSynced={lastSynced} />
        </div>

        <div className="mc-grid-3" style={{ marginBottom: "14px" }}>
          <div className="mc-card" style={{ borderLeft: "4px solid #ef4444" }}>
            <p className="mc-card__title">Patients admitted now</p>
            <p className="mc-card__num">{occupiedBedCapacity}</p>
            <p className="mc-card__sub">Based on occupied bed capacity</p>
          </div>
          <div className="mc-card" style={{ borderLeft: "4px solid #22c55e" }}>
            <p className="mc-card__title">Beds available</p>
            <p className="mc-card__num">{availableBedCapacity}</p>
            <p className="mc-card__sub">of {totalBedCapacity} total bed capacity</p>
          </div>
          <div className="mc-card" style={{ borderLeft: "4px solid #f97316" }}>
            <p className="mc-card__title">Bed occupancy</p>
            <p className="mc-card__num">{occupancyPct}%</p>
            <p className="mc-card__sub">{maintenanceBedCapacity} beds under maintenance</p>
          </div>
        </div>

        {totalBedCapacity > 0 ? (
          <div style={{ marginBottom: "28px" }}>
            <div
              style={{
                height: "10px",
                borderRadius: "999px",
                background: "rgba(0,0,0,0.06)",
                overflow: "hidden",
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
            <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>
              {occupiedBedCapacity} of {totalBedCapacity} beds occupied · {availableBedCapacity} available ·{" "}
              {maintenanceBedCapacity} under maintenance
            </p>
          </div>
        ) : (
          <p
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              marginBottom: "28px",
            }}
          >
            Add a resource with category &quot;Bed&quot; below to start tracking live bed
            capacity and patient counts.
          </p>
        )}

        {/* Stats */}
        <div className="mc-grid-3">
          <div className="mc-card">
            <p className="mc-card__title">Resources / Machines</p>
            <p className="mc-card__num">{hospital.resources.length}</p>
            <p className="mc-card__sub">{equipAvailable} currently available</p>
          </div>
          <div className="mc-card">
            <p className="mc-card__title">Test types offered</p>
            <p className="mc-card__num">{hospital.testTypes.length}</p>
            <p className="mc-card__sub">{activeTestCount} currently available</p>
          </div>
          <div className="mc-card">
            <p className="mc-card__title">Doctors on staff</p>
            <p className="mc-card__num">{hospital.doctors.length}</p>
            <p className="mc-card__sub">Issued via this portal</p>
          </div>
        </div>

        {/* Resources */}
        <div className="mc-mt-32">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            <h2 className="mc-h3">Machines &amp; equipment</h2>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <CountPill label="available" count={equipAvailable} color="#22c55e" />
              <CountPill label="occupied" count={equipOccupied} color="#f97316" />
              <CountPill label="in maintenance" count={equipMaintenance} color="#94a3b8" />
            </div>
          </div>
          <div className="mc-grid-2">
            <div className="mc-card">
              <p style={{ fontWeight: 700, marginBottom: "14px" }}>Add a resource</p>
              <form onSubmit={handleAddResource}>
                <div className="mc-auth__field">
                  <label className="mc-auth__label" htmlFor="resourceName">
                    Name
                  </label>
                  <input
                    id="resourceName"
                    type="text"
                    className="mc-auth__input"
                    placeholder="MRI 3T Scanner"
                    value={resourceName}
                    onChange={(event) => setResourceName(event.target.value)}
                  />
                </div>
                <div className="mc-grid-2" style={{ gap: "12px" }}>
                  <div className="mc-auth__field">
                    <label className="mc-auth__label" htmlFor="resourceCategory">
                      Category
                    </label>
                    <select
                      id="resourceCategory"
                      className="mc-auth__input"
                      value={resourceCategory}
                      onChange={(event) => setResourceCategory(event.target.value)}
                    >
                      {RESOURCE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mc-auth__field">
                    <label className="mc-auth__label" htmlFor="resourceQty">
                      Quantity
                    </label>
                    <input
                      id="resourceQty"
                      type="number"
                      min={1}
                      className="mc-auth__input"
                      value={resourceQty}
                      onChange={(event) => setResourceQty(event.target.value)}
                    />
                  </div>
                </div>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "-8px 0 14px" }}>
                  Tip: use category &quot;Bed&quot; for ward/ICU beds so they count toward the
                  live patient and capacity numbers above.
                </p>
                <button type="submit" className="mc-btn mc-btn--primary mc-btn--full">
                  Add resource
                </button>
              </form>
            </div>

            <div className="mc-card">
              <p style={{ fontWeight: 700, marginBottom: "14px" }}>Current resources</p>
              {hospital.resources.length === 0 && (
                <p className="mc-card__sub">No resources added yet.</p>
              )}
              <div className="mc-list">
                {hospital.resources.map((resource) => (
                  <div key={resource.id} className="mc-list-item">
                    <div className="mc-list-item__icon" aria-hidden="true">
                      {resource.category === "Bed" ? "🛏️" : "🩻"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="mc-list-item__title">{resource.name}</div>
                      <div className="mc-list-item__sub">
                        {resource.category} · Qty {resource.quantity}
                      </div>
                    </div>
                    <StatusBadge
                      status={resource.status}
                      onClick={() => handleCycleResource(resource.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Test types */}
        <div className="mc-mt-32">
          <h2 className="mc-h3" style={{ marginBottom: "16px" }}>
            Test types
          </h2>
          <div className="mc-grid-2">
            <div className="mc-card">
              <p style={{ fontWeight: 700, marginBottom: "14px" }}>Add a test type</p>
              <form onSubmit={handleAddTest}>
                <div className="mc-auth__field">
                  <label className="mc-auth__label" htmlFor="testName">
                    Test name
                  </label>
                  <input
                    id="testName"
                    type="text"
                    className="mc-auth__input"
                    placeholder="Complete Blood Count (CBC)"
                    value={testName}
                    onChange={(event) => setTestName(event.target.value)}
                  />
                </div>
                <button type="submit" className="mc-btn mc-btn--primary mc-btn--full">
                  Add test type
                </button>
              </form>
            </div>

            <div className="mc-card">
              <p style={{ fontWeight: 700, marginBottom: "14px" }}>Current test types</p>
              {hospital.testTypes.length === 0 && (
                <p className="mc-card__sub">No test types added yet.</p>
              )}
              <div className="mc-list">
                {hospital.testTypes.map((test) => (
                  <div key={test.id} className="mc-list-item">
                    <div className="mc-list-item__icon" aria-hidden="true">
                      🧪
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="mc-list-item__title">{test.name}</div>
                    </div>
                    <StatusBadge
                      status={test.status}
                      onClick={() => handleCycleTest(test.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Doctors */}
        <div className="mc-mt-32">
          <h2 className="mc-h3" style={{ marginBottom: "16px" }}>
            Doctors
          </h2>
          <div className="mc-grid-2">
            <div className="mc-card">
              <p style={{ fontWeight: 700, marginBottom: "14px" }}>Issue a new Doctor ID</p>

              {newDoctorCode && newDoctorPassword && (
                <div
                  style={{
                    background: "var(--accent-light)",
                    color: "var(--accent)",
                    fontSize: "13px",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                    lineHeight: 1.6,
                  }}
                >
                  Doctor ID generated: <strong>{newDoctorCode}</strong>
                  <br />
                  Starting password: <strong>{newDoctorPassword}</strong>
                  <br />
                  Share both with the doctor — they should change the
                  password after first login (Phase 2).
                </div>
              )}

              <form onSubmit={handleAddDoctor}>
                <div className="mc-auth__field">
                  <label className="mc-auth__label" htmlFor="doctorName">
                    Doctor name
                  </label>
                  <input
                    id="doctorName"
                    type="text"
                    className="mc-auth__input"
                    placeholder="Dr. Meera Rao"
                    value={doctorName}
                    onChange={(event) => setDoctorName(event.target.value)}
                  />
                </div>
                <div className="mc-auth__field">
                  <label className="mc-auth__label" htmlFor="doctorSpecialty">
                    Specialty
                  </label>
                  <select
                    id="doctorSpecialty"
                    className="mc-auth__input"
                    value={doctorSpecialty}
                    onChange={(event) => setDoctorSpecialty(event.target.value)}
                  >
                    {DOCTOR_SPECIALTIES.map((specialty) => (
                      <option key={specialty} value={specialty}>
                        {specialty}
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="mc-btn mc-btn--primary mc-btn--full">
                  Generate Doctor ID
                </button>
              </form>
            </div>

            <div className="mc-card">
              <p style={{ fontWeight: 700, marginBottom: "14px" }}>Doctors on staff</p>
              {hospital.doctors.length === 0 && (
                <p className="mc-card__sub">No doctors added yet.</p>
              )}
              <div className="mc-list">
                {hospital.doctors.map((doctor) => {
                  const isExpanded = expandedDoctorId === doctor.id;
                  const patientCount = doctor.patients.length;
                  const severityCounts = PATIENT_SEVERITIES.map((s) => ({
                    ...s,
                    count: doctor.patients.filter((p) => p.severity === s.value).length,
                  })).filter((s) => s.count > 0);

                  return (
                    <div key={doctor.id} style={{ borderBottom: "1px solid var(--border, rgba(0,0,0,0.08))" }}>
                      <button
                        type="button"
                        onClick={() => toggleDoctorExpand(doctor.id)}
                        className="mc-list-item"
                        style={{
                          width: "100%",
                          textAlign: "left",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          borderBottom: "none",
                        }}
                      >
                        <div className="mc-list-item__icon" aria-hidden="true">
                          🩺
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className="mc-list-item__title">{doctor.name}</div>
                          <div className="mc-list-item__sub">
                            {doctor.specialty} · ID: {doctor.doctorCode}
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: 700,
                              color: "var(--text-muted)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {patientCount} patient{patientCount === 1 ? "" : "s"}
                          </span>
                          {severityCounts.map((s) => (
                            <span
                              key={s.value}
                              style={{
                                fontSize: "11px",
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: "999px",
                                background: SEVERITY_META[s.value].bg,
                                color: SEVERITY_META[s.value].fg,
                              }}
                            >
                              {s.count} {s.label}
                            </span>
                          ))}
                          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                            {isExpanded ? "▲" : "▼"}
                          </span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div style={{ padding: "4px 4px 18px 44px" }}>
                          {doctor.patients.length === 0 ? (
                            <p className="mc-card__sub" style={{ marginBottom: "12px" }}>
                              No patients currently assigned to this doctor.
                            </p>
                          ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                              {doctor.patients.map((patientCase) => (
                                <div
                                  key={patientCase.id}
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                    gap: "10px",
                                    background: "rgba(0,0,0,0.02)",
                                    borderRadius: "8px",
                                    padding: "10px 12px",
                                  }}
                                >
                                  <div>
                                    <p style={{ fontWeight: 700, fontSize: "13px" }}>
                                      {patientCase.patientName}
                                    </p>
                                    <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                      {patientCase.condition} · assigned{" "}
                                      {new Date(patientCase.assignedAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <SeverityBadge severity={patientCase.severity} />
                                    <button
                                      type="button"
                                      className="mc-btn mc-btn--outline"
                                      disabled={dischargingCaseId === patientCase.id}
                                      onClick={() => handleDischargePatient(doctor.id, patientCase.id)}
                                      style={{ padding: "5px 12px", fontSize: "12px" }}
                                    >
                                      {dischargingCaseId === patientCase.id ? "..." : "Discharge"}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <form
                            onSubmit={(event) => handleAssignPatient(event, doctor.id)}
                            style={{
                              border: "1px dashed var(--border-strong, rgba(0,0,0,0.15))",
                              borderRadius: "10px",
                              padding: "14px",
                            }}
                          >
                            <p style={{ fontWeight: 700, fontSize: "13px", marginBottom: "10px" }}>
                              Assign a patient to Dr. {doctor.name.replace(/^Dr\.?\s*/i, "")}
                            </p>
                            <div className="mc-grid-2" style={{ gap: "10px" }}>
                              <div className="mc-auth__field" style={{ margin: 0 }}>
                                <label className="mc-auth__label" htmlFor={`assign-name-${doctor.id}`}>
                                  Patient name
                                </label>
                                <input
                                  id={`assign-name-${doctor.id}`}
                                  type="text"
                                  className="mc-auth__input"
                                  placeholder="A. Verma"
                                  value={assignPatientName}
                                  onChange={(event) => setAssignPatientName(event.target.value)}
                                />
                              </div>
                              <div className="mc-auth__field" style={{ margin: 0 }}>
                                <label className="mc-auth__label" htmlFor={`assign-severity-${doctor.id}`}>
                                  Condition severity
                                </label>
                                <select
                                  id={`assign-severity-${doctor.id}`}
                                  className="mc-auth__input"
                                  value={assignSeverity}
                                  onChange={(event) =>
                                    setAssignSeverity(event.target.value as PatientSeverity)
                                  }
                                >
                                  {PATIENT_SEVERITIES.map((s) => (
                                    <option key={s.value} value={s.value}>
                                      {s.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="mc-auth__field" style={{ margin: "10px 0" }}>
                              <label className="mc-auth__label" htmlFor={`assign-condition-${doctor.id}`}>
                                Condition / reason
                              </label>
                              <input
                                id={`assign-condition-${doctor.id}`}
                                type="text"
                                className="mc-auth__input"
                                placeholder="e.g. Post-surgery recovery, cardiac monitoring"
                                value={assignCondition}
                                onChange={(event) => setAssignCondition(event.target.value)}
                              />
                            </div>
                            <button
                              type="submit"
                              className="mc-btn mc-btn--primary"
                              disabled={assigningDoctor || !assignPatientName || !assignCondition}
                              style={{ fontSize: "13px" }}
                            >
                              {assigningDoctor ? "Assigning..." : "Assign patient"}
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Emergency alert history (accepted/declined) */}
        {hospital.emergencyAlerts.length > pendingAlerts.length && (
          <div className="mc-mt-32">
            <h2 className="mc-h3" style={{ marginBottom: "16px" }}>
              Past emergency alerts
            </h2>
            <div className="mc-card">
              <div className="mc-list">
                {hospital.emergencyAlerts
                  .filter((a) => a.status !== "pending")
                  .map((alert) => (
                    <div key={alert.id} className="mc-list-item">
                      <div className="mc-list-item__icon" aria-hidden="true">
                        {alert.status === "accepted" ? "✅" : "❌"}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="mc-list-item__title">{alert.message}</div>
                        <div className="mc-list-item__sub">
                          {new Date(alert.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <span
                        className={`mc-badge ${
                          alert.status === "accepted"
                            ? "mc-badge--success"
                            : "mc-badge--danger"
                        }`}
                      >
                        {alert.status === "accepted" ? "Accepted" : "Declined"}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}