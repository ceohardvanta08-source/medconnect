import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";

export default function Emergency() {
  return (
    <section id="emergency" className="mc-emergency-wrap">
      <div className="mc-emergency">
        <div>
          <p className="mc-emergency__eyebrow">Emergency Centre</p>
          <h2 className="mc-emergency__title">
            When every second matters,
            <br />
            <span className="mc-emergency__accent">
              make the next step obvious.
            </span>
          </h2>
          <p className="mc-emergency__desc">
            Keep emergency guidance, hospital contact information and
            ambulance assistance one tap away.
          </p>
          <div className="mc-emergency__ctas">
            <Link href="/emergency" className="mc-btn mc-btn--white">
              Open emergency centre <ArrowRightIcon />
            </Link>
            <span className="mc-emergency__note">
              Available 24/7 in the demo
            </span>
          </div>
        </div>

        {/* Circle icon */}
        <div className="mc-emergency__icon-wrap" aria-hidden="true">
          <span>🚑</span>
          <div className="mc-emergency__icon-label">
            Emergency
            <br />
            Help Centre
          </div>
        </div>
      </div>
    </section>
  );
}
