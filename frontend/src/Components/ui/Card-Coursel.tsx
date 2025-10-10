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
      <div className="relative w-full">
        <div
          className="flex w-full overflow-x-scroll scroll-smooth no-scrollbar mb-8"
          ref={carouselRef}
          onScroll={checkScrollability}
        >
          <div className="flex flex-row justify-start gap-4 max-w-7xl">
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
                className="rounded-xl"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mr-10 flex justify-end gap-2">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 disabled:opacity-50"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
          >
            <IconArrowNarrowLeft className="h-6 w-6 text-gray-500" />
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 disabled:opacity-50"
            onClick={scrollRight}
            disabled={!canScrollRight}
          >
            <IconArrowNarrowRight className="h-6 w-6 text-gray-500" />
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
  //@ts-ignore
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
      <div className="flex items-center space-x-1">
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
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 h-screen overflow-auto flex items-center justify-center px-4">
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
              className="relative z-[60] w-full max-w-3xl rounded-2xl
                backdrop-blur-lg bg-slate-900/60 border border-white/20
                shadow-2xl p-8 text-white"
            >
              <button
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white"
                onClick={handleClose}
              >
                <IconX className="h-5 w-5" />
              </button>

              <div className="flex flex-col items-start space-y-4">
                <motion.p className="text-sm font-medium text-gray-300">
                  {card.category} {renderStars(card.rating)}
                </motion.p>
                <motion.p className="text-3xl md:text-4xl font-semibold text-white">
                  {card.title}
                </motion.p>

                <div className="text-gray-200">{card.content}</div>

                <button
                  onClick={handleNavigate}
                  className="px-8 py-2 font-medium text-white rounded-2xl
                    bg-gradient-to-r from-violet-900 via-violet-800 to-violet-900
                    hover:bg-violet-900 transition-all duration-300"
                >
                  Join
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div
        onClick={handleOpen}
        className="relative flex flex-col w-[480px] h-[350px] p-6 rounded-2xl
          backdrop-blur-lg bg-slate-900/60 border border-white/20 shadow-lg hover:shadow-xl
          transition-all duration-300 ease-in-out cursor-pointer"
      >
        <div className="w-40 h-40 rounded-2xl overflow-hidden mb-4">
          <img
            src={card.src}
            alt={card.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col">
          <p className="text-2xl font-semibold text-white drop-shadow-sm">
            {card.title}
          </p>
          <div className="flex justify-between items-center text-m text-gray-300 tracking-wide">
            <span>{card.category}</span>
            {renderStars(card.rating)}
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={handleNavigate}
            className="px-8 py-2 mr-8 font-medium text-white rounded-xl
              bg-gradient-to-r from-violet-900 via-violet-800 to-violet-900
              hover:bg-violet-700 transition-all duration-300 cursor-pointer"
          >
            Start Now
          </button>
          <button
            onClick={handleOpen}
            className="px-8 py-2 font-medium text-white rounded-xl
              bg-gradient-to-r from-gray-800 via-gray-800 to-gray-800
              hover:bg-violet-700 transition-all duration-300 cursor-pointer"
          >
            Get Info
          </button>
        </div>
      </motion.div>
    </>
  );
};
