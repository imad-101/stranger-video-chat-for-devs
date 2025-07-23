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
  Camera,
  Save,
  Edit3,
  Github,
  Twitter,
  Linkedin,
  Globe,
  MapPin,
  Calendar,
  Code,
  Briefcase,
  GraduationCap,
  Star,
  Plus,
  Trash2,
  Upload,
  User,
  Mail,
  AtSign,
  MessageSquare,
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

export default function ProfilePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({
    displayName: "Alex Johnson",
    username: "alexbuilds",
    email: "alex@builderconnect.com",
    bio: "Full-stack developer passionate about building innovative solutions. Love connecting with fellow builders and sharing knowledge.",
    location: "San Francisco, CA",
    website: "https://alexjohnson.dev",
    avatar: "/api/placeholder/150/150",

    // Developer specific fields
    experience: "Senior Developer",
    company: "TechCorp Inc.",
    skills: ["React", "Node.js", "TypeScript", "Python", "AWS", "Docker"],
    interests: [
      "Web3",
      "AI/ML",
      "Open Source",
      "Startups",
      "Mobile Development",
    ],

    // Social links
    socialLinks: {
      github: "https://github.com/alexbuilds",
      twitter: "https://twitter.com/alexbuilds",
      linkedin: "https://linkedin.com/in/alexjohnson",
    },

    // Additional fields
    yearsOfExperience: 5,
    availableForMentoring: true,
    lookingForCollaborators: true,
    preferredLanguages: ["JavaScript", "Python", "TypeScript"],
    timezone: "PST (UTC-8)",
  });

  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");

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

  const handleSaveProfile = () => {
    setIsEditing(false);
    // Here you would typically save to your backend
    console.log("Saving profile:", profile);
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !profile.interests.includes(newInterest.trim())) {
      setProfile((prev) => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()],
      }));
      setNewInterest("");
    }
  };

  const removeInterest = (interestToRemove: string) => {
    setProfile((prev) => ({
      ...prev,
      interests: prev.interests.filter(
        (interest) => interest !== interestToRemove
      ),
    }));
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
      </header>

      <main className="flex-1 w-full">
        <section className="w-full py-12 md:py-16 lg:py-20 overflow-hidden">
          <div className="w-full max-w-4xl mx-auto px-4 md:px-6 relative">
            <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <Badge
                className="mb-4 rounded-full px-4 py-1.5 text-sm font-medium"
                variant="secondary"
              >
                <User className="w-3 h-3 mr-1" />
                Developer Profile
              </Badge>
              <div className="flex items-center justify-center gap-4 mb-6">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                  My Profile
                </h1>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "default" : "outline"}
                  size="sm"
                  className="rounded-full"
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
            </motion.div>

            {/* Profile Content */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Avatar and Basic Info */}
              <div className="rounded-2xl border border-border/40 bg-gradient-to-b from-background to-muted/20 p-8 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/70 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300" />
                      <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-background">
                        <img
                          src={profile.avatar}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {isEditing && (
                        <button className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors">
                          <Camera className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {profile.availableForMentoring && (
                        <Badge variant="secondary" className="text-xs">
                          Available for Mentoring
                        </Badge>
                      )}
                      {profile.lookingForCollaborators && (
                        <Badge variant="outline" className="text-xs">
                          Open to Collaborate
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Display Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={profile.displayName}
                            onChange={(e) =>
                              setProfile((prev) => ({
                                ...prev,
                                displayName: e.target.value,
                              }))
                            }
                            className="w-full px-3 py-2 border border-input rounded-md bg-background"
                          />
                        ) : (
                          <p className="text-lg font-semibold">
                            {profile.displayName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Username
                        </label>
                        {isEditing ? (
                          <div className="relative">
                            <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                              type="text"
                              value={profile.username}
                              onChange={(e) =>
                                setProfile((prev) => ({
                                  ...prev,
                                  username: e.target.value,
                                }))
                              }
                              className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background"
                            />
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            @{profile.username}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Email
                        </label>
                        {isEditing ? (
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                              type="email"
                              value={profile.email}
                              onChange={(e) =>
                                setProfile((prev) => ({
                                  ...prev,
                                  email: e.target.value,
                                }))
                              }
                              className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background"
                            />
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            {profile.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Location
                        </label>
                        {isEditing ? (
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                              type="text"
                              value={profile.location}
                              onChange={(e) =>
                                setProfile((prev) => ({
                                  ...prev,
                                  location: e.target.value,
                                }))
                              }
                              className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background"
                            />
                          </div>
                        ) : (
                          <p className="text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {profile.location}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Bio
                      </label>
                      {isEditing ? (
                        <textarea
                          value={profile.bio}
                          onChange={(e) =>
                            setProfile((prev) => ({
                              ...prev,
                              bio: e.target.value,
                            }))
                          }
                          rows={3}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background resize-none"
                          placeholder="Tell other builders about yourself..."
                        />
                      ) : (
                        <p className="text-muted-foreground">{profile.bio}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Info */}
              <div className="rounded-2xl border border-border/40 bg-gradient-to-b from-background to-muted/20 p-8 backdrop-blur-sm">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Briefcase className="w-6 h-6" />
                  Professional Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Current Role
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.experience}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            experience: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        {profile.experience}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Company
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.company}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            company: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      />
                    ) : (
                      <p className="text-muted-foreground">{profile.company}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Years of Experience
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={profile.yearsOfExperience}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            yearsOfExperience: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        {profile.yearsOfExperience} years
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Timezone
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profile.timezone}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            timezone: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        {profile.timezone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="rounded-2xl border border-border/40 bg-gradient-to-b from-background to-muted/20 p-8 backdrop-blur-sm">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Code className="w-6 h-6" />
                  Skills & Technologies
                </h2>
                {isEditing && (
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill..."
                      className="flex-1 px-3 py-2 border border-input rounded-md bg-background"
                      onKeyPress={(e) => e.key === "Enter" && addSkill()}
                    />
                    <Button onClick={addSkill} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <div key={index} className="relative group">
                      <Badge variant="secondary" className="pr-8">
                        {skill}
                        {isEditing && (
                          <button
                            onClick={() => removeSkill(skill)}
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full bg-muted-foreground/20 hover:bg-destructive/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div className="rounded-2xl border border-border/40 bg-gradient-to-b from-background to-muted/20 p-8 backdrop-blur-sm">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Star className="w-6 h-6" />
                  Interests & Areas of Focus
                </h2>
                {isEditing && (
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      placeholder="Add an interest..."
                      className="flex-1 px-3 py-2 border border-input rounded-md bg-background"
                      onKeyPress={(e) => e.key === "Enter" && addInterest()}
                    />
                    <Button onClick={addInterest} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <div key={index} className="relative group">
                      <Badge variant="outline" className="pr-8">
                        {interest}
                        {isEditing && (
                          <button
                            onClick={() => removeInterest(interest)}
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full bg-muted-foreground/20 hover:bg-destructive/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div className="rounded-2xl border border-border/40 bg-gradient-to-b from-background to-muted/20 p-8 backdrop-blur-sm">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Globe className="w-6 h-6" />
                  Social Links & Portfolio
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Github className="w-4 h-4" />
                      GitHub
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={profile.socialLinks.github}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            socialLinks: {
                              ...prev.socialLinks,
                              github: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        placeholder="https://github.com/username"
                      />
                    ) : (
                      <a
                        href={profile.socialLinks.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {profile.socialLinks.github}
                      </a>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Twitter className="w-4 h-4" />
                      Twitter/X
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={profile.socialLinks.twitter}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            socialLinks: {
                              ...prev.socialLinks,
                              twitter: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        placeholder="https://twitter.com/username"
                      />
                    ) : (
                      <a
                        href={profile.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {profile.socialLinks.twitter}
                      </a>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={profile.socialLinks.linkedin}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            socialLinks: {
                              ...prev.socialLinks,
                              linkedin: e.target.value,
                            },
                          }))
                        }
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        placeholder="https://linkedin.com/in/username"
                      />
                    ) : (
                      <a
                        href={profile.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {profile.socialLinks.linkedin}
                      </a>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Personal Website
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={profile.website}
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            website: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        placeholder="https://yourwebsite.com"
                      />
                    ) : (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {profile.website}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
