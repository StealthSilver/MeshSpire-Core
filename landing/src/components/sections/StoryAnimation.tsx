import HeroIllustration from "@/components/sections/HeroIllustration";

const StoryAnimation = () => {
  return (
    <section className="relative w-full py-20 flex flex-col items-center justify-center overflow-hidden bg-[var(--background)] transition-colors duration-700">
      <HeroIllustration />
    </section>
  );
};

export default StoryAnimation;
