"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import type { ServiceCard } from "@/types";

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

// The card list is duplicated once so the strip can scroll forever without
// a visible seam — when the first copy scrolls out of view, we silently
// snap back by exactly one copy's width and keep going.
const MARQUEE_CARDS = [...SERVICE_CARDS, ...SERVICE_CARDS];

export default function Services() {
  const trackRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const movedRef = useRef(false);

  const [isDragging, setIsDragging] = useState(false);

  // Continuous, gentle auto-scroll. Pauses whenever the pointer is over the
  // strip or actively dragging it, and resumes the moment it isn't.
  // Speed is slightly reduced on phones, since cards take up proportionally
  // more of a narrow screen and a "desktop" speed feels too fast there.
  useEffect(() => {
    let frameId: number;
    let speed = window.innerWidth <= 640 ? 0.4 : 0.6;

    function handleResize() {
      speed = window.innerWidth <= 640 ? 0.4 : 0.6;
    }
    window.addEventListener("resize", handleResize);

    function step() {
      const el = trackRef.current;
      if (el && !isPausedRef.current && !isDraggingRef.current) {
        el.scrollLeft += speed;
        const halfWidth = el.scrollWidth / 2;
        if (el.scrollLeft >= halfWidth) {
          el.scrollLeft -= halfWidth;
        }
      }
      frameId = requestAnimationFrame(step);
    }
    frameId = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    const track = trackRef.current;
    if (!track) return;
    isDraggingRef.current = true;
    movedRef.current = false;
    setIsDragging(true);
    dragStartXRef.current = event.clientX;
    dragStartScrollRef.current = track.scrollLeft;
    track.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const track = trackRef.current;
    if (!track || !isDraggingRef.current) return;
    const delta = event.clientX - dragStartXRef.current;
    if (Math.abs(delta) > 3) movedRef.current = true;
    track.scrollLeft = dragStartScrollRef.current - delta;
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    const track = trackRef.current;
    isDraggingRef.current = false;
    setIsDragging(false);
    if (track) {
      try {
        track.releasePointerCapture(event.pointerId);
      } catch {
        // no-op — pointer capture may already have been released
      }
    }
  }

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

      {/* Structural CSS only — no colors touched, those still come from the
         existing .mc-service-card / .mc-h2 / .mc-eyebrow styles. Mobile-first:
         base rules below target phones, then min-width queries widen things
         up for tablet and laptop. */}
      <style>{`
        .mc-services__viewport {
          position: relative;
          overflow: hidden;
          -webkit-mask-image: linear-gradient(to right, transparent, black 20px, black calc(100% - 20px), transparent);
          mask-image: linear-gradient(to right, transparent, black 20px, black calc(100% - 20px), transparent);
        }
        .mc-services__track {
          display: flex;
          gap: 14px;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          touch-action: pan-y;
          -webkit-overflow-scrolling: touch;
          padding: 4px 2px 10px;
        }
        .mc-services__track::-webkit-scrollbar {
          display: none;
        }
        /* Phones (default): one full card plus a peek of the next */
        .mc-services__track .mc-service-card {
          flex: 0 0 auto;
          user-select: none;
          width: 80vw;
          max-width: 300px;
        }
        /* Tablets */
        @media (min-width: 641px) {
          .mc-services__viewport {
            -webkit-mask-image: linear-gradient(to right, transparent, black 36px, black calc(100% - 36px), transparent);
            mask-image: linear-gradient(to right, transparent, black 36px, black calc(100% - 36px), transparent);
          }
          .mc-services__track {
            gap: 20px;
            padding: 4px 2px 12px;
          }
          .mc-services__track .mc-service-card {
            width: 260px;
            max-width: none;
          }
        }
        /* Laptop / desktop */
        @media (min-width: 1024px) {
          .mc-services__viewport {
            -webkit-mask-image: linear-gradient(to right, transparent, black 48px, black calc(100% - 48px), transparent);
            mask-image: linear-gradient(to right, transparent, black 48px, black calc(100% - 48px), transparent);
          }
          .mc-services__track {
            gap: 24px;
          }
          .mc-services__track .mc-service-card {
            width: 300px;
          }
        }

        /* Phones only: stack the heading and intro text instead of side by
           side, and let the headline scale down so it never overflows a
           narrow screen. Tablet/laptop are left exactly as they already are. */
        @media (max-width: 767px) {
          #services .mc-services__head {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 14px;
          }
          #services .mc-h2 {
            font-size: clamp(26px, 8vw, 34px);
            line-height: 1.15;
          }
          #services .mc-services__right-text {
            font-size: 14px;
            max-width: 100%;
          }
        }
      `}</style>

      {/* Cards — auto-scrolls continuously, pauses on hover, and can be
         dragged left/right; releasing it lets it drift again. */}
      <div
        className="mc-services__viewport"
        onMouseEnter={() => {
          isPausedRef.current = true;
        }}
        onMouseLeave={() => {
          isPausedRef.current = false;
          isDraggingRef.current = false;
          setIsDragging(false);
        }}
      >
        <div
          ref={trackRef}
          className="mc-services__grid mc-services__track"
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {MARQUEE_CARDS.map((card, index) => (
            <div key={`${card.title}-${index}`} className="mc-service-card">
              <div className="mc-service-card__icon" aria-hidden="true">
                {card.icon}
              </div>
              <h3 className="mc-service-card__title">{card.title}</h3>
              <p className="mc-service-card__desc">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}