"use client";

import React, { useState, useEffect, forwardRef } from "react";
import Link from "next/link";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Menu,
  X,
  Moon,
  Sun,
  Check,
  Crown,
  Video,
  Users,
  Clock,
  Shield,
  Zap,
  Star,
  ArrowRight,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

// cn utility function
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Badge component
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

// Button component
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

export default function PricingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "lifetime">(
    "monthly"
  );
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

  const plans = {
    free: {
      name: "Free",
      description: "Perfect for getting started",
      price: { monthly: 0, lifetime: 0 },
      features: [
        "5 video calls per day",
        "Basic matching algorithm",
        "Standard connection quality",
        "Community support",
        "Basic profile features",
      ],
      popular: false,
      buttonText: "Get Started Free",
      buttonVariant: "outline" as const,
    },
    premium: {
      name: "Premium",
      description: "For serious builders and networkers",
      price: { monthly: 9.99, lifetime: 199.99 },
      features: [
        "Unlimited video calls",
        "Advanced matching algorithm",
        "HD video quality",
        "Priority matching",
        "Advanced profile customization",
        "Interest-based matching",
        "Call recording (coming soon)",
        "Priority customer support",
        "No ads",
        "Premium badges",
      ],
      popular: true,
      buttonText: "Upgrade to Premium",
      buttonVariant: "default" as const,
    },
  };

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <header
        className={`sticky top-0 z-50 w-full backdrop-blur-lg transition-all duration-300 ${
          isScrolled ? "bg-background/80 shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex h-16 items-center justify-between mt-5">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground">
                B
              </div>
              <span>BuilderConnect</span>
            </Link>

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
              <SignedIn>
                <UserButton />
                <Link href={"/video-chat"}>
                  <Button className="rounded-full cursor-pointer ml-2">
                    Start Chat
                    <ChevronRight className="ml-1 size-4" />
                  </Button>
                </Link>
              </SignedIn>
              <SignedOut>
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
                >
                  Log in
                </Link>
                <Link href={"/video-chat"}>
                  <Button className="rounded-full cursor-pointer ml-2">
                    Start Chat
                    <ChevronRight className="ml-1 size-4" />
                  </Button>
                </Link>
              </SignedOut>
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
                <SignedIn>
                  <UserButton />
                  <Link href={"/video-chat"}>
                    <Button className="rounded-full cursor-pointer mt-2">
                      Start Chat
                      <ChevronRight className="ml-1 size-4" />
                    </Button>
                  </Link>
                </SignedIn>
                <SignedOut>
                  <Link
                    href="/sign-in"
                    className="py-2 text-sm font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link href={"/video-chat"}>
                    <Button className="rounded-full cursor-pointer mt-2">
                      Start Chat
                      <ChevronRight className="ml-1 size-4" />
                    </Button>
                  </Link>
                </SignedOut>
              </div>
            </div>
          </motion.div>
        )}
      </header>

      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-16 lg:py-20 overflow-hidden">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative">
            <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <Badge
                className="mb-4 rounded-full px-4 py-1.5 text-sm font-medium"
                variant="secondary"
              >
                <Crown className="w-3 h-3 mr-1" />
                Pricing Plans
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Choose your plan
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Start free, upgrade when you're ready. Connect with more
                builders and unlock premium features.
              </p>

              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-4 mb-12">
                <span
                  className={`text-sm font-medium transition-colors ${
                    billingCycle === "monthly"
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Monthly
                </span>
                <button
                  onClick={() =>
                    setBillingCycle(
                      billingCycle === "monthly" ? "lifetime" : "monthly"
                    )
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    billingCycle === "lifetime" ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      billingCycle === "lifetime"
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
                <span
                  className={`text-sm font-medium transition-colors ${
                    billingCycle === "lifetime"
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Lifetime
                </span>
                {billingCycle === "lifetime" && (
                  <Badge className="ml-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    Save 83%
                  </Badge>
                )}
              </div>
            </motion.div>

            {/* Pricing Cards */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
            >
              {/* Free Plan */}
              <div className="relative rounded-2xl border border-border/40 bg-gradient-to-b from-background to-muted/20 p-8 backdrop-blur-sm">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plans.free.name}</h3>
                  <p className="text-muted-foreground mb-4">
                    {plans.free.description}
                  </p>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-muted-foreground ml-2">/forever</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plans.free.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plans.free.buttonVariant}
                  size="lg"
                  className="w-full rounded-full h-12"
                >
                  {plans.free.buttonText}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>

              {/* Premium Plan */}
              <div className="relative rounded-2xl border-2 border-primary/50 bg-gradient-to-b from-background to-muted/20 p-8 backdrop-blur-sm">
                {plans.premium.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-1">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-6 h-6 text-yellow-500" />
                    <h3 className="text-2xl font-bold">{plans.premium.name}</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    {plans.premium.description}
                  </p>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">
                      $
                      {billingCycle === "monthly"
                        ? plans.premium.price.monthly
                        : plans.premium.price.lifetime}
                    </span>
                    <span className="text-muted-foreground ml-2">
                      {billingCycle === "monthly" ? "/month" : "/lifetime"}
                    </span>
                  </div>
                  {billingCycle === "lifetime" && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      Save $
                      {plans.premium.price.monthly * 12 * 2 -
                        plans.premium.price.lifetime}{" "}
                      vs 2 years monthly
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plans.premium.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plans.premium.buttonVariant}
                  size="lg"
                  className="w-full rounded-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  {plans.premium.buttonText}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </motion.div>

            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 -z-10 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 blur-3xl opacity-70"></div>
            <div className="absolute -top-6 -left-6 -z-10 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-secondary/30 to-primary/30 blur-3xl opacity-70"></div>
          </div>
        </section>
      </main>
    </div>
  );
}
