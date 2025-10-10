import React from "react";
import Link from "next/link";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer
      id="footer"
      className="overflow-x-hidden font-[var(--font-secondary)] py-6 px-4 mt-20 top-10 flex items-center 
                 bg-[var(--hover-light)] text-[var(--color-font)] max-w-7xl mx-auto justify-center 
                 flex-col gap-4 rounded-3xl shadow-sm
                 dark:bg-slate-900 "
    >
      <div className="flex flex-col items-center justify-center">
        <div className="mt-10">
          <Link href="/">
            <img
              src="/logo_dark.svg"
              alt="Dashboard dark"
              width={250}
              height={100}
              className="dark:block hidden"
            />
            <img
              src="/logo_light.svg"
              alt="Dashboard light"
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
            className="text-gray-600 font-medium tracking-tight hover:text-black transition-all duration-300 dark:text-slate-400 dark:hover:text-white"
          >
            Services
          </Link>
          <Link
            href="#features"
            className="text-gray-600 font-medium tracking-tight hover:text-black transition-all duration-300 dark:text-slate-400 dark:hover:text-white"
          >
            Features
          </Link>
          <Link
            href="#testimonials"
            className="text-gray-600 font-medium tracking-tight hover:text-black transition-all duration-300 dark:text-slate-400 dark:hover:text-white"
          >
            Testimonials
          </Link>
          <Link
            href="#contact"
            className="text-gray-600 font-medium tracking-tight hover:text-black transition-all duration-300 dark:text-slate-400 dark:hover:text-white"
          >
            Contact us
          </Link>
        </div>
      </div>

      {/* Social Icons */}
      <div className="flex items-center justify-center gap-[40px] text-gray-500 mt-10 text-xl dark:text-slate-400">
        <a
          href="https://github.com/StealthSilver"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Github className="w-6 h-6 hover:text-black transition-colors duration-300 dark:hover:text-white" />
        </a>
        <a
          href="https://x.com/Rajat_0409"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Twitter className="w-6 h-6 hover:text-black transition-colors duration-300 dark:hover:text-white" />
        </a>
        <a href="mailto:rajat.saraswat.0409@gmail.com">
          <Mail className="w-6 h-6 hover:text-black transition-colors duration-300 dark:hover:text-white" />
        </a>
        <a
          href="https://www.linkedin.com/in/rajat-saraswat-0491a3259/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Linkedin className="w-6 h-6 hover:text-black transition-colors duration-300 dark:hover:text-white" />
        </a>
      </div>

      {/* Divider */}
      <div className="w-[85%] sm:w-[65%] h-[0.5px] bg-gray-300 mt-8 dark:bg-slate-600" />

      {/* Copyright */}
      <p className="text-sm text-gray-500 dark:text-slate-400">
        &copy; {new Date().getFullYear()} MeshSpire. All rights reserved
      </p>
    </footer>
  );
};

export default Footer;
