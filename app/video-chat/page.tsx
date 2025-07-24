"use client";

import { VideoChatProvider } from "./contexts/video-chat-context";
import { ChatInterface } from "@/components/chat-interface";

export default function VideoChatPage() {
  return (
    <VideoChatProvider>
      <ChatInterface />
    </VideoChatProvider>
  );
}
