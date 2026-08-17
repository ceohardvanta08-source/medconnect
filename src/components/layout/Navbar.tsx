"use client";

import Link from "next/link";
import { useState } from "react";
import { PlusIcon, MenuIcon, CloseIcon } from "@/components/icons";

const NAV_LINKS = [
  { href: "/#home", label: "Home" },
  { href: "/#services", label: "Services" },
  { href: "/#portal", label: "Portal" },
  { href: "/emergency", label: "Emergency" },
  { href: "/#about", label: "About" },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="mc-nav">
      <div className="mc-nav__inner">
        {/* Logo */}
        <Link href="/" className="mc-nav__logo">
          <span className="mc-nav__logo-icon">
            <PlusIcon />
          </span>
          Med<span>Connect</span>
        </Link>

        {/* Desktop links */}
        <ul className="mc-nav__links">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <Link href="/login" className="mc-nav__btn mc-nav__btn--desktop">
          Login
        </Link>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="mc-nav__toggle"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {isMenuOpen && (
        <div className="mc-nav__mobile">
          <ul className="mc-nav__mobile-links">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={() => setIsMenuOpen(false)}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/login"
            className="mc-nav__btn"
            onClick={() => setIsMenuOpen(false)}
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}
