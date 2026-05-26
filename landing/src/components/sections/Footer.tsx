"use client";

import React from "react";
import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { ThemeSwitcher } from "../ui/ThemeSwitcher";

const Footer = () => {

  const navLinks = [
    { name: "Transition", href: "#transition" },
    { name: "Platform", href: "#platform" },
    { name: "Features", href: "#features" },
    { name: "Students", href: "#students" },
  ];

  const socialLinks = [
    { icon: Github, href: "https://github.com/StealthSilver/MeshSpire-Core", label: "GitHub" },
    { icon: FaXTwitter, href: "https://x.com/silver_srs", label: "X" },
    { icon: Mail, href: "mailto:saraswatrajat12@gmail.com", label: "Email" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/rajat-saraswat-0491a3259/", label: "LinkedIn" },
  ];

  return (
    <footer
      id="contact"
      className="relative w-full pt-6 pb-6 bg-[var(--background)] transition-colors duration-700 border-t border-[var(--foreground)]/10"
    >
      {/* Logo centered on top border */}
      <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-0 bg-[var(--background)] px-4">
        <Link href="/">
          <img
            src="/logos/logo_l.svg"
            alt="Meshspire logo"
            className="w-20 h-auto"
          />
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Left — Social | Right — Navigation (just below the top border) */}
        <div className="flex items-center justify-between pt-4 pb-12">
          {/* Left — Social */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => {
              const IconComp = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-[#0F172A]/50 dark:text-[#F5F7FA]/50 hover:text-[#0F172A] dark:hover:text-[#F5F7FA] transition-colors duration-200"
                >
                  <IconComp size={18} />
                </a>
              );
            })}
          </div>

          {/* Right — Navigation */}
          <div className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="font-[var(--font-secondary)] text-sm font-light text-[#0F172A]/70 dark:text-[#F5F7FA]/70 hover:text-[#0F172A] dark:hover:text-[#F5F7FA] transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Center — Brand name */}
        <div className="flex flex-col items-center pb-12">
          <span className="text-7xl tracking-tight text-[#0F172A] dark:text-[#F5F7FA]" style={{ fontFamily: "var(--font-inter-tight)", fontWeight: 200 }}>
            MeshSpire
          </span>
        </div>
      </div>

      <hr className="w-full border-t border-[var(--foreground)]/10" />

      {/* Bottom bar */}
      <div className="relative max-w-7xl mx-auto px-6 flex items-center justify-between pt-4">
        <p className="font-[var(--font-secondary)] text-xs font-light text-[#0F172A]/40 dark:text-[#F5F7FA]/40">
          &copy; {new Date().getFullYear()} MeshSpire. All rights reserved.
        </p>
        <div className="absolute left-1/2 -translate-x-1/2">
          <ThemeSwitcher />
        </div>
        <p className="font-[var(--font-secondary)] text-xs font-light text-[#0F172A]/40 dark:text-[#F5F7FA]/40">
          Crafted by{" "}
          <a
            href="https://silverstudios.art"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-font)] hover:underline transition-all duration-200"
          >
            Silver Studios
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
