"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle, Users } from "lucide-react";
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

  // Auto-save to in-memory state (localStorage removed for Claude compatibility)
  useEffect(() => {
    // Profile data will persist in component state during session
  }, []);

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
              className="w-full px-6 py-4 text-xl bg-background border-2 border-input rounded-xl focus:border-primary focus:outline-none text-foreground placeholder-muted-foreground transition-all duration-300"
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
              className="w-full px-6 py-4 text-xl bg-background border-2 border-input rounded-xl focus:border-primary focus:outline-none text-foreground placeholder-muted-foreground transition-all duration-300"
              autoFocus
            />
            <p className="text-muted-foreground text-sm">
              You must be at least 13 years old to use this platform
            </p>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <p className="text-muted-foreground text-lg text-center">
              Select up to 8 interests that describe you:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {INTERESTS_OPTIONS.map((interest, index) => (
                <motion.button
                  key={interest}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleInterestToggle(interest)}
                  disabled={
                    !profile.interests.includes(interest) &&
                    profile.interests.length >= 8
                  }
                  className={`p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 text-sm font-medium ${
                    profile.interests.includes(interest)
                      ? "border-primary bg-primary/20 text-foreground"
                      : profile.interests.length >= 8
                      ? "border-input/50 bg-background/50 text-muted-foreground/50 cursor-not-allowed"
                      : "border-input bg-background text-muted-foreground hover:border-primary/60 hover:text-foreground"
                  }`}
                >
                  {interest}
                </motion.button>
              ))}
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-sm">
                Selected:{" "}
                <span className="text-primary font-semibold">
                  {profile.interests.length}
                </span>
                /8 interests
              </p>
              {profile.interests.length >= 8 && (
                <p className="text-yellow-500 text-xs mt-1">
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
              className="w-full px-6 py-4 text-lg bg-background border-2 border-input rounded-xl focus:border-primary focus:outline-none text-foreground placeholder-muted-foreground transition-all duration-300 resize-none"
              autoFocus
            />
            <div className="flex justify-between items-center">
              <p
                className={`text-sm transition-colors duration-300 ${
                  profile.bio.length < 10
                    ? "text-red-400"
                    : profile.bio.length > 450
                    ? "text-yellow-500"
                    : "text-muted-foreground"
                }`}
              >
                {profile.bio.length}/500 characters{" "}
                {profile.bio.length < 10 ? "(minimum 10)" : ""}
              </p>
              <div className="flex gap-2">
                {profile.bio.length >= 10 && (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                )}
                {profile.bio.length >= 50 && (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                )}
                {profile.bio.length >= 100 && (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <p className="text-muted-foreground text-lg">
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
                      ? "border-primary bg-primary/20 text-foreground"
                      : "border-input bg-background text-muted-foreground hover:border-primary/60"
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
    <div className="min-h-[100dvh] flex flex-col items-center justify-center">
      {/* Background with grid pattern matching landing page */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Complete Your Profile
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Help us match you with the right people
            </p>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground text-sm">
                Step {currentStep + 1} of {PROFILE_STEPS.length}
              </span>
              <span className="text-primary text-sm font-semibold">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-primary/70 h-3 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </motion.div>

          {/* Question Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`bg-background/80 backdrop-blur-sm border border-border rounded-2xl p-8 mb-8 shadow-2xl transition-all duration-300 ${
              isAnimating ? "opacity-50 scale-95" : "opacity-100 scale-100"
            }`}
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                {PROFILE_STEPS[currentStep].title}
              </h2>
              {PROFILE_STEPS[currentStep].subtitle && (
                <p className="text-muted-foreground text-lg">
                  {PROFILE_STEPS[currentStep].subtitle}
                </p>
              )}
            </div>

            {renderStep()}
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-between items-center mb-8"
          >
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                currentStep === 0
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-background border border-input text-foreground hover:bg-accent hover:scale-105"
              }`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>

            {currentStep === PROFILE_STEPS.length - 1 ? (
              <button
                onClick={handleComplete}
                disabled={!canProceed()}
                className={`inline-flex items-center justify-center px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  canProceed()
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 shadow-lg"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                Start Chatting! 🚀
              </button>
            ) : (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className={`inline-flex items-center justify-center px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  canProceed()
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 shadow-lg"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                }`}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            )}
          </motion.div>

          {/* Fun Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-4 text-muted-foreground text-sm">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full border-2 border-background shadow-lg"></div>
                <div className="w-8 h-8 bg-gradient-to-br from-secondary to-primary rounded-full border-2 border-background shadow-lg"></div>
                <div className="w-8 h-8 bg-gradient-to-br from-primary/70 to-secondary/70 rounded-full border-2 border-background shadow-lg"></div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="font-mono">
                  <span className="text-primary font-bold">1,247</span> builders
                  waiting to chat
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
