import Link from "next/link";

interface QuickBarItem {
  icon: string;
  title: string;
  sub: string;
  href: string;
}

const QUICK_ITEMS: QuickBarItem[] = [
  { icon: "🩺", title: "Find a doctor", sub: "Search by specialty", href: "/#services" },
  { icon: "📅", title: "Book appointment", sub: "Request a consultation", href: "/patient/appointments" },
  { icon: "🚑", title: "Emergency support", sub: "Get help quickly", href: "/emergency" },
  { icon: "📋", title: "Health records", sub: "Organise your care", href: "/patient/dashboard" },
];

export default function QuickBar() {
  return (
    <div className="mc-quickbar">
      <div className="mc-quickbar__inner">
        {QUICK_ITEMS.map((item) => (
          <Link key={item.title} href={item.href} className="mc-quickbar__item">
            <div className="mc-quickbar__icon" aria-hidden="true">
              {item.icon}
            </div>
            <div>
              <div className="mc-quickbar__title">{item.title}</div>
              <div className="mc-quickbar__sub">{item.sub}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
