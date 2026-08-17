"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const EMERGENCY_CONTACTS = [
  { label: "Ambulance", value: "108" },
  { label: "Police", value: "100" },
  { label: "MedConnect Helpline", value: "1800-233-4455" },
];

export default function EmergencyPage() {
  const [sosActive, setSosActive] = useState(false);

  function handleSos() {
    setSosActive(true);
  }

  return (
    <>
      <Navbar />
      <main>
        <section className="mc-emergency-page">
          <div className="mc-emergency-page__inner">
            <p
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: ".1em",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              Emergency Centre
            </p>
            <h1
              style={{
                fontSize: "clamp(28px, 4vw, 44px)",
                fontWeight: 800,
                marginTop: "12px",
              }}
            >
              Help is one tap away.
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(255,255,255,0.6)",
                maxWidth: "480px",
                margin: "16px auto 0",
                lineHeight: 1.6,
              }}
            >
              Press the SOS button to simulate sending your location to the
              nearest available ambulance and hospital. In a real emergency,
              always call your local emergency number directly.
            </p>

            <button
              type="button"
              className="mc-sos-btn"
              onClick={handleSos}
              aria-label="Send SOS emergency alert"
            >
              <span style={{ fontSize: "28px" }} aria-hidden="true">
                🚨
              </span>
              SOS
            </button>

            {sosActive && (
              <p
                style={{
                  color: "#7fd9b9",
                  fontSize: "14px",
                  fontWeight: 600,
                  marginBottom: "24px",
                }}
                role="status"
              >
                Demo alert sent — nearest hospital and ambulance would be
                notified with your location in the live platform.
              </p>
            )}

            <div className="mc-emergency-contacts">
              {EMERGENCY_CONTACTS.map((contact) => (
                <div key={contact.label} className="mc-emergency-contact">
                  <div className="mc-emergency-contact__label">
                    {contact.label}
                  </div>
                  <div className="mc-emergency-contact__value">
                    {contact.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
