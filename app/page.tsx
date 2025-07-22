"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

const Page = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <section
      className="relative min-h-screen overflow-hidden flex flex-col bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url(/background.png)" }}
    >
      {/* Navigation Bar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-black/90 backdrop-blur-md shadow-lg"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-[#4F7DFF] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <span className="text-white font-bold text-xl hidden sm:block">
                  ChatConnect
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="flex items-center space-x-8">
                <Link
                  href="/about"
                  className="text-white/80 hover:text-white transition-colors duration-200 font-medium"
                >
                  About
                </Link>
                <Link href="/profile">
                  <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg">
                    Start Chat
                  </button>
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="text-white hover:text-gray-300 transition-colors duration-200 p-2"
                aria-label="Toggle menu"
              >
                <div className="w-6 h-6 relative">
                  <span
                    className={`absolute block w-6 h-0.5 bg-current transform transition-all duration-300 ${
                      isMenuOpen ? "rotate-45 top-3" : "top-1"
                    }`}
                  ></span>
                  <span
                    className={`absolute block w-6 h-0.5 bg-current top-3 transform transition-all duration-300 ${
                      isMenuOpen ? "opacity-0" : "opacity-100"
                    }`}
                  ></span>
                  <span
                    className={`absolute block w-6 h-0.5 bg-current transform transition-all duration-300 ${
                      isMenuOpen ? "-rotate-45 top-3" : "top-5"
                    }`}
                  ></span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            isMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-black/95 backdrop-blur-md border-t border-white/10">
            <div className="px-4 pt-4 pb-6 space-y-4">
              <Link
                href="/about"
                className="block text-white/80 hover:text-white transition-colors duration-200 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                <button className="w-full bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg">
                  Start Chat
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center px-6 flex-1 flex flex-col items-center justify-center pt-20 lg:pt-0">
        {/* Hero Image */}
        <div className="mb-8 flex justify-center">
          <img
            src="/heroimg.png"
            alt="Chat bubbles illustration"
            className="w-80 h-64 object-contain animate-bounce-slow"
          />
        </div>

        {/* Main heading */}
        <div className="mb-8">
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight text-white animate-fade-in-up">
            Connect & chat
            <br />
            with like-minded builders
          </h1>

          <p className="text-[#A0AEC0] text-lg lg:text-xl mb-12 max-w-xl mx-auto leading-relaxed animate-fade-in-up animation-delay-300">
            Random video calls for fun and networking
          </p>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center animate-fade-in-up animation-delay-600">
          <Link href="/profile">
            <button className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-gray-700/25">
              Start chatting
            </button>
          </Link>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
          opacity: 0;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
          opacity: 0;
        }
      `}</style>
    </section>
  );
};

export default Page;
