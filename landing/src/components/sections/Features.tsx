"use client";

import React from "react";
import { Icon } from "../ui/Icon";
import { useTheme } from "next-themes";

// Import all icons as React components (SVGR will handle this)
import EaseIcon from "@/icons/ease.svg";
import CloudIcon from "@/icons/cloud.svg";
import FastIcon from "@/icons/fast.svg";
import HeartIcon from "@/icons/heart.svg";
import RefundIcon from "@/icons/refund.svg";
import MoneyIcon from "@/icons/money.svg";
import TutorIcon from "@/icons/tutor.svg";
import ClusterIcon from "@/icons/cluster.svg";

const Content = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const cardData = [
    {
      icon: EaseIcon,
      title: "Ease of use",
      description:
        "It's as easy as using an Apple, but not as expensive as buying one.",
    },
    {
      icon: CloudIcon,
      title: "100% uptime",
      description: "We can’t be taken down by anyone",
    },
    {
      icon: FastIcon,
      title: "The fastest",
      description: "We will connect you to your tutors in limited time",
    },
    {
      icon: HeartIcon,
      title: "Student first",
      description: "Students are the priority, always and every time",
    },
    {
      icon: RefundIcon,
      title: "Money back",
      description: "If we can’t serve you. You need not pay",
    },
    {
      icon: MoneyIcon,
      title: "Best pricing",
      description: "Lowest learning prices. We don’t overcharge",
    },
    {
      icon: TutorIcon,
      title: "Quality tutors",
      description: "We will match you to the best quality tutors",
    },
    {
      icon: ClusterIcon,
      title: "Learning cluster",
      description: "You just need one app for all your learning",
    },
  ];

  return (
    <section
      id="features"
      className="
        overflow-x-hidden md:mt-10 py-10 md:py-12 px-4 flex flex-col items-center justify-center mx-4 
        rounded-2xl md:gap-12 md:mb-16
        transition-colors duration-700
        bg-[var(--background)] text-[var(--color-font)]
      "
    >
      {/* Title */}
      <div
        className="
          border-2 flex flex-col items-start mx-auto p-3 md:p-4 relative mb-25
          border-[var(--foreground)]/20 bg-[var(--background)]/60
          transition-colors duration-700
        "
      >
        <Icon className="absolute h-6 w-6 -top-3 -left-3 text-[var(--color-font)]/70 transition-colors" />
        <Icon className="absolute h-6 w-6 -bottom-3 -left-3 text-[var(--color-font)]/70 transition-colors" />
        <Icon className="absolute h-6 w-6 -top-3 -right-3 text-[var(--color-font)]/70 transition-colors" />
        <Icon className="absolute h-6 w-6 -bottom-3 -right-3 text-[var(--color-font)]/70 transition-colors" />

        <h2
          className="
            text-2xl md:text-2xl lg:text-3xl 
            font-[var(--font-primary)] 
            transition-colors duration-700
            text-[var(--color-font)]
          "
        >
          Why MeshSpire?
        </h2>
      </div>

      {/* Cards */}
      <div className="flex flex-col max-w-7xl">
        {/* Top row */}
        <div className="flex flex-wrap justify-center items-start">
          {cardData.slice(0, 4).map((card, index) => {
            const IconComp = card.icon;
            return (
              <div
                key={index}
                className="
                  group w-[25%] min-w-[250px] h-[180px] p-6 relative flex flex-col 
                  items-start overflow-hidden 
                  border-l border-r border-b 
                  border-[var(--foreground)]/20 transition-colors duration-700
                "
              >
                {/* Hover overlay */}
                <div
                  className={`
                    absolute inset-0 opacity-0 group-hover:opacity-100 
                    transition-all duration-150 pointer-events-none z-0
                    ${
                      isDark
                        ? "bg-gradient-to-br from-[var(--hover-dark)] to-black"
                        : "bg-gradient-to-br from-[var(--hover-light)] to-[var(--background)]/10"
                    }
                  `}
                />
                {/* Left Accent Line */}
                <div className="absolute left-0 top-[22px] w-[6px] h-[30px] rounded-tr-sm rounded-br-sm z-10 bg-[var(--color-font)] transition-colors" />

                {/* SVG Icon */}
                <IconComp className="w-10 h-10 text-[var(--color-font)] relative z-10" />

                <h2
                  className="
                    text-lg md:text-2xl font-[var(--font-primary)] mb-2 mt-2 z-10 
                    transition-colors duration-700
                    text-[var(--color-font)]
                  "
                >
                  {card.title}
                </h2>
                <p
                  className="
                    text-sm md:text-base opacity-90 font-[var(--font-secondary)] z-10 
                    transition-colors duration-700
                    text-[var(--color-font)]/70
                  "
                >
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom row */}
        <div className="flex flex-wrap justify-center items-start">
          {cardData.slice(4, 8).map((card, index) => {
            const IconComp = card.icon;
            return (
              <div
                key={index}
                className="
                  group w-[25%] min-w-[250px] h-[180px] p-6 relative flex flex-col 
                  items-start overflow-hidden 
                  border-l border-r border-t 
                  border-[var(--foreground)]/20 transition-colors duration-700
                "
              >
                {/* Hover overlay */}
                <div
                  className={`
                    absolute inset-0 opacity-0 group-hover:opacity-100 
                    transition-all duration-150 pointer-events-none z-0
                    ${
                      isDark
                        ? "bg-gradient-to-br from-[var(--hover-dark)] to-black"
                        : "bg-gradient-to-br from-[var(--hover-light)] to-[var(--background)]/10"
                    }
                  `}
                />
                {/* Left Accent Line */}
                <div className="absolute left-0 top-[22px] w-[6px] h-[30px] rounded-tr-sm rounded-br-sm z-10 bg-[var(--color-font)] transition-colors" />

                {/* SVG Icon */}
                <IconComp className="w-10 h-10 text-[var(--color-font)] dark:text-white relative z-10" />

                <h2
                  className="
                            text-lg md:text-2xl font-[var(--font-primary)] mb-2 mt-2 z-10 
                    transition-colors duration-700
                    text-[var(--color-font)]
                  "
                >
                  {card.title}
                </h2>
                <p
                  className="
                    text-sm md:text-base opacity-90 font-[var(--font-secondary)] z-10 
                    transition-colors duration-700
                    text-[var(--color-font)]/70
                  "
                >
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Content;
