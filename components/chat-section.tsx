"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVideoChat } from "@/app/video-chat/contexts/video-chat-context";

export function ChatSection() {
  const { messages, sendMessage, isConnected } = useVideoChat();
  const [newMessage, setNewMessage] = React.useState("");
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (newMessage.trim() && isConnected) {
      sendMessage(newMessage);
      setNewMessage("");
    }
  };

  // Scroll to the bottom of the chat when new messages arrive
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="p-3 pb-0">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          Chat
          {isConnected && (
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
              Connected
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-3 overflow-hidden">
        <ScrollArea className="h-full pr-2">
          <div className="flex flex-col gap-2">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                {isConnected
                  ? "Start a conversation!"
                  : "Connect with someone to start chatting..."}
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex w-max max-w-[75%] flex-col gap-1 rounded-lg px-3 py-2 text-sm",
                  message.sender === "you"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {message.text}
              </div>
            ))}
            <div ref={chatEndRef} /> {/* Empty div to scroll to */}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex p-3 pt-0">
        <Input
          placeholder={
            isConnected
              ? "Type your message..."
              : "Connect to start chatting..."
          }
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          className="flex-1 mr-2"
          disabled={!isConnected}
        />
        <Button
          onClick={handleSendMessage}
          size="icon"
          disabled={!isConnected || !newMessage.trim()}
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
