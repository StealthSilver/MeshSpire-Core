import Link from "next/link";

const Hero = () => {
  return (
    <section
      id="home"
      className="
        relative w-full min-h-screen
        flex flex-col items-center justify-center
        overflow-hidden
        text-[var(--color-font)]
        transition-colors duration-700
      "
    >
      <div
        className="absolute inset-0 z-0
          [background-size:56px_56px]
          [background-image:radial-gradient(#d4d4d4_1.4px,transparent_1.4px)]
          dark:[background-image:radial-gradient(#404040_1.4px,transparent_1.4px)]
          dark:opacity-40
        "
      />

      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-[var(--background)] via-transparent to-[var(--background)]" />

      <div className="mt-10 relative z-10 max-w-4xl mx-auto flex flex-col items-center justify-center pt-6 px-4">
        <div className="mt-4 md:mt-20 flex flex-col items-center gap-3">
          <span className="inline-block rounded-full bg-[var(--foreground)]/[0.06] border border-[var(--foreground)]/10 px-4 py-1.5 text-xs font-[var(--font-secondary)] text-[var(--color-font)]/60 tracking-wide mb-4">
            The future of personalized learning
          </span>

          <h1 className="md:text-6xl lg:text-7xl text-4xl font-[var(--font-primary)] text-center leading-[1.1] tracking-tight">
            Find Your Perfect Tutor
          </h1>
          <h1 className="md:text-6xl lg:text-7xl text-4xl font-[var(--font-primary)] text-center leading-[1.1] tracking-tight">
            Teach Your Perfect Student
          </h1>
        </div>

        <p className="md:text-lg text-base font-[var(--font-secondary)] pt-8 text-center text-[var(--color-font)]/60 max-w-xl leading-relaxed">
          A next-gen freelancing platform connecting students with tutors who
          match their learning style — empowering teachers to grow their income
          and impact.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center pt-10 gap-4">
          <Link
            href="https://meshspire-core.vercel.app/"
            className="
              bg-[var(--color-primary)] text-[var(--background)] dark:text-[var(--foreground)]
              border border-[var(--color-primary)]
              rounded-full px-8 py-2.5
              font-[var(--font-secondary)] text-sm md:text-base font-medium
              transition-all duration-300
              hover:shadow-[0_6px_24px_rgba(var(--color-primary-rgb,255,166,41),0.3)]
              hover:brightness-110
            "
          >
            Get Started
          </Link>

          <Link
            href="#footer"
            className="
              bg-[var(--background)] text-[var(--color-font)]
              border border-[var(--foreground)]/20
              rounded-full px-8 py-2.5
              font-[var(--font-secondary)] text-sm md:text-base font-medium
              transition-all duration-300
              hover:bg-[var(--foreground)]/[0.06] hover:border-[var(--foreground)]/30
            "
          >
            Contact us
          </Link>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10">
        <hr className="border-t border-[var(--foreground)]/10" />
      </div>
    </section>
  );
};

export default Hero;
