import Cta from "@/components/sections/Cta";
import Features from "@/components/sections/Features";
import Footer from "@/components/sections/Footer";
import Hero from "@/components/sections/Hero";
import Navbar from "../components/sections/Navbar";
import Services from "@/components/sections/Services";
import Testimonial from "@/components/sections/Testimonial";

export default function Home() {
  return (
    <main className="bg-[var(--background)]">
      <Navbar />
      <Hero />
      <Services />
      <Features />
      <Testimonial />
      <Cta />
      <Footer />
    </main>
  );
}
