"use client";

import { useState, useEffect } from "react";
import { SignIn, SignUp } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Moon, Sun, ArrowLeft } from "lucide-react";
import { useTheme } from "next-themes";

export default function AuthPage() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();
  const redirectUrl = searchParams.get("redirect_url");

  // Default redirect URL if none provided
  const fallbackRedirectUrl = "/video-chat";
  const finalRedirectUrl = redirectUrl || fallbackRedirectUrl;

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center relative">
      {/* Background with grid pattern matching homepage */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

      {/* Header with theme toggle and back button */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex h-16 items-center justify-between mt-5">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold hover:opacity-80 transition-opacity"
            >
              <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground">
                B
              </div>
              <span>BuilderConnect</span>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="size-4" />
                Back to Home
              </Link>
              <button
                onClick={toggleTheme}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10"
              >
                {mounted && theme === "dark" ? (
                  <Sun className="size-[18px]" />
                ) : (
                  <Moon className="size-[18px]" />
                )}
                <span className="sr-only">Toggle theme</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md mx-auto relative"
        >
          {/* Decorative gradient blurs matching homepage */}
          <div className="absolute -top-20 -right-20 -z-10 h-[200px] w-[200px] rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-3xl opacity-60"></div>
          <div className="absolute -bottom-20 -left-20 -z-10 h-[200px] w-[200px] rounded-full bg-gradient-to-br from-secondary/20 to-primary/20 blur-3xl opacity-60"></div>

          {/* Main auth card */}
          <div className=" p-8 relative overflow-hidden">
            {/* Subtle gradient overlay */}

            <div className="relative z-10">
              {/* Header section */}
              <div className="mb-8 flex flex-col items-center text-center">
                <div className="size-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground mb-4">
                  <span className="text-2xl font-bold">B</span>
                </div>
                <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                  Welcome to BuilderConnect
                </h1>
                <p className="text-muted-foreground text-center">
                  Random video calls for fun and networking.
                </p>
              </div>

              {/* Mode toggle buttons */}
              <div className="flex gap-1 mb-6 w-full p-1 bg-muted/50 rounded-xl backdrop-blur-sm">
                <button
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                    mode === "sign-in"
                      ? "bg-background text-foreground shadow-sm border border-border/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                  onClick={() => setMode("sign-in")}
                >
                  Sign In
                </button>
                <button
                  className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                    mode === "sign-up"
                      ? "bg-background text-foreground shadow-sm border border-border/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  }`}
                  onClick={() => setMode("sign-up")}
                >
                  Sign Up
                </button>
              </div>

              {/* Auth form with animation */}
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {mode === "sign-in" ? (
                  <SignIn
                    fallbackRedirectUrl={finalRedirectUrl}
                    appearance={{
                      elements: {
                        card: "shadow-none border-none bg-transparent",
                        headerTitle: "hidden",
                        headerSubtitle: "hidden",
                        socialButtonsBlockButton:
                          "bg-background hover:bg-muted/50 border border-border/40 text-foreground transition-all duration-200",
                        formButtonPrimary:
                          "bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 rounded-lg",
                        formFieldInput:
                          "bg-background border-border/40 focus:border-primary/50 transition-all duration-200 rounded-lg",
                        footerActionLink:
                          "text-primary hover:text-primary/80 transition-colors duration-200",
                        dividerLine: "bg-border/40",
                        dividerText: "text-muted-foreground",
                        formFieldLabel: "text-foreground",
                        identityPreviewText: "text-muted-foreground",
                        formFieldInfoText: "text-muted-foreground",
                      },
                    }}
                  />
                ) : (
                  <SignUp
                    fallbackRedirectUrl={finalRedirectUrl}
                    appearance={{
                      elements: {
                        card: "shadow-none border-none bg-transparent",
                        headerTitle: "hidden",
                        headerSubtitle: "hidden",
                        socialButtonsBlockButton:
                          "bg-background hover:bg-muted/50 border border-border/40 text-foreground transition-all duration-200",
                        formButtonPrimary:
                          "bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 rounded-lg",
                        formFieldInput:
                          "bg-background border-border/40 focus:border-primary/50 transition-all duration-200 rounded-lg",
                        footerActionLink:
                          "text-primary hover:text-primary/80 transition-colors duration-200",
                        dividerLine: "bg-border/40",
                        dividerText: "text-muted-foreground",
                        formFieldLabel: "text-foreground",
                        identityPreviewText: "text-muted-foreground",
                        formFieldInfoText: "text-muted-foreground",
                      },
                    }}
                  />
                )}
              </motion.div>
            </div>
          </div>

          {/* Bottom decorative text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center text-sm text-muted-foreground mt-6"
          >
            Connect with builders worldwide
          </motion.p>
        </motion.div>
      </main>
    </div>
  );
}
