"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { HospitalRecord } from "@/types";

export default function HospitalsDirectoryPage() {
  const [hospitals, setHospitals] = useState<HospitalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hospitals")
      .then((response) => response.json())
      .then((data) => setHospitals(data.hospitals ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <main className="mc-page">
        <div className="mc-page__head">
          <div>
            <p className="mc-page__breadcrumb">MedConnect / Hospitals</p>
            <h1 className="mc-page__title">Registered hospitals</h1>
            <p className="mc-page__subtitle">
              Live machine, equipment and test availability across every
              hospital on MedConnect.
            </p>
          </div>
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
            const activeResources = hospital.resources.filter((r) => r.active);
            const activeTests = hospital.testTypes.filter((t) => t.active);

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
                  <span className="mc-badge mc-badge--success">
                    {activeResources.length} resources active
                  </span>
                </div>

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
                          <span
                            className={`mc-badge ${
                              resource.active
                                ? "mc-badge--success"
                                : "mc-badge--danger"
                            }`}
                          >
                            {resource.active ? "Available" : "Unavailable"}
                          </span>
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
                      Test types ({activeTests.length} active)
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
                          <span
                            className={`mc-badge ${
                              test.active ? "mc-badge--success" : "mc-badge--danger"
                            }`}
                          >
                            {test.active ? "Available" : "Unavailable"}
                          </span>
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
