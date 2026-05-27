import dynamic from "next/dynamic";
import Hero from "@/components/sections/Hero";
import Navbar from "../components/sections/Navbar";
import SectionSkeleton from "@/components/ui/SectionSkeleton";

const StoryAnimation = dynamic(
  () => import("@/components/sections/StoryAnimation"),
  { loading: () => <SectionSkeleton minHeight="32rem" /> },
);

const Features = dynamic(() => import("@/components/sections/Features"), {
  loading: () => <SectionSkeleton minHeight="48rem" />,
});

const Services = dynamic(() => import("@/components/sections/Services"), {
  loading: () => <SectionSkeleton minHeight="40rem" />,
});

const StudentsSection = dynamic(
  () => import("@/components/sections/StudentsSection"),
  { loading: () => <SectionSkeleton minHeight="36rem" /> },
);

const FAQ = dynamic(() => import("@/components/sections/FAQ"), {
  loading: () => <SectionSkeleton minHeight="28rem" />,
});

const CTA = dynamic(() => import("@/components/sections/Cta"), {
  loading: () => <SectionSkeleton minHeight="20rem" />,
});

const Footer = dynamic(() => import("@/components/sections/Footer"), {
  loading: () => <SectionSkeleton minHeight="12rem" />,
});

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
