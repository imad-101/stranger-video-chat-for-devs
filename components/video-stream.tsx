"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useVideoChat } from "../app/video-chat/contexts/video-chat-context";

interface VideoStreamProps {
  user: "You" | "Stranger";
}

export function VideoStream({ user }: VideoStreamProps) {
  const { localVideoRef, remoteVideoRef, localStream, isConnected } =
    useVideoChat();

  const videoRef = user === "You" ? localVideoRef : remoteVideoRef;
  const hasStream = user === "You" ? !!localStream : isConnected;

  return (
    <Card className="flex flex-col overflow-hidden rounded-xl shadow-none border-none bg-transparent h-full w-full p-0">
      <CardContent className="flex-1 p-0 relative h-full w-full">
        {/* Video stream */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover bg-black rounded-xl"
          autoPlay
          playsInline
          muted={user === "You"} // Mute self video
        />

        {/* Placeholder when no stream */}
        {!hasStream && (
          <div className="absolute inset-0 flex items-center justify-center bg-black rounded-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 mx-auto animate-pulse">
                <span className="text-2xl">{user === "You" ? "📹" : "👋"}</span>
              </div>
              <p className="text-white/60 text-sm">
                {user === "You"
                  ? "Camera not active"
                  : "Waiting for connection..."}
              </p>
            </div>
          </div>
        )}

        {/* Overlay for user name and connection status */}
        <div className="absolute inset-0 flex items-end p-4 text-white text-xl font-bold bg-gradient-to-t from-black/70 to-transparent pointer-events-none rounded-xl">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                hasStream ? "bg-green-400" : "bg-gray-400"
              }`}
            ></span>
            {user}
            {hasStream && (
              <span className="text-xs bg-green-500/20 px-2 py-1 rounded-full">
                {user === "You" ? "Live" : "Connected"}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
