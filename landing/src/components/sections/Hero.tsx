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
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10">
        <hr className="border-t border-[var(--foreground)]/10" />
      </div>
    </section>
  );
};

export default Hero;
