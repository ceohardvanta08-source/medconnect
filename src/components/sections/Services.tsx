import type { ServiceCard } from "@/types";
import { ExternalIcon } from "@/components/icons";

const SERVICE_CARDS: ServiceCard[] = [
  {
    icon: "🩺",
    title: "Doctor Consultation",
    desc: "Find specialists, view profiles and request appointments.",
  },
  {
    icon: "🏥",
    title: "Hospital Services",
    desc: "Explore departments, facilities and available care.",
  },
  {
    icon: "🚑",
    title: "Emergency Support",
    desc: "Quick access to emergency guidance and ambulance assistance.",
  },
  {
    icon: "💉",
    title: "Diagnostics",
    desc: "Keep tests, reports and prescriptions organised in one place.",
  },
];

export default function Services() {
  return (
    <section id="services" className="mc-services">
      {/* Heading row */}
      <div className="mc-services__head">
        <div>
          <p className="mc-eyebrow">Our Services</p>
          <h2 className="mc-h2">
            Healthcare without
            <br />
            the <span className="mc-accent">hassle.</span>
          </h2>
        </div>
        <p className="mc-services__right-text">
          Inspired by an all-in-one care model, MedConnect brings patients,
          doctors and hospital services into one clear experience.
        </p>
      </div>

      {/* Cards */}
      <div className="mc-services__grid">
        {SERVICE_CARDS.map((card) => (
          <div key={card.title} className="mc-service-card">
            <div className="mc-service-card__icon" aria-hidden="true">
              {card.icon}
            </div>
            <h3 className="mc-service-card__title">{card.title}</h3>
            <p className="mc-service-card__desc">{card.desc}</p>
            <span className="mc-service-card__link">
              Explore <ExternalIcon />
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
