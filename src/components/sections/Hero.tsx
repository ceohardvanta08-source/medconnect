import Link from "next/link";
import { ArrowRightIcon, PlusIcon, UserIcon } from "@/components/icons";

export default function Hero() {
  return (
    <section id="home">
      <div className="mc-hero">
        {/* LEFT */}
        <div className="mc-hero__left">
          <p className="mc-eyebrow">Healthcare, connected around you</p>

          <h1 className="mc-h1 mc-hero__title">
            One simple place for
            <br />
            your <span className="mc-accent">healthcare</span>
            <br />
            journey.
          </h1>

          <p className="mc-hero__desc">
            Connect with doctors, discover hospital services, manage your
            care and reach emergency support without jumping between
            different systems.
          </p>

          <div className="mc-hero__ctas">
            <Link href="/#portal" className="mc-btn mc-btn--primary">
              Get started <ArrowRightIcon />
            </Link>
            <Link href="/emergency" className="mc-btn mc-btn--outline">
              Emergency help
            </Link>
          </div>

          <div className="mc-hero__badges">
            <span className="mc-hero__badge">Patient-first</span>
            <span className="mc-hero__badge">Doctor access</span>
            <span className="mc-hero__badge">Emergency ready</span>
          </div>
        </div>

        {/* RIGHT — health portal card mock */}
        <div className="mc-hero__right">
          {/* Teal glow blob */}
          <div className="mc-hero__blob" aria-hidden="true" />

          {/* Floating: Emergency badge */}
          <div className="mc-hero__float mc-hero__float--emergency">
            <span aria-hidden="true" style={{ fontSize: "18px" }}>
              🚑
            </span>
            <div>
              <div className="mc-hero__float-label">Emergency</div>
              <div>24/7 assistance</div>
            </div>
          </div>

          {/* Main card */}
          <div className="mc-hero__card">
            {/* Card header */}
            <div className="mc-hero__card-head">
              <div className="mc-hero__card-brand">
                <div className="mc-hero__card-brand-dot">
                  <PlusIcon />
                </div>
                MEDCONNECT
              </div>
              <div className="mc-hero__card-online">Online</div>
            </div>

            {/* Portal info */}
            <div className="mc-hero__portal-user">
              <div className="mc-hero__avatar">
                <UserIcon />
              </div>
              <div>
                <div className="mc-hero__portal-label">Your Health Portal</div>
                <div className="mc-hero__portal-title">
                  Everything in one place
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mc-hero__card-stats">
              <div className="mc-hero__stat">
                <div className="mc-hero__stat-num">12</div>
                <div className="mc-hero__stat-lbl">Reports</div>
              </div>
              <div className="mc-hero__stat">
                <div className="mc-hero__stat-num">04</div>
                <div className="mc-hero__stat-lbl">Appointments</div>
              </div>
              <div className="mc-hero__stat">
                <div className="mc-hero__stat-num">03</div>
                <div className="mc-hero__stat-lbl">Prescriptions</div>
              </div>
            </div>

            {/* Upcoming consultation */}
            <div className="mc-hero__consult">
              <div className="mc-hero__consult-date">
                <div className="mc-hero__consult-date-num">18</div>
                <div className="mc-hero__consult-date-mon">AUG</div>
              </div>
              <div className="mc-hero__consult-info">
                <div className="mc-hero__consult-tag">
                  Upcoming Consultation
                </div>
                <div className="mc-hero__consult-name">General Physician</div>
              </div>
              <ArrowRightIcon />
            </div>
          </div>

          {/* Floating: Doctor network */}
          <div className="mc-hero__float mc-hero__float--doctor">
            <span aria-hidden="true" style={{ fontSize: "18px" }}>
              🩺
            </span>
            <div>
              <div className="mc-hero__float-label">Doctor Network</div>
              <div>Verified specialists</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
