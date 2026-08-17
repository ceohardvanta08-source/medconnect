"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

type LoginRole = "patient" | "doctor";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<LoginRole>("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setError(null);
    // Phase 1 demo: no real authentication yet — routes straight to the
    // relevant dashboard. Phase 2 wires this up to NextAuth + a database.
    router.push(role === "patient" ? "/patient/dashboard" : "/doctor/dashboard");
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

          <div className="mc-auth__role-toggle" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={role === "patient"}
              className={`mc-auth__role-btn ${
                role === "patient" ? "mc-auth__role-btn--active" : ""
              }`}
              onClick={() => setRole("patient")}
            >
              Patient
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={role === "doctor"}
              className={`mc-auth__role-btn ${
                role === "doctor" ? "mc-auth__role-btn--active" : ""
              }`}
              onClick={() => setRole("doctor")}
            >
              Doctor
            </button>
          </div>

          {error && <div className="mc-auth__error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
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
              Log in as {role === "patient" ? "Patient" : "Doctor"}
            </button>
          </form>

          <p className="mc-auth__footer">
            This is a Phase 1 demo — no account is required.{" "}
            <br />
            Any email and password will work.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
