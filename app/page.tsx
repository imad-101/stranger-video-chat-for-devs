"use client";

import type React from "react";

import { useState, useEffect, forwardRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight, Menu, X, Moon, Sun, ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

// cn utility function (duplicated for page.tsx self-sufficiency, ideally shared from layout or lib)
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Badge component (moved from components/ui/badge.tsx - simplified for direct inclusion)
interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

// Button component (moved from components/ui/button.tsx - simplified for direct inclusion)
interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center">
      <header
        className={`sticky top-0 z-50 w-full backdrop-blur-lg transition-all duration-300 ${
          isScrolled ? "bg-background/80 shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex h-16 items-center justify-between mt-5">
            <div className="flex items-center gap-2 font-bold">
              <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground">
                B
              </div>
              <span>BuilderConnect</span>
            </div>

            <div className="hidden md:flex gap-4 items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
              >
                {mounted && theme === "dark" ? (
                  <Sun className="size-[18px]" />
                ) : (
                  <Moon className="size-[18px]" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
              <Link
                href="profile"
                className="text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
              >
                Log in
              </Link>
              <Link href={"/profile"}>
                <Button className="rounded-full cursor-pointer">
                  Start Chat
                  <ChevronRight className="ml-1 size-4" />
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-4 md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
              >
                {mounted && theme === "dark" ? (
                  <Sun className="size-[18px]" />
                ) : (
                  <Moon className="size-[18px]" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="size-5" />
                ) : (
                  <Menu className="size-5" />
                )}
                <span className="sr-only">Toggle menu</span>
              </Button>
            </div>
          </div>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-16 inset-x-0 bg-background/95 backdrop-blur-lg border-b"
          >
            <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2 pt-2 border-t">
                <Link
                  href="/profile"
                  className="py-2 text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link href={"/profile"}>
                  <Button className="rounded-full cursor-pointer">
                    Start Chat
                    <ChevronRight className="ml-1 size-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </header>
      <main className="flex-1 w-full flex flex-col items-center justify-center">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-16 lg:py-16 overflow-hidden flex flex-col items-center justify-center text-center">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative py-16 flex flex-col items-center justify-center text-center">
            <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto mb-12"
            >
              <Badge
                className="mb-4 rounded-full px-4 py-1.5 text-sm font-medium"
                variant="secondary"
              >
                Connect Instantly
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Connect & chat with like-minded builders
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Random video calls for fun and networking.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={"/profile"}>
                  <Button
                    size="lg"
                    className="rounded-full h-12 px-8 text-base cursor-pointer"
                  >
                    Start Video Chat
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full h-12 px-8 text-base bg-transparent"
                >
                  Learn More
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative mx-auto max-w-6xl"
            >
              <div className="rounded-xl overflow-hidden shadow-2xl border border-border/40 bg-gradient-to-b from-background to-muted/20">
                <Image
                  src="/random-chat.png"
                  width={1280}
                  height={720}
                  alt="Random Chat application interface"
                  className="w-full h-auto"
                  priority
                />
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/10 dark:ring-white/10"></div>
              </div>
              <div className="absolute -bottom-6 -right-6 -z-10 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 blur-3xl opacity-70"></div>
              <div className="absolute -top-6 -left-6 -z-10 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-secondary/30 to-primary/30 blur-3xl opacity-70"></div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
