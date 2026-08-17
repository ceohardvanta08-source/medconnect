"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { clearHospitalSession, getHospitalSession } from "@/lib/session";
import type { HospitalRecord } from "@/types";

const RESOURCE_CATEGORIES = [
  "Diagnostic",
  "ICU",
  "Surgical",
  "Life Support",
  "Bed",
  "Other",
];

export default function HospitalDashboardPage() {
  const router = useRouter();
  const [hospital, setHospital] = useState<HospitalRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Add-resource form state
  const [resourceName, setResourceName] = useState("");
  const [resourceCategory, setResourceCategory] = useState(RESOURCE_CATEGORIES[0]);
  const [resourceQty, setResourceQty] = useState("1");

  // Add-test form state
  const [testName, setTestName] = useState("");

  // Add-doctor form state
  const [doctorName, setDoctorName] = useState("");
  const [doctorSpecialty, setDoctorSpecialty] = useState("");
  const [newDoctorCode, setNewDoctorCode] = useState<string | null>(null);

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

  async function handleToggleResource(resourceId: string) {
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

  async function handleToggleTest(testId: string) {
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
      setDoctorName("");
      setDoctorSpecialty("");
      await loadHospital(hospitalId);
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

  const activeResourceCount = hospital.resources.filter((r) => r.active).length;
  const activeTestCount = hospital.testTypes.filter((t) => t.active).length;

  return (
    <>
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

        {/* Stats */}
        <div className="mc-grid-3">
          <div className="mc-card">
            <p className="mc-card__title">Resources / Machines</p>
            <p className="mc-card__num">{hospital.resources.length}</p>
            <p className="mc-card__sub">{activeResourceCount} currently active</p>
          </div>
          <div className="mc-card">
            <p className="mc-card__title">Test types offered</p>
            <p className="mc-card__num">{hospital.testTypes.length}</p>
            <p className="mc-card__sub">{activeTestCount} currently active</p>
          </div>
          <div className="mc-card">
            <p className="mc-card__title">Doctors on staff</p>
            <p className="mc-card__num">{hospital.doctors.length}</p>
            <p className="mc-card__sub">Issued via this portal</p>
          </div>
        </div>

        {/* Resources */}
        <div className="mc-mt-32">
          <h2 className="mc-h3" style={{ marginBottom: "16px" }}>
            Machines &amp; equipment
          </h2>
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
                      🩻
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="mc-list-item__title">{resource.name}</div>
                      <div className="mc-list-item__sub">
                        {resource.category} · Qty {resource.quantity}
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`mc-badge ${
                        resource.active ? "mc-badge--success" : "mc-badge--danger"
                      }`}
                      style={{ border: "none", cursor: "pointer" }}
                      onClick={() => handleToggleResource(resource.id)}
                    >
                      {resource.active ? "Active" : "Inactive"}
                    </button>
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
                    <button
                      type="button"
                      className={`mc-badge ${
                        test.active ? "mc-badge--success" : "mc-badge--danger"
                      }`}
                      style={{ border: "none", cursor: "pointer" }}
                      onClick={() => handleToggleTest(test.id)}
                    >
                      {test.active ? "Active" : "Inactive"}
                    </button>
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

              {newDoctorCode && (
                <div
                  style={{
                    background: "var(--accent-light)",
                    color: "var(--accent)",
                    fontSize: "13px",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                  }}
                >
                  Doctor ID generated:{" "}
                  <strong>{newDoctorCode}</strong> — share this with the
                  doctor so they can log in.
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
                  <input
                    id="doctorSpecialty"
                    type="text"
                    className="mc-auth__input"
                    placeholder="General Physician"
                    value={doctorSpecialty}
                    onChange={(event) => setDoctorSpecialty(event.target.value)}
                  />
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
                {hospital.doctors.map((doctor) => (
                  <div key={doctor.id} className="mc-list-item">
                    <div className="mc-list-item__icon" aria-hidden="true">
                      🩺
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="mc-list-item__title">{doctor.name}</div>
                      <div className="mc-list-item__sub">
                        {doctor.specialty} · ID: {doctor.doctorCode}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
