"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { saveDoctorSession, saveHospitalSession } from "@/lib/session";
import type { HospitalRecord } from "@/types";

type LoginRole = "patient" | "hospital" | "doctor";
type HospitalMode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<LoginRole>("patient");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Patient fields (Phase 1 demo — no real auth yet)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Hospital fields
  const [hospitalMode, setHospitalMode] = useState<HospitalMode>("login");
  const [hospitalCode, setHospitalCode] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalAddress, setHospitalAddress] = useState("");
  const [hospitalContact, setHospitalContact] = useState("");
  const [registeredHospital, setRegisteredHospital] = useState<HospitalRecord | null>(null);

  // Doctor fields
  const [doctorCode, setDoctorCode] = useState("");

  function resetMessages() {
    setError(null);
  }

  async function handlePatientSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetMessages();

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    // Phase 1 demo: no real authentication yet — routes straight to the
    // dashboard. Phase 2 wires this up to NextAuth + a database.
    router.push("/patient/dashboard");
  }

  async function handleHospitalLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetMessages();

    if (!hospitalCode) {
      setError("Please enter your Hospital ID.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/hospitals/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hospitalCode }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Login failed. Please check your Hospital ID.");
        return;
      }

      saveHospitalSession(data.hospital.id);
      router.push("/hospital/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleHospitalRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetMessages();

    if (!hospitalName || !hospitalAddress || !hospitalContact) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/hospitals/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: hospitalName,
          address: hospitalAddress,
          contactNumber: hospitalContact,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Registration failed. Please try again.");
        return;
      }

      setRegisteredHospital(data.hospital);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function continueToHospitalDashboard() {
    if (!registeredHospital) return;
    saveHospitalSession(registeredHospital.id);
    router.push("/hospital/dashboard");
  }

  async function handleDoctorLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetMessages();

    if (!doctorCode) {
      setError("Please enter your Doctor ID.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/doctors/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorCode }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Login failed. Please check your Doctor ID.");
        return;
      }

      saveDoctorSession(data.doctor.doctorCode);
      router.push("/doctor/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="mc-auth">
        <div className="mc-auth__card">
          <h1 className="mc-auth__title">Welcome back</h1>
          <p className="mc-auth__subtitle">
            Log in to your MedConnect account to continue.
          </p>

          {/* Role toggle */}
          <div className="mc-auth__role-toggle" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={role === "patient"}
              className={`mc-auth__role-btn ${
                role === "patient" ? "mc-auth__role-btn--active" : ""
              }`}
              onClick={() => {
                setRole("patient");
                resetMessages();
              }}
            >
              Patient
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={role === "hospital"}
              className={`mc-auth__role-btn ${
                role === "hospital" ? "mc-auth__role-btn--active" : ""
              }`}
              onClick={() => {
                setRole("hospital");
                resetMessages();
                setRegisteredHospital(null);
              }}
            >
              Hospital
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={role === "doctor"}
              className={`mc-auth__role-btn ${
                role === "doctor" ? "mc-auth__role-btn--active" : ""
              }`}
              onClick={() => {
                setRole("doctor");
                resetMessages();
              }}
            >
              Doctor
            </button>
          </div>

          {error && <div className="mc-auth__error">{error}</div>}

          {/* ── PATIENT ─────────────────────────────────────────── */}
          {role === "patient" && (
            <>
              <form onSubmit={handlePatientSubmit} noValidate>
                <div className="mc-auth__field">
                  <label className="mc-auth__label" htmlFor="email">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="mc-auth__input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                  />
                </div>

                <div className="mc-auth__field">
                  <label className="mc-auth__label" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    className="mc-auth__input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                  />
                </div>

                <button type="submit" className="mc-btn mc-btn--primary mc-btn--full">
                  Log in as Patient
                </button>
              </form>

              <p className="mc-auth__footer">
                This is a Phase 1 demo — no account is required.
                <br />
                Any email and password will work.
              </p>
            </>
          )}

          {/* ── HOSPITAL ────────────────────────────────────────── */}
          {role === "hospital" && (
            <>
              <div className="mc-auth__role-toggle" style={{ marginBottom: "20px" }}>
                <button
                  type="button"
                  className={`mc-auth__role-btn ${
                    hospitalMode === "login" ? "mc-auth__role-btn--active" : ""
                  }`}
                  onClick={() => {
                    setHospitalMode("login");
                    resetMessages();
                    setRegisteredHospital(null);
                  }}
                >
                  Log in
                </button>
                <button
                  type="button"
                  className={`mc-auth__role-btn ${
                    hospitalMode === "register" ? "mc-auth__role-btn--active" : ""
                  }`}
                  onClick={() => {
                    setHospitalMode("register");
                    resetMessages();
                  }}
                >
                  Register hospital
                </button>
              </div>

              {hospitalMode === "login" && (
                <form onSubmit={handleHospitalLogin} noValidate>
                  <div className="mc-auth__field">
                    <label className="mc-auth__label" htmlFor="hospitalCode">
                      Hospital ID
                    </label>
                    <input
                      id="hospitalCode"
                      type="text"
                      className="mc-auth__input"
                      placeholder="MC-HOS-XXXX"
                      value={hospitalCode}
                      onChange={(event) => setHospitalCode(event.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="mc-btn mc-btn--primary mc-btn--full"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Log in as Hospital"}
                  </button>
                </form>
              )}

              {hospitalMode === "register" && !registeredHospital && (
                <form onSubmit={handleHospitalRegister} noValidate>
                  <div className="mc-auth__field">
                    <label className="mc-auth__label" htmlFor="hospitalName">
                      Hospital name
                    </label>
                    <input
                      id="hospitalName"
                      type="text"
                      className="mc-auth__input"
                      placeholder="City Care Hospital"
                      value={hospitalName}
                      onChange={(event) => setHospitalName(event.target.value)}
                    />
                  </div>

                  <div className="mc-auth__field">
                    <label className="mc-auth__label" htmlFor="hospitalAddress">
                      Address
                    </label>
                    <input
                      id="hospitalAddress"
                      type="text"
                      className="mc-auth__input"
                      placeholder="123 MG Road, Delhi"
                      value={hospitalAddress}
                      onChange={(event) => setHospitalAddress(event.target.value)}
                    />
                  </div>

                  <div className="mc-auth__field">
                    <label className="mc-auth__label" htmlFor="hospitalContact">
                      Contact number
                    </label>
                    <input
                      id="hospitalContact"
                      type="tel"
                      className="mc-auth__input"
                      placeholder="+91 98765 43210"
                      value={hospitalContact}
                      onChange={(event) => setHospitalContact(event.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    className="mc-btn mc-btn--primary mc-btn--full"
                    disabled={loading}
                  >
                    {loading ? "Registering..." : "Register hospital"}
                  </button>
                </form>
              )}

              {registeredHospital && (
                <div>
                  <div
                    style={{
                      background: "var(--accent-light)",
                      borderRadius: "12px",
                      padding: "20px",
                      marginBottom: "20px",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        textTransform: "uppercase",
                        letterSpacing: ".06em",
                        color: "var(--accent)",
                        fontWeight: 700,
                        marginBottom: "8px",
                      }}
                    >
                      Registration successful — save this ID
                    </p>
                    <p
                      style={{
                        fontSize: "26px",
                        fontWeight: 800,
                        color: "var(--text-head)",
                        letterSpacing: ".02em",
                      }}
                    >
                      {registeredHospital.hospitalCode}
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "var(--text-muted)",
                        marginTop: "8px",
                      }}
                    >
                      Use this ID to log in to your Hospital Portal any time.
                      This is also what you&apos;ll give to your doctors so
                      they can request their own Doctor IDs.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="mc-btn mc-btn--primary mc-btn--full"
                    onClick={continueToHospitalDashboard}
                  >
                    Continue to Hospital Portal
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── DOCTOR ──────────────────────────────────────────── */}
          {role === "doctor" && (
            <>
              <form onSubmit={handleDoctorLogin} noValidate>
                <div className="mc-auth__field">
                  <label className="mc-auth__label" htmlFor="doctorCode">
                    Doctor ID
                  </label>
                  <input
                    id="doctorCode"
                    type="text"
                    className="mc-auth__input"
                    placeholder="MC-DOC-XXXX"
                    value={doctorCode}
                    onChange={(event) => setDoctorCode(event.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="mc-btn mc-btn--primary mc-btn--full"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Log in as Doctor"}
                </button>
              </form>

              <p className="mc-auth__footer">
                Don&apos;t have a Doctor ID? Ask the hospital you work at —
                they can issue one for you from their Hospital Portal.
              </p>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
