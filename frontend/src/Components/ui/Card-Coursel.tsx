"use client";
import React, {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
  type JSX,
} from "react";
import {
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconX,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "../../hooks/useOutsideClick";
import { useNavigate } from "react-router-dom";

interface CarouselProps {
  items: JSX.Element[];
  initialScroll?: number;
}

type CardType = {
  src: string;
  title: string;
  category: string;
  rating: number;
  content: React.ReactNode;
};

export const CarouselContext = createContext<{
  onCardClose: (index: number) => void;
  currentIndex: number;
}>({
  onCardClose: () => {},
  currentIndex: 0,
});

export const Carousel = ({ items, initialScroll = 0 }: CarouselProps) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
      checkScrollability();
    }
  }, [initialScroll]);

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const scrollLeft = () =>
    carouselRef.current?.scrollBy({ left: -600, behavior: "smooth" });
  const scrollRight = () =>
    carouselRef.current?.scrollBy({ left: 600, behavior: "smooth" });

  const handleCardClose = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = 500;
      const gap = 8;
      const scrollPosition = (cardWidth + gap) * (index + 1);
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  return (
    <CarouselContext.Provider
      value={{ onCardClose: handleCardClose, currentIndex }}
    >
      <div className="relative w-full  ">
        {/* Carousel Container */}
        <div
          className="flex w-full overflow-x-auto scroll-smooth no-scrollbar mb-6 sm:mb-8 px-2 sm:px-0"
          ref={carouselRef}
          onScroll={checkScrollability}
        >
          <div className="flex flex-row justify-start gap-3 sm:gap-4 max-w-7xl">
            {items.map((item, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    delay: 0.2 * index,
                    ease: "easeOut",
                  },
                }}
                key={"card" + index}
                className="rounded-xl flex-shrink-0"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="flex justify-center sm:justify-end gap-3 mr-0 sm:mr-10">
          <button
            className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-slate-700 border border-emerald-500/20 hover:border-emerald-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
          >
            <IconArrowNarrowLeft className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400 hover:text-emerald-300 transition-colors" />
          </button>
          <button
            className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-slate-700 border border-emerald-500/20 hover:border-emerald-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95"
            onClick={scrollRight}
            disabled={!canScrollRight}
          >
            <IconArrowNarrowRight className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400 hover:text-emerald-300 transition-colors" />
          </button>
        </div>
      </div>
    </CarouselContext.Provider>
  );
};

export const Card = ({
  card,
  index,
}: {
  card: CardType;
  index: number;
  layout?: boolean;
}) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { onCardClose } = useContext(CarouselContext);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") handleClose();
    }
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // @ts-ignore
  useOutsideClick(containerRef, () => handleClose());

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    onCardClose(index);
  };
  const handleNavigate = () => {
    setOpen(false);
    navigate("/meeting", {
      state: {
        title: card.title,
        category: card.category,
        rating: card.rating,
      },
    });
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
      <div className="flex items-center space-x-1 text-xs sm:text-sm">
        {Array(fullStars)
          .fill(0)
          .map((_, i) => (
            <span key={`full-${i}`} className="text-yellow-400">
              ★
            </span>
          ))}
        {halfStar && <span className="text-yellow-400">☆</span>}
        {Array(emptyStars)
          .fill(0)
          .map((_, i) => (
            <span key={`empty-${i}`} className="text-gray-500">
              ★
            </span>
          ))}
      </div>
    );
  };

  return (
    <>
      {/* Expanded Modal */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 h-screen overflow-auto flex items-center justify-center px-3 sm:px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 h-full w-full bg-black/80 backdrop-blur-lg"
            />
            <motion.div
              ref={containerRef}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-[60] w-full max-w-sm sm:max-w-2xl md:max-w-3xl rounded-2xl
                backdrop-blur-lg bg-slate-900/60 border border-white/20
                shadow-2xl p-5 sm:p-8 text-white"
            >
              <button
                className="absolute top-3 right-3 sm:top-4 sm:right-4 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gray-900 text-white"
                onClick={handleClose}
              >
                <IconX className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>

              <div className="flex flex-col items-start space-y-3 sm:space-y-4">
                <motion.p className="text-xs sm:text-sm font-medium text-gray-300 flex items-center gap-2">
                  {card.category} {renderStars(card.rating)}
                </motion.p>
                <motion.p className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white">
                  {card.title}
                </motion.p>

                <div className="text-gray-200 text-sm sm:text-base">
                  {card.content}
                </div>

                <button
                  onClick={handleNavigate}
                  className="px-6 sm:px-8 py-2 sm:py-2.5 font-medium text-white rounded-2xl
                    bg-gradient-to-r from-violet-900 via-violet-800 to-violet-900
                    hover:bg-violet-900 transition-all duration-300 text-sm sm:text-base"
                >
                  Join
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Card Preview */}
      <motion.div
        onClick={handleOpen}
        className="relative flex flex-col w-[280px] sm:w-[380px] md:w-[440px] h-[240px] sm:h-[260px] md:h-[280px] p-4 sm:p-5 rounded-xl
          backdrop-blur-lg bg-slate-900/60 border border-white/20 shadow-lg hover:shadow-xl
          transition-all duration-300 ease-in-out cursor-pointer flex-shrink-0"
      >
        <div className="flex items-start gap-4 mb-3">
          <div className="w-16 sm:w-20 md:w-24 h-16 sm:h-20 md:h-24 rounded-xl overflow-hidden shadow-lg ring-2 ring-white/5 flex-shrink-0">
            <img
              src={card.src}
              alt={card.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <p className="text-base sm:text-lg font-bold text-white leading-tight truncate">
              {card.title}
            </p>
            <p className="text-xs sm:text-sm text-gray-300 mt-1">
              {card.category}
            </p>
            <div className="mt-2">{renderStars(card.rating)}</div>
          </div>
        </div>

        <div className="mt-auto flex gap-2">
          <button
            onClick={handleNavigate}
            className="flex-1 px-4 py-2 font-medium text-white rounded-lg
              bg-gradient-to-r from-emerald-600 to-green-600
              hover:from-emerald-500 hover:to-green-500 transition-all duration-300 text-xs sm:text-sm"
          >
            Start Now
          </button>
          <button
            onClick={handleOpen}
            className="flex-1 px-4 py-2 font-medium text-white rounded-lg
              bg-slate-700 hover:bg-slate-600 transition-all duration-300 text-xs sm:text-sm"
          >
            Get Info
          </button>
        </div>
      </motion.div>
    </>
  );
};
