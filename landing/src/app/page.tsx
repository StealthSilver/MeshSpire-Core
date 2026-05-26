import Cta from "@/components/sections/Cta";
import Features from "@/components/sections/Features";
import Footer from "@/components/sections/Footer";
import Hero from "@/components/sections/Hero";
import Navbar from "../components/sections/Navbar";
import Services from "@/components/sections/Services";
import StoryAnimation from "@/components/sections/StoryAnimation";
import Testimonial from "@/components/sections/Testimonial";

export default function Home() {
  return (
    <main className="bg-[var(--background)] text-[var(--color-font)] transition-colors duration-700">
      <Navbar />
      <Hero />
      <StoryAnimation />
      <Services />
      <Features />
      <Testimonial />
      <Cta />
      <Footer />
    </main>
  );
}
