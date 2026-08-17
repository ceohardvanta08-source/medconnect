import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MedConnect — Connected Healthcare",
  description:
    "One simple place for your healthcare journey. Connect with doctors, discover hospital services, manage your care and reach emergency support.",
  keywords: [
    "MedConnect",
    "healthcare platform",
    "doctor appointment",
    "hospital services",
    "emergency support",
    "patient portal",
  ],
  authors: [{ name: "MedConnect" }],
  openGraph: {
    title: "MedConnect — Connected Healthcare",
    description:
      "One simple place for your healthcare journey. Connect with doctors, discover hospital services, manage your care and reach emergency support.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0d3d35",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
