import React, { useRef, useState, useEffect } from "react";
import { IconArrowNarrowLeft, IconArrowNarrowRight } from "@tabler/icons-react";

interface LessonCarouselProps {
  children: React.ReactNode[];
}

const LessonCarousel: React.FC<LessonCarouselProps> = ({ children }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    checkScrollability();
  }, [children]);

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -400, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 400, behavior: "smooth" });
    }
  };

  if (children.length === 0) return null;

  return (
    <div className="relative w-full">
      {/* Carousel Container */}
      <div
        className="flex w-full overflow-x-auto overflow-y-hidden scroll-smooth no-scrollbar mb-6 px-2 sm:px-0"
        ref={carouselRef}
        onScroll={checkScrollability}
      >
        <div className="flex flex-row gap-5">
          {children.map((child, index) => (
            <div key={index} className="flex-shrink-0">
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {children.length > 1 && (
        <div className="flex justify-center sm:justify-end gap-3 mr-0 sm:mr-10 mt-4">
          <button
            className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center 
                       rounded-full bg-gradient-to-br from-slate-800 to-slate-700 
                       border border-emerald-500/20 hover:border-emerald-500/40
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition-all hover:shadow-lg hover:shadow-emerald-500/20
                       active:scale-95 group"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
          >
            <IconArrowNarrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
          </button>
          <button
            className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center 
                       rounded-full bg-gradient-to-br from-slate-800 to-slate-700 
                       border border-emerald-500/20 hover:border-emerald-500/40
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition-all hover:shadow-lg hover:shadow-emerald-500/20
                       active:scale-95 group"
            onClick={scrollRight}
            disabled={!canScrollRight}
          >
            <IconArrowNarrowRight className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
          </button>
        </div>
      )}
    </div>
  );
};

export default LessonCarousel;
