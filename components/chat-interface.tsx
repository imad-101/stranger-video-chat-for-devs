"use client";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { VideoStream } from "./video-stream";
import { ChatSection } from "./chat-section";
import { useVideoChat } from "@/app/video-chat/contexts/video-chat-context";
import { Play, UserX, SkipForward } from "lucide-react";

export function ChatInterface() {
  const {
    status,
    inChat,
    isConnected,
    handleStart,
    handleDisconnect,
    handleNext,
  } = useVideoChat();

  const getStatusColor = () => {
    if (inChat) {
      return isConnected ? "bg-green-500" : "bg-yellow-500";
    }
    return "bg-blue-500";
  };

  const getStatusText = () => {
    if (inChat) {
      return isConnected ? "Connected" : "Connecting...";
    }
    return "Ready to start";
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-svh w-full">
        {/* Main Content Area */}
        <SidebarInset className="flex flex-col flex-1 bg-white dark:bg-[#18181b] rounded-xl m-4 shadow-lg border border-border">
          {/* Header */}
          <header className="flex h-20 shrink-0 items-center gap-2 border-b px-6 bg-white dark:bg-zinc-900/80 rounded-t-xl shadow-sm">
            {/* <SidebarTrigger className="-ml-1 mr-2" variant="secondary" /> */}
            {/* <Separator orientation="vertical" className="mr-2 h-6" /> */}
            <h1 className="text-2xl font-bold tracking-tight">Random Chat</h1>
            <div className="ml-auto flex items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300" />
                <div className="relative">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox:
                          "w-16 h-16 group-data-[state=collapsed]:w-10 group-data-[state=collapsed]:h-10",
                      },
                    }}
                  />
                  {/* Online indicator */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
              <Badge
                variant="outline"
                className="flex items-center gap-2 px-3 py-1 text-base"
              >
                <div
                  className={`w-2 h-2 rounded-full ${getStatusColor()}`}
                ></div>
                {getStatusText()}
              </Badge>
              <div className="flex items-center gap-2">
                {!inChat ? (
                  <Button
                    onClick={handleStart}
                    className="flex items-center gap-2 px-5 py-2 text-base font-semibold shadow-md hover:shadow-lg focus:ring-2 focus:ring-primary"
                  >
                    <Play className="h-5 w-5" />
                    Start Chat
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleNext}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 px-4 py-2 text-base font-semibold shadow-md hover:shadow-lg focus:ring-2 focus:ring-primary"
                      disabled={!isConnected}
                    >
                      <SkipForward className="h-5 w-5" />
                      Next
                    </Button>
                    <Button
                      onClick={handleDisconnect}
                      variant="destructive"
                      size="sm"
                      className="flex items-center gap-2 px-4 py-2 text-base font-semibold shadow-md hover:shadow-lg focus:ring-2 focus:ring-destructive"
                    >
                      <UserX className="h-5 w-5" />
                      End
                    </Button>
                  </>
                )}
              </div>
            </div>
          </header>
          {/* Status Message */}
          <div className="px-8 py-3 border-b bg-white dark:bg-zinc-800/60 text-base rounded-b-none">
            <p className="text-muted-foreground">{status}</p>
          </div>
          {/* Main Content: Video Streams and Chat Section */}
          <main className="flex flex-1 flex-col gap-8 p-8 bg-white dark:bg-transparent">
            {/* Video Streams Section - takes up available space */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[320px]">
              <VideoStream user="You" />
              <VideoStream user="Stranger" />
            </div>
            {/* Chat Section - fixed height at the bottom, spanning full width */}
            <div className="w-full max-w-3xl mx-auto h-[220px] md:h-[260px] lg:h-[320px]">
              <ChatSection />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
