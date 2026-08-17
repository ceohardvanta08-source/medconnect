import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import QuickBar from "@/components/sections/QuickBar";
import Services from "@/components/sections/Services";
import PortalSection from "@/components/sections/PortalSection";
import Emergency from "@/components/sections/Emergency";
import About from "@/components/sections/About";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <QuickBar />
      <Services />
      <PortalSection />
      <Emergency />
      <About />
      <Footer />
    </>
  );
}
