"use client";
import { useState, useEffect } from "react";
import { SignIn, SignUp } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

export default function AuthPage() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url");

  // Default redirect URL if none provided
  const fallbackRedirectUrl = "/video-chat";
  const finalRedirectUrl = redirectUrl || fallbackRedirectUrl;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-md mx-auto bg-white dark:bg-black rounded-2xl shadow-2xl border border-border/40 p-8 flex flex-col items-center relative">
        <div className="mb-8 flex flex-col items-center">
          <Image
            src="/heroimg.png"
            alt="Logo"
            width={64}
            height={64}
            className="mb-4"
          />
          <h1 className="text-3xl font-bold mb-2 text-center">
            Welcome to BuilderConnect
          </h1>
          <p className="text-muted-foreground text-center mb-2">
            Random video calls for fun and networking.
          </p>
        </div>
        <div className="flex gap-2 mb-6 w-full">
          <button
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
              mode === "sign-in"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-primary/10"
            }`}
            onClick={() => setMode("sign-in")}
          >
            Sign In
          </button>
          <button
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
              mode === "sign-up"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-primary/10"
            }`}
            onClick={() => setMode("sign-up")}
          >
            Sign Up
          </button>
        </div>
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full"
        >
          {mode === "sign-in" ? (
            <SignIn
              fallbackRedirectUrl={finalRedirectUrl}
              appearance={{
                elements: { card: "shadow-none border-none bg-transparent" },
              }}
            />
          ) : (
            <SignUp
              fallbackRedirectUrl={finalRedirectUrl}
              appearance={{
                elements: { card: "shadow-none border-none bg-transparent" },
              }}
            />
          )}
        </motion.div>
      </div>
    </main>
  );
}
