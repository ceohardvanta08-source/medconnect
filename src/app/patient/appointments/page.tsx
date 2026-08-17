"use client";

import { useState, type FormEvent } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface UpcomingAppointment {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  status: "upcoming" | "completed";
}

const INITIAL_APPOINTMENTS: UpcomingAppointment[] = [
  { id: "a1", doctor: "Dr. Meera Rao", specialty: "General Physician", date: "18 Aug 2026", time: "10:30 AM", status: "upcoming" },
  { id: "a2", doctor: "Dr. Arjun Shah", specialty: "Cardiologist", date: "25 Aug 2026", time: "2:00 PM", status: "upcoming" },
  { id: "a3", doctor: "Dr. Neha Kapoor", specialty: "Dermatologist", date: "02 Jul 2026", time: "11:00 AM", status: "completed" },
];

const SPECIALTIES = [
  "General Physician",
  "Cardiologist",
  "Orthopedic",
  "Pulmonologist",
  "Dermatologist",
  "Pediatrician",
];

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [specialty, setSpecialty] = useState(SPECIALTIES[0]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [confirmation, setConfirmation] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!date || !time) return;

    const newAppointment: UpcomingAppointment = {
      id: `a${appointments.length + 1}`,
      doctor: "To be assigned",
      specialty,
      date,
      time,
      status: "upcoming",
    };

    setAppointments((prev) => [newAppointment, ...prev]);
    setConfirmation(
      `Request received for ${specialty} on ${date} at ${time}. You'll get a confirmation shortly.`
    );
    setDate("");
    setTime("");
    setReason("");
  }

  return (
    <>
      <Navbar />
      <main className="mc-page">
        <div className="mc-page__head">
          <div>
            <p className="mc-page__breadcrumb">MedConnect / Patient Portal</p>
            <h1 className="mc-page__title">Appointments</h1>
            <p className="mc-page__subtitle">
              Request a consultation or review your appointment history.
            </p>
          </div>
        </div>

        <div className="mc-grid-2">
          {/* Booking form */}
          <div className="mc-card">
            <h2 className="mc-h3" style={{ marginBottom: "18px" }}>
              Book a new appointment
            </h2>

            {confirmation && (
              <div
                style={{
                  background: "var(--accent-light)",
                  color: "var(--accent)",
                  fontSize: "13px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  marginBottom: "18px",
                }}
              >
                {confirmation}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mc-auth__field">
                <label className="mc-auth__label" htmlFor="specialty">
                  Specialty
                </label>
                <select
                  id="specialty"
                  className="mc-auth__input"
                  value={specialty}
                  onChange={(event) => setSpecialty(event.target.value)}
                >
                  {SPECIALTIES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mc-grid-2" style={{ gap: "12px" }}>
                <div className="mc-auth__field">
                  <label className="mc-auth__label" htmlFor="date">
                    Preferred date
                  </label>
                  <input
                    id="date"
                    type="date"
                    className="mc-auth__input"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    required
                  />
                </div>
                <div className="mc-auth__field">
                  <label className="mc-auth__label" htmlFor="time">
                    Preferred time
                  </label>
                  <input
                    id="time"
                    type="time"
                    className="mc-auth__input"
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mc-auth__field">
                <label className="mc-auth__label" htmlFor="reason">
                  Reason for visit (optional)
                </label>
                <textarea
                  id="reason"
                  className="mc-auth__input"
                  rows={3}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Briefly describe your symptoms..."
                />
              </div>

              <button type="submit" className="mc-btn mc-btn--primary mc-btn--full">
                Request appointment
              </button>
            </form>
          </div>

          {/* Appointment list */}
          <div className="mc-card">
            <h2 className="mc-h3" style={{ marginBottom: "18px" }}>
              Your appointments
            </h2>
            <div className="mc-list">
              {appointments.map((appt) => (
                <div key={appt.id} className="mc-list-item">
                  <div className="mc-list-item__icon" aria-hidden="true">
                    📅
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="mc-list-item__title">{appt.doctor}</div>
                    <div className="mc-list-item__sub">
                      {appt.specialty} · {appt.date} · {appt.time}
                    </div>
                  </div>
                  <span
                    className={`mc-badge ${
                      appt.status === "upcoming"
                        ? "mc-badge--pending"
                        : "mc-badge--success"
                    }`}
                  >
                    {appt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
