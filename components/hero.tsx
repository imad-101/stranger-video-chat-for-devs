import React from "react";
import Link from "next/link";
import Navbar from "./Navbar";

const Hero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center">
      <div className="absolute inset-0">
        <div className="absolute inset-0 -z-10 h-full w-full bg-black [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#6366F1_100%)]"></div>

        <svg
          className="absolute inset-x-0 bottom-0 w-full h-32 -z-10"
          viewBox="0 0 1440 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            fill="#6366F1"
            fillOpacity="0.3"
            d="M0,224L60,197.3C120,171,240,117,360,117.3C480,117,600,171,720,197.3C840,224,960,224,1080,197.3C1200,171,1320,117,1380,90.7L1440,64L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          />
        </svg>
      </div>

      <Navbar />

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center px-6">
        <div className="mb-8">
          <h1 className="text-6xl lg:text-8xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-[#F1F5F9] to-[#6366F1] bg-clip-text text-transparent">
              Random Chats.
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#FACC15] to-[#F1F5F9] bg-clip-text text-transparent">
              Real Builders.
            </span>
          </h1>

          <p className="text-[#94A3B8] text-xl lg:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            Jump into instant conversations with developers, indie hackers, and
            founders.
            <br className="hidden lg:block" />
            <span className="text-[#acaef4] font-semibold">
              Code together. Share ideas. Build the future.
            </span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
          <Link href="/profile">
            <button className=" cursor-pointer group relative outline-1 outline-[#FACC15] text-white px-5 py-3 rounded-xl font-bold text-xl hover:scale-105 transition-all duration-300 ease-out">
              <span className="relative z-10 flex items-center gap-3">
                Start Chatting
                <span className="text-2xl">🚀</span>
              </span>
            </button>
          </Link>

          <div className="flex items-center gap-4 text-[#94A3B8] text-lg">
            <div className="flex -space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#6366F1] to-[#14B8A6] rounded-full border-2 border-[#0f0f11] shadow-lg"></div>
              <div className="w-10 h-10 bg-gradient-to-br from-[#14B8A6] to-[#FACC15] rounded-full border-2 border-[#0f0f11] shadow-lg"></div>
              <div className="w-10 h-10 bg-gradient-to-br from-[#FACC15] to-[#6366F1] rounded-full border-2 border-[#0f0f11] shadow-lg"></div>
            </div>
            <span className="font-mono text-sm">
              <span className="text-[#6366F1] font-bold">1,247</span> builders
              online
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
