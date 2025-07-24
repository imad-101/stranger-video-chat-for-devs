"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useVideoChat } from "../app/video-chat/contexts/video-chat-context";
import { Video, VideoOff, User, Wifi, WifiOff } from "lucide-react";

interface VideoStreamProps {
  user: "You" | "Stranger";
}

export function VideoStream({ user }: VideoStreamProps) {
  const { localVideoRef, remoteVideoRef, localStream, isConnected } =
    useVideoChat();

  const videoRef = user === "You" ? localVideoRef : remoteVideoRef;
  const hasStream = user === "You" ? !!localStream : isConnected;

  return (
    <Card className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 h-full group">
      <CardContent className="flex-1 p-0 relative h-full overflow-hidden">
        {/* Video stream */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl"
          autoPlay
          playsInline
          muted={user === "You"}
        />

        {/* Placeholder when no stream */}
        {!hasStream && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl">
            <div className="text-center space-y-4 p-6">
              <div className="relative mx-auto">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-slate-700 to-slate-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
                  {user === "You" ? (
                    <Video className="w-6 h-6 md:w-8 md:h-8 text-slate-300" />
                  ) : (
                    <User className="w-6 h-6 md:w-8 md:h-8 text-slate-300" />
                  )}
                </div>
                {/* Animated pulse ring */}
                <div className="absolute inset-0 rounded-2xl border-4 border-slate-400/30 animate-ping" />
                <div className="absolute inset-2 rounded-xl border-2 border-slate-400/20 animate-ping animation-delay-200" />
              </div>

              <div className="space-y-2">
                <p className="text-white/90 text-sm md:text-base font-medium">
                  {user === "You"
                    ? "Camera Starting..."
                    : "Waiting for Connection"}
                </p>
                <p className="text-white/60 text-xs md:text-sm">
                  {user === "You"
                    ? "Allow camera access to start"
                    : "Finding someone to chat with..."}
                </p>
              </div>

              {/* Loading dots animation */}
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce animation-delay-100" />
                <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce animation-delay-200" />
              </div>
            </div>
          </div>
        )}

        {/* User label and status overlay */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          {/* User name badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/50 backdrop-blur-sm rounded-xl border border-white/10">
            <div
              className={`w-2 h-2 rounded-full ${
                hasStream ? "bg-emerald-400 animate-pulse" : "bg-slate-400"
              }`}
            />
            <span className="text-white text-sm font-medium">{user}</span>
            {hasStream && (
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                {user === "You" ? "Live" : "Connected"}
              </span>
            )}
          </div>

          {/* Connection status icon */}
          <div className="flex items-center gap-2 px-2 py-1.5 bg-black/50 backdrop-blur-sm rounded-xl border border-white/10">
            {hasStream ? (
              <Wifi className="w-4 h-4 text-emerald-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </div>

        {/* Bottom gradient overlay for better text contrast */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none rounded-b-2xl" />

        {/* Video controls overlay (visible on hover for desktop) */}
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none md:pointer-events-auto">
          <div className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-sm rounded-xl border border-white/10">
            <VideoOff className="w-4 h-4 text-white/60 hover:text-white cursor-pointer transition-colors" />
            <div className="w-px h-4 bg-white/20" />
            <span className="text-white/80 text-xs font-medium">
              {user === "You" ? "Your Camera" : "Remote Camera"}
            </span>
          </div>
        </div>

        {/* Corner decoration */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/5 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
      </CardContent>
    </Card>
  );
}
