"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ProfileData,
  INTERESTS_OPTIONS,
  LOOKING_FOR_OPTIONS,
  PROFILE_STEPS,
} from "../../types/profile";

export default function ProfilePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    age: "",
    interests: [],
    bio: "",
    lookingFor: "",
  });

  const progress = ((currentStep + 1) / PROFILE_STEPS.length) * 100;

  // Auto-save to localStorage
  useEffect(() => {
    const saved = localStorage.getItem("userProfile");
    if (saved) {
      try {
        const parsedProfile = JSON.parse(saved);
        setProfile(parsedProfile);
      } catch (error) {
        console.error("Failed to parse saved profile:", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("userProfile", JSON.stringify(profile));
  }, [profile]);

  const nextStep = () => {
    if (currentStep < PROFILE_STEPS.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleInterestToggle = (interest: string) => {
    setProfile((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest].slice(0, 8), // Max 8 interests
    }));
  };

  const handleComplete = () => {
    // Validate final profile
    if (!canProceed()) return;

    // Save complete profile
    const completeProfile = {
      ...profile,
      completedAt: new Date().toISOString(),
      profileComplete: true,
    };

    localStorage.setItem("userProfile", JSON.stringify(completeProfile));

    // Add some celebration before redirect
    setTimeout(() => {
      router.push("/video-chat");
    }, 1000);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return profile.name.trim().length >= 2;
      case 1:
        return (
          profile.age.trim().length > 0 &&
          parseInt(profile.age) >= 13 &&
          parseInt(profile.age) <= 100
        );
      case 2:
        return profile.interests.length >= 1;
      case 3:
        return (
          profile.bio.trim().length >= 10 && profile.bio.trim().length <= 500
        );
      case 4:
        return profile.lookingFor.length > 0;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <input
              type="text"
              value={profile.name}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter your name..."
              className="w-full px-6 py-4 text-xl bg-[#1f1f23] border-2 border-[#6366F1]/30 rounded-xl focus:border-[#6366F1] focus:outline-none text-[#F1F5F9] placeholder-[#94A3B8] transition-all duration-300"
              autoFocus
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <input
              type="number"
              value={profile.age}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, age: e.target.value }))
              }
              placeholder="Enter your age..."
              min="13"
              max="100"
              className="w-full px-6 py-4 text-xl bg-[#1f1f23] border-2 border-[#6366F1]/30 rounded-xl focus:border-[#6366F1] focus:outline-none text-[#F1F5F9] placeholder-[#94A3B8] transition-all duration-300"
              autoFocus
            />
            <p className="text-[#94A3B8] text-sm">
              You must be at least 13 years old to use this platform
            </p>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <p className="text-[#94A3B8] text-lg text-center">
              Select up to 8 interests that describe you:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {INTERESTS_OPTIONS.map((interest, index) => (
                <button
                  key={interest}
                  onClick={() => handleInterestToggle(interest)}
                  disabled={
                    !profile.interests.includes(interest) &&
                    profile.interests.length >= 8
                  }
                  className={`p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 text-sm font-medium ${
                    profile.interests.includes(interest)
                      ? "border-[#6366F1] bg-[#6366F1]/20 text-[#F1F5F9] animate-pulse-soft"
                      : profile.interests.length >= 8
                      ? "border-[#6366F1]/10 bg-[#1f1f23]/50 text-[#94A3B8]/50 cursor-not-allowed"
                      : "border-[#6366F1]/30 bg-[#1f1f23] text-[#94A3B8] hover:border-[#6366F1]/60 hover:text-[#F1F5F9]"
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {interest}
                </button>
              ))}
            </div>
            <div className="text-center">
              <p className="text-[#94A3B8] text-sm">
                Selected:{" "}
                <span className="text-[#6366F1] font-semibold">
                  {profile.interests.length}
                </span>
                /8 interests
              </p>
              {profile.interests.length >= 8 && (
                <p className="text-[#FACC15] text-xs mt-1">
                  Maximum interests reached
                </p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <textarea
              value={profile.bio}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, bio: e.target.value }))
              }
              placeholder="Tell us a bit about yourself, your projects, or what you're passionate about... 

Example: 'I'm a full-stack developer passionate about creating user-friendly applications. Currently working on a React project and love discussing new technologies!'"
              rows={8}
              maxLength={500}
              className="w-full px-6 py-4 text-lg bg-[#1f1f23] border-2 border-[#6366F1]/30 rounded-xl focus:border-[#6366F1] focus:outline-none text-[#F1F5F9] placeholder-[#94A3B8] transition-all duration-300 resize-none"
              autoFocus
            />
            <div className="flex justify-between items-center">
              <p
                className={`text-sm transition-colors duration-300 ${
                  profile.bio.length < 10
                    ? "text-[#F87171]"
                    : profile.bio.length > 450
                    ? "text-[#FACC15]"
                    : "text-[#94A3B8]"
                }`}
              >
                {profile.bio.length}/500 characters{" "}
                {profile.bio.length < 10 ? "(minimum 10)" : ""}
              </p>
              <div className="flex gap-2">
                {profile.bio.length >= 10 && (
                  <span className="text-green-400">✓</span>
                )}
                {profile.bio.length >= 50 && (
                  <span className="text-green-400">✓</span>
                )}
                {profile.bio.length >= 100 && (
                  <span className="text-green-400">✓</span>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <p className="text-[#94A3B8] text-lg">
              What brings you here today?
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {LOOKING_FOR_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() =>
                    setProfile((prev) => ({ ...prev, lookingFor: option }))
                  }
                  className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 text-left ${
                    profile.lookingFor === option
                      ? "border-[#6366F1] bg-[#6366F1]/20 text-[#F1F5F9]"
                      : "border-[#6366F1]/30 bg-[#1f1f23] text-[#94A3B8] hover:border-[#6366F1]/60"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen overflow-hidden flex flex-col items-center justify-center relative">
      {/* Background */}
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

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-[#F1F5F9] to-[#6366F1] bg-clip-text text-transparent">
              Complete Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-[#FACC15] to-[#F1F5F9] bg-clip-text text-transparent">
              Profile
            </span>
          </h1>
          <p className="text-[#94A3B8] text-lg">
            Help us match you with the right people
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#94A3B8] text-sm">
              Step {currentStep + 1} of {PROFILE_STEPS.length}
            </span>
            <span className="text-[#6366F1] text-sm font-semibold">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-[#1f1f23] rounded-full h-3 overflow-hidden">
            <div
              className="gradient-button h-3 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div
          className={`bg-[#1f1f23]/80 backdrop-blur-sm border border-[#6366F1]/30 rounded-2xl p-8 mb-8 transition-all duration-300 animate-fade-in-up ${
            isAnimating ? "opacity-50 scale-95" : "opacity-100 scale-100"
          }`}
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-[#F1F5F9] mb-2">
              {PROFILE_STEPS[currentStep].title}
            </h2>
            {PROFILE_STEPS[currentStep].subtitle && (
              <p className="text-[#94A3B8] text-lg">
                {PROFILE_STEPS[currentStep].subtitle}
              </p>
            )}
          </div>

          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
              currentStep === 0
                ? "bg-[#1f1f23] text-[#94A3B8] cursor-not-allowed"
                : "bg-[#1f1f23] border border-[#6366F1]/30 text-[#F1F5F9] hover:border-[#6366F1] hover:scale-105"
            }`}
          >
            Back
          </button>

          {currentStep === PROFILE_STEPS.length - 1 ? (
            <button
              onClick={handleComplete}
              disabled={!canProceed()}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                canProceed()
                  ? "bg-gradient-to-r from-[#6366F1] to-[#FACC15] text-white hover:scale-105 shadow-lg hover:shadow-[#6366F1]/25"
                  : "bg-[#1f1f23] text-[#94A3B8] cursor-not-allowed"
              }`}
            >
              Start Chatting! 🚀
            </button>
          ) : (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className={`px-8 py-3 rounded-xl font-semibold transition-all cursor-pointer duration-300 ${
                canProceed()
                  ? "bg-gradient-to-r from-[#6366F1] to-[#FACC15] text-white hover:scale-105 shadow-lg hover:shadow-[#6366F1]/25"
                  : "bg-[#1f1f23] text-[#94A3B8] cursor-not-allowed"
              }`}
            >
              Next →
            </button>
          )}
        </div>

        {/* Fun Stats */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center gap-4 text-[#94A3B8] text-sm">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#6366F1] to-[#14B8A6] rounded-full border-2 border-[#0f0f11] shadow-lg"></div>
              <div className="w-8 h-8 bg-gradient-to-br from-[#14B8A6] to-[#FACC15] rounded-full border-2 border-[#0f0f11] shadow-lg"></div>
              <div className="w-8 h-8 bg-gradient-to-br from-[#FACC15] to-[#6366F1] rounded-full border-2 border-[#0f0f11] shadow-lg"></div>
            </div>
            <span className="font-mono">
              <span className="text-[#6366F1] font-bold">1,247</span> builders
              waiting to chat
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
