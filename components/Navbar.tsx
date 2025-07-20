"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (navRef.current) {
        const rect = navRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Floating Navigation Container */}
      <div className="fixed top-3 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl pb-36 px-4">
        <nav
          ref={navRef}
          className={`relative overflow-hidden transition-all duration-500 ease-out ${
            isScrolled
              ? "bg-black/30 border-white/20 shadow-xl shadow-violet-500/5"
              : "bg-black/20 border-white/10"
          } backdrop-blur-xl border rounded-full`}
          style={{
            background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.03), transparent 50%)`,
          }}
        >
          <div className="relative z-10 flex items-center justify-between px-6 py-3">
            {/* Minimal Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center text-sm group-hover:scale-110 transition-transform duration-300">
                💬
              </div>
              <span className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
                DevChat
              </span>
            </Link>

            {/* Minimal Navigation Pills */}
            <div className="hidden md:flex items-center space-x-1">
              <NavPill href="/" active>
                Home
              </NavPill>
              <NavPill href="/rooms">Rooms</NavPill>
              <NavPill href="/about">About</NavPill>
              <NavPill href="/community">Community</NavPill>
            </div>

            {/* Minimal Live Indicator & CTA */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                <span>1.2k</span>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors duration-300 flex items-center justify-center"
            >
              <MenuIcon isOpen={isMobileMenuOpen} />
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Menu - Minimal Dropdown */}
      <div
        className={`fixed top-16 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-sm px-4 transition-all duration-300 ease-out ${
          isMobileMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="bg-black/30 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
          <div className="space-y-2">
            <MobileNavItem
              href="/"
              active
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </MobileNavItem>
            <MobileNavItem
              href="/rooms"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Rooms
            </MobileNavItem>
            <MobileNavItem
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </MobileNavItem>
            <MobileNavItem
              href="/community"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Community
            </MobileNavItem>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                <span>1.2k online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for floating nav */}
      <div className="h-16"></div>
    </>
  );
};

// Minimal Navigation Pills
const NavPill = ({
  href,
  children,
  active = false,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) => (
  <Link
    href={href}
    className={`relative px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
      active
        ? "text-white bg-white/10"
        : "text-white/60 hover:text-white/90 hover:bg-white/5"
    }`}
  >
    {children}
    {active && (
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600/20 to-cyan-400/20"></div>
    )}
  </Link>
);

// Mobile Navigation Items
const MobileNavItem = ({
  href,
  children,
  active = false,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) => (
  <Link
    href={href}
    onClick={onClick}
    className={`block text-sm font-medium transition-all duration-300 px-3 py-2 rounded-xl ${
      active
        ? "text-white bg-gradient-to-r from-violet-600/20 to-cyan-400/20"
        : "text-white/70 hover:text-white hover:bg-white/5"
    }`}
  >
    {children}
  </Link>
);

// Simple Menu Icon
const MenuIcon = ({ isOpen }: { isOpen: boolean }) => (
  <div className="w-4 h-4 flex flex-col justify-center items-center">
    <div
      className={`w-4 h-0.5 bg-white/70 transition-all duration-300 ${
        isOpen ? "rotate-45 translate-y-0.5" : ""
      }`}
    ></div>
    <div
      className={`w-4 h-0.5 bg-white/70 transition-all duration-300 mt-0.5 ${
        isOpen ? "opacity-0" : ""
      }`}
    ></div>
    <div
      className={`w-4 h-0.5 bg-white/70 transition-all duration-300 mt-0.5 ${
        isOpen ? "-rotate-45 -translate-y-1" : ""
      }`}
    ></div>
  </div>
);

export default Navbar;
