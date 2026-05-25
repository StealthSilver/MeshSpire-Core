import React from "react";
import Link from "next/link";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer
      id="footer"
      className="overflow-x-hidden font-[var(--font-secondary)] py-6 px-4 mt-20 top-10 flex items-center 
                 text-[var(--color-font)] max-w-7xl mx-auto justify-center 
                 flex-col gap-4 rounded-3xl shadow-sm border border-[var(--foreground)]/10
                 transition-colors duration-700"
    >
      <div className="flex flex-col items-center justify-center">
        <div className="mt-10">
          <Link href="/">
            <img
              src="/logos/ms_dark.svg"
              alt="Meshspire logo"
              width={250}
              height={100}
              className="hidden dark:block"
            />
            <img
              src="/logos/ms_light.svg"
              alt="Meshspire logo"
              width={250}
              height={100}
              className="block dark:hidden"
            />
          </Link>
        </div>

        {/* Nav Links */}
        <div className="flex flex-wrap justify-center items-center font-catamaran gap-4 md:gap-8 sm:gap-16 mt-12 text-sm sm:text-base">
          <Link
            href="#services"
            className="text-[var(--color-font)]/70 font-medium tracking-tight hover:text-[var(--color-font)] transition-all duration-300"
          >
            Services
          </Link>
          <Link
            href="#features"
            className="text-[var(--color-font)]/70 font-medium tracking-tight hover:text-[var(--color-font)] transition-all duration-300"
          >
            Features
          </Link>
          <Link
            href="#testimonials"
            className="text-[var(--color-font)]/70 font-medium tracking-tight hover:text-[var(--color-font)] transition-all duration-300"
          >
            Testimonials
          </Link>
          <Link
            href="#contact"
            className="text-[var(--color-font)]/70 font-medium tracking-tight hover:text-[var(--color-font)] transition-all duration-300"
          >
            Contact us
          </Link>
        </div>
      </div>

      {/* Social Icons */}
      <div className="flex items-center justify-center gap-[40px] text-[var(--color-font)]/60 mt-10 text-xl">
        <a
          href="https://github.com/StealthSilver"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Github className="w-6 h-6 hover:text-[var(--color-font)] transition-colors duration-300" />
        </a>
        <a
          href="https://x.com/Rajat_0409"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Twitter className="w-6 h-6 hover:text-[var(--color-font)] transition-colors duration-300" />
        </a>
        <a href="mailto:rajat.saraswat.0409@gmail.com">
          <Mail className="w-6 h-6 hover:text-[var(--color-font)] transition-colors duration-300" />
        </a>
        <a
          href="https://www.linkedin.com/in/rajat-saraswat-0491a3259/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Linkedin className="w-6 h-6 hover:text-[var(--color-font)] transition-colors duration-300" />
        </a>
      </div>

      {/* Divider */}
      <div className="w-[85%] sm:w-[65%] h-[0.5px] bg-[var(--foreground)]/20 mt-8" />

      {/* Copyright */}
      <p className="text-sm text-[var(--color-font)]/60">
        &copy; {new Date().getFullYear()} MeshSpire. All rights reserved
      </p>
    </footer>
  );
};

export default Footer;
