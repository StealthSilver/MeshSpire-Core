import CTA from "@/components/sections/Cta";
import FAQ from "@/components/sections/FAQ";
import Features from "@/components/sections/Features";
import Footer from "@/components/sections/Footer";
import Hero from "@/components/sections/Hero";
import Navbar from "../components/sections/Navbar";
import Services from "@/components/sections/Services";
import StoryAnimation from "@/components/sections/StoryAnimation";
import StudentsSection from "@/components/sections/StudentsSection";

export default function Home() {
  return (
    <main className="bg-[var(--background)] text-[var(--color-font)] transition-colors duration-700">
      <Navbar />
      <Hero />
      <StoryAnimation />
      <Services />
      <Features />
      <StudentsSection />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
