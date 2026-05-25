import Cta from "@/components/sections/Cta";
import Features from "@/components/sections/Features";
import Footer from "@/components/sections/Footer";
import Hero from "@/components/sections/Hero";
import Navbar from "../components/sections/Navbar";
import Services from "@/components/sections/Services";
import Testimonial from "@/components/sections/Testimonial";

export default function Home() {
  return (
    <main className="bg-[var(--background)] text-[var(--color-font)] transition-colors duration-700">
      <Navbar />
      <div className="relative">
        <div
          className="fixed inset-0 z-0 [background-size:20px_20px] [background-image:radial-gradient(#d4d4d4_1px,transparent_1px)] dark:[background-image:radial-gradient(#404040_1px,transparent_1px)] dark:opacity-40"
        />
        <div className="relative z-10">
          <Hero />
          <Services />
          <Features />
          <Testimonial />
          <Cta />
          <Footer />
        </div>
      </div>
    </main>
  );
}
