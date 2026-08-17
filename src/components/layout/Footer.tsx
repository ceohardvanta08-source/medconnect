import Link from "next/link";
import { PlusIcon } from "@/components/icons";

const FOOTER_COLUMNS: {
  title: string;
  links: { label: string; href: string }[];
}[] = [
  {
    title: "Platform",
    links: [
      { label: "Services", href: "/#services" },
      { label: "Patient portal", href: "/patient/dashboard" },
      { label: "Doctor portal", href: "/doctor/dashboard" },
      { label: "Hospital directory", href: "/hospitals" },
      { label: "Register a hospital", href: "/login" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Emergency", href: "/emergency" },
      { label: "About", href: "/#about" },
      { label: "Contact", href: "/#contact" },
    ],
  },
  {
    title: "Demo",
    links: [
      { label: "Login", href: "/login" },
      { label: "Emergency centre", href: "/emergency" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mc-footer">
      <div className="mc-footer__inner">
        {/* Brand column */}
        <div>
          <div className="mc-footer__logo">
            <span className="mc-footer__logo-icon">
              <PlusIcon />
            </span>
            <span className="mc-footer__logo-name">MedConnect</span>
          </div>
          <p className="mc-footer__tagline">
            Connected healthcare for patients, doctors and hospitals.
          </p>
        </div>

        {/* Link columns */}
        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title}>
            <p className="mc-footer__col-title">{column.title}</p>
            <ul className="mc-footer__links">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="mc-footer__bottom">
        <p className="mc-footer__copy">© {year} MedConnect Demo</p>
        <p className="mc-footer__disclaimer">
          Designed as a product prototype — not a medical service.
        </p>
      </div>
    </footer>
  );
}
