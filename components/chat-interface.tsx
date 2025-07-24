"use client";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { VideoStream } from "./video-stream";
import { ChatSection } from "./chat-section";
import { useVideoChat } from "@/app/video-chat/contexts/video-chat-context";
import {
  Play,
  UserX,
  SkipForward,
  Wifi,
  WifiOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

export function ChatInterface() {
  const {
    status,
    inChat,
    isConnected,
    handleStart,
    handleDisconnect,
    handleNext,
  } = useVideoChat();

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const getStatusColor = () => {
    if (inChat) {
      return isConnected ? "bg-emerald-500" : "bg-amber-500";
    }
    return "bg-blue-500";
  };

  const getStatusText = () => {
    if (inChat) {
      return isConnected ? "Connected" : "Connecting...";
    }
    return "Ready to start";
  };

  const getStatusIcon = () => {
    if (inChat) {
      return isConnected ? (
        <Wifi className="h-3 w-3" />
      ) : (
        <WifiOff className="h-3 w-3" />
      );
    }
    return <Video className="h-3 w-3" />;
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        {/* Main Content Area */}
        <SidebarInset className="flex flex-col flex-1 bg-background/80 backdrop-blur-xl rounded-2xl m-2 md:m-4 border overflow-hidden">
          {/* Header */}
          <header className="flex h-16 md:h-20 shrink-0 items-center gap-2 md:gap-4 border-b px-4 md:px-6 bg-background/90 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground">
                <Video className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <h1 className="text-lg md:text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Random Chat
              </h1>
            </div>

            <div className="ml-auto flex items-center gap-2 md:gap-4">
              {/* Status Badge */}
              <Badge
                variant="outline"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm"
              >
                {getStatusIcon()}
                <span className="hidden md:inline">{getStatusText()}</span>
                <div
                  className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`}
                />
              </Badge>

              {/* Mobile Status Indicator */}
              <div className="sm:hidden">
                <div
                  className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`}
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center gap-1 md:gap-2">
                {!inChat ? (
                  <Button
                    onClick={handleStart}
                    className="flex items-center gap-2 px-3 md:px-5 py-2 text-sm md:text-base font-semibold"
                  >
                    <Play className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="hidden sm:inline">Start Chat</span>
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleNext}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 text-sm font-semibold"
                      disabled={!isConnected}
                    >
                      <SkipForward className="h-4 w-4" />
                      <span className="hidden md:inline">Next</span>
                    </Button>
                    <Button
                      onClick={handleDisconnect}
                      variant="destructive"
                      size="sm"
                      className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 text-sm font-semibold"
                    >
                      <UserX className="h-4 w-4" />
                      <span className="hidden md:inline">End</span>
                    </Button>
                  </>
                )}
              </div>

              {/* Theme Toggle Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full h-8 w-8 md:h-10 md:w-10"
              >
                {mounted && theme === "dark" ? (
                  <Sun className="h-4 w-4 md:h-[18px] md:w-[18px]" />
                ) : (
                  <Moon className="h-4 w-4 md:h-[18px] md:w-[18px]" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>

              {/* User Profile */}
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full blur opacity-60" />
                <div className="relative">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8 md:w-10 md:h-10",
                      },
                    }}
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 md:w-4 md:h-4 bg-emerald-500 rounded-full border-2 border-background flex items-center justify-center">
                    <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-white rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Status Message */}
          <div className="px-4 md:px-6 py-3 border-b bg-muted/30">
            <p className="text-muted-foreground text-sm md:text-base flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
              {status}
            </p>
          </div>

          {/* Main Content: Video Streams and Chat Section */}
          <main className="flex flex-1 flex-col gap-4 md:gap-6 p-4 md:p-6 overflow-hidden">
            {/* Video Streams Section */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4 md:gap-6 min-h-[200px] md:min-h-[320px]">
              <div className="flex-1">
                <VideoStream user="You" />
              </div>
              <div className="flex-1">
                <VideoStream user="Stranger" />
              </div>
            </div>

            {/* Chat Section */}
            <div className="w-full h-[200px] md:h-[280px] lg:h-[320px]">
              <ChatSection />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
