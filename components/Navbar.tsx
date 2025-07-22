"use client";

import Link from "next/link";
import { useState } from "react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Clean Navbar matching reference image */}
      <nav className="relative bg-white border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Borse Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-black">Borse</span>
            </Link>

            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                href="/pricing"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                Contact
              </Link>
            </div>

            {/* Start Chatting Button */}
            <div className="hidden md:flex items-center">
              <Link
                href="/video-chat"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Start chatting
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <MenuIcon isOpen={isMobileMenuOpen} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? "max-h-64 opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="px-4 py-2 space-y-1 bg-white border-t border-gray-100">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/pricing"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/about"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              Contact
            </Link>
            <div className="pt-2">
              <Link
                href="/video-chat"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium text-center transition-colors"
              >
                Start chatting
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

// Simple Menu Icon
const MenuIcon = ({ isOpen }: { isOpen: boolean }) => (
  <div className="w-5 h-5 flex flex-col justify-center items-center">
    <div
      className={`w-5 h-0.5 bg-gray-600 transition-all duration-300 ${
        isOpen ? "rotate-45 translate-y-0.5" : ""
      }`}
    ></div>
    <div
      className={`w-5 h-0.5 bg-gray-600 transition-all duration-300 mt-0.5 ${
        isOpen ? "opacity-0" : ""
      }`}
    ></div>
    <div
      className={`w-5 h-0.5 bg-gray-600 transition-all duration-300 mt-0.5 ${
        isOpen ? "-rotate-45 -translate-y-1" : ""
      }`}
    ></div>
  </div>
);

export default Navbar;
