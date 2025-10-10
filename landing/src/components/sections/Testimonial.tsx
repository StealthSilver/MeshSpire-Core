import React from "react";
import { InfiniteMovingCards } from "@/components/ui/InfiniteMovingCards";
import { Icon } from "@/components/ui/Icon";

const testimonials = [
  {
    quote: "Amazing library, super fast setup!",
    name: "Jane Doe",
    title: "CEO, Example Co.",
  },
  {
    quote: "Loved the animations and design.",
    name: "John Smith",
    title: "Founder, Another Co.",
  },
  {
    quote: "Amazing library, super fast setup!",
    name: "Jane Doe",
    title: "CEO, Example Co.",
  },
  {
    quote: "Loved the animations and design.",
    name: "John Smith",
    title: "Founder, Another Co.",
  },
  {
    quote: "Amazing library, super fast setup!",
    name: "Jane Doe",
    title: "CEO, Example Co.",
  },
  {
    quote: "Loved the animations and design.",
    name: "John Smith",
    title: "Founder, Another Co.",
  },
  {
    quote: "Amazing library, super fast setup!",
    name: "Jane Doe",
    title: "CEO, Example Co.",
  },
  {
    quote: "Loved the animations and design.",
    name: "John Smith",
    title: "Founder, Another Co.",
  },
];

export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="py-12 px-4 md:mt-24 flex flex-col items-center justify-center mx-4 
                  bg-[var(--background)] text-[var(--color-font)] rounded-2xl md:gap-10 overflow-x-hidden
                 dark:bg-black"
    >
      <div className="flex flex-col items-center justify-center gap-2 mb-12">
        <div
          className="border border-gray-300 flex flex-col items-center md:items-start mx-auto p-2 md:p-6 max-w-xs md:max-w-none relative 
                dark:border-white/[0.2]"
        >
          <Icon className="absolute h-6 w-6 -top-3 -left-3 text-gray-600 dark:text-white" />
          <Icon className="absolute h-6 w-6 -bottom-3 -left-3 text-gray-600 dark:text-white" />
          <Icon className="absolute h-6 w-6 -top-3 -right-3 text-gray-600 dark:text-white" />
          <Icon className="absolute h-6 w-6 -bottom-3 -right-3 text-gray-600 dark:text-white" />

          <h2
            className="text-2xl md:text-2xl lg:text-3xl 
                 font-[var(--font-primary)] 
                 transition-colors duration-700
                 text-[var(--color-font)]
                 text-center md:text-left"
          >
            Loved by people everywhere
          </h2>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center md:max-w-none">
        <InfiniteMovingCards
          items={testimonials}
          direction="left"
          speed="fast"
          pauseOnHover={false}
          className="max-w-[600px] md:max-w-[1300px] font-[var(--font-primary)] "
        />
        <InfiniteMovingCards
          items={testimonials}
          direction="right"
          speed="fast"
          pauseOnHover={false}
          className="max-w-[600px] md:max-w-[1300px] font-[var(--font-primary)] "
        />
      </div>
    </section>
  );
}
