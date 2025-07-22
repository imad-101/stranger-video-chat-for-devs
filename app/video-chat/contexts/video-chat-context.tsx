"use client";

import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  ReactNode,
} from "react";
import io, { Socket } from "socket.io-client";

const SIGNALING_SERVER_URL = "http://localhost:3001";

interface Message {
  id: string;
  text: string;
  sender: "you" | "stranger";
  timestamp: Date;
}

interface VideoChatContextType {
  // Video refs
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;

  // State
  status: string;
  inChat: boolean;
  isConnected: boolean;
  localStream: MediaStream | null;
  messages: Message[];

  // Actions
  handleStart: () => Promise<void>;
  handleDisconnect: () => void;
  handleNext: () => void;
  sendMessage: (text: string) => void;
}

const VideoChatContext = createContext<VideoChatContextType | undefined>(
  undefined
);

export function useVideoChat() {
  const context = useContext(VideoChatContext);
  if (!context) {
    throw new Error("useVideoChat must be used within a VideoChatProvider");
  }
  return context;
}

interface VideoChatProviderProps {
  children: ReactNode;
}

export function VideoChatProvider({ children }: VideoChatProviderProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState("Click 'Start Video Chat' to begin");
  const [inChat, setInChat] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [peer, setPeer] = useState<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (socket) socket.disconnect();
      if (peer) peer.close();
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStart = async () => {
    setStatus("Requesting camera access...");
    setInChat(true);
    setIsConnected(false);

    let stream: MediaStream;

    // Get camera access FIRST, before creating socket
    try {
      console.log("🎥 Requesting camera and microphone access...");
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true,
      });
      console.log("✅ Camera and microphone access granted");
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setStatus("Camera ready. Connecting to server...");
    } catch (err) {
      console.error("❌ Camera/microphone access error:", err);
      setStatus(
        "Could not access camera/microphone. Please check permissions."
      );
      setInChat(false);
      return;
    }

    // NOW create socket connection after camera is working
    try {
      console.log("🔌 Creating socket connection...");
      const sock = io(SIGNALING_SERVER_URL, {
        transports: ["websocket", "polling"],
        timeout: 10000,
        forceNew: true,
      });
      setSocket(sock);

      let pc: RTCPeerConnection | null = null;
      let makingOffer = false;
      let ignoreOffer = false;
      let iceCandidateQueue: RTCIceCandidate[] = [];
      let connectionTimeout: NodeJS.Timeout | null = null;

      // Socket event handlers
      sock.on("connect", () => {
        console.log("🔗 Connected to signaling server with ID:", sock.id);

        // Submit profile first, then find partner
        const savedProfile = localStorage.getItem("userProfile");
        console.log(
          "📝 Checking saved profile:",
          savedProfile ? "Found" : "Not found"
        );
        if (savedProfile) {
          try {
            const profile = JSON.parse(savedProfile);
            console.log("📤 Submitting profile for:", profile.name);
            sock.emit("submit-profile", profile);
            console.log("✅ Profile submitted successfully");

            setTimeout(() => {
              console.log("🔍 Emitting find-partner event...");
              sock.emit("find-partner");
              console.log("✅ Find-partner event emitted");
            }, 500);
          } catch (error) {
            console.error("❌ Failed to parse saved profile:", error);
            console.log("🔍 Looking for partner (no profile due to error)...");
            sock.emit("find-partner");
            console.log("✅ Find-partner event emitted (no profile)");
          }
        } else {
          console.log("🔍 No profile found, emitting find-partner anyway...");
          sock.emit("find-partner");
          console.log("✅ Find-partner event emitted (no profile)");
        }
      });

      sock.on("disconnect", () => {
        console.log("⚠️ Disconnected from server");
        setStatus("Disconnected from server");
      });

      sock.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error);
        setStatus("Failed to connect to server");
      });

      sock.on("waiting", () => {
        console.log("⏳ Waiting for someone to join...");
        setStatus("Waiting for someone to join...");
      });

      sock.on("paired", async () => {
        console.log("🎯 Paired with partner!");
        setStatus("Partner found! Establishing connection...");

        // Close any existing peer connection before creating a new one
        if (pc) {
          console.log("🔄 Closing existing peer connection");
          pc.close();
          pc = null;
          iceCandidateQueue = [];
        }

        pc = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        });
        setPeer(pc);

        // Reset signaling variables
        makingOffer = false;
        ignoreOffer = false;
        iceCandidateQueue = [];

        // Add connection timeout (30 seconds)
        connectionTimeout = setTimeout(() => {
          if (pc && !isConnected) {
            console.log("⏰ Connection timeout - looking for new partner...");
            setStatus("Connection timeout. Looking for new partner...");
            // Emit find-partner to get a new match
            sock.emit("find-partner");
          }
        }, 30000);

        // Function to process queued ICE candidates
        const processQueuedCandidates = async () => {
          if (pc && pc.remoteDescription && iceCandidateQueue.length > 0) {
            console.log(
              `🧊 Processing ${iceCandidateQueue.length} queued ICE candidates`
            );
            for (const candidate of iceCandidateQueue) {
              try {
                await pc.addIceCandidate(candidate);
              } catch (err) {
                console.error("❌ Error adding queued ICE candidate:", err);
              }
            }
            iceCandidateQueue = [];
          }
        };

        // Add local stream tracks
        stream.getTracks().forEach((track) => {
          pc!.addTrack(track, stream);
        });

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            console.log("🧊 Sending ICE candidate");
            sock.emit("signal", {
              type: "ice",
              candidate: event.candidate,
            });
          }
        };

        // Handle remote stream
        pc.ontrack = (event) => {
          console.log(
            "📺 Received remote stream with",
            event.streams.length,
            "streams"
          );
          const remoteStream = event.streams[0];
          console.log(
            "📺 Remote stream tracks:",
            remoteStream.getTracks().map((t) => t.kind)
          );
          console.log("📺 Remote stream active:", remoteStream.active);
          console.log("📺 Remote stream ID:", remoteStream.id);

          if (remoteVideoRef.current && remoteStream) {
            console.log("🎬 Setting remote video source");
            remoteVideoRef.current.srcObject = remoteStream;

            // Force the video to load and play
            remoteVideoRef.current.onloadedmetadata = () => {
              console.log("✅ Remote video metadata loaded");
              remoteVideoRef.current
                ?.play()
                .catch((e) => console.log("Video autoplay prevented:", e));
            };

            console.log("✅ Remote video element updated");
          }

          // Update connection status when we receive the remote stream
          if (!isConnected) {
            setStatus("Connected! You can now see each other.");
            setIsConnected(true);
          }
        };

        // Handle connection state changes
        pc.onconnectionstatechange = () => {
          console.log("🔄 Connection state changed:", pc!.connectionState);
          if (pc!.connectionState === "connected") {
            console.log("✅ WebRTC connection established!");
            setStatus("Video call connected!");
            setIsConnected(true);
          } else if (pc!.connectionState === "disconnected") {
            console.log("❌ WebRTC connection lost");
            setStatus("Connection lost. Looking for new partner...");
            setIsConnected(false);
          } else if (pc!.connectionState === "connecting") {
            console.log("🔄 WebRTC connection in progress...");
            setStatus("Connecting to your partner...");
            setIsConnected(false);
          } else if (pc!.connectionState === "failed") {
            console.log("💥 WebRTC connection failed");
            setStatus("Connection failed. Looking for new partner...");
            setIsConnected(false);
          }
        };

        // Handle ICE connection state changes (more granular than connection state)
        pc.oniceconnectionstatechange = () => {
          console.log("🧊 ICE connection state:", pc!.iceConnectionState);
          if (
            pc!.iceConnectionState === "connected" ||
            pc!.iceConnectionState === "completed"
          ) {
            console.log("✅ ICE connection established!");
            if (connectionTimeout) clearTimeout(connectionTimeout);
            if (!isConnected) {
              setStatus("Connected! You can now see each other.");
              setIsConnected(true);
            }
          } else if (pc!.iceConnectionState === "failed") {
            console.log("💥 ICE connection failed");
            if (connectionTimeout) clearTimeout(connectionTimeout);
            setStatus("Connection failed. Looking for new partner...");
            setIsConnected(false);
          } else if (pc!.iceConnectionState === "disconnected") {
            console.log("❌ ICE connection lost");
            if (connectionTimeout) clearTimeout(connectionTimeout);
            setStatus("Connection lost. Looking for new partner...");
            setIsConnected(false);
          }
        };

        // Perfect negotiation pattern
        pc.onnegotiationneeded = async () => {
          try {
            if (makingOffer) return;
            if (pc!.signalingState !== "stable") {
              console.log(
                "🚫 Skipping negotiation - not in stable state:",
                pc!.signalingState
              );
              return;
            }

            makingOffer = true;
            console.log("🤝 Creating offer...");
            await pc!.setLocalDescription();
            sock.emit("signal", {
              type: "sdp",
              description: pc!.localDescription,
            });
            console.log("📤 Offer sent");
          } catch (err) {
            console.error("❌ Error during negotiation:", err);
          } finally {
            makingOffer = false;
          }
        };

        // Handle incoming signals
        sock.on(
          "signal",
          async (data: {
            type: string;
            description?: RTCSessionDescriptionInit;
            candidate?: RTCIceCandidate;
          }) => {
            console.log("📡 Received signal:", data.type);
            if (!pc) return;

            try {
              if (data.type === "sdp" && data.description) {
                const desc = data.description;

                console.log(
                  `📋 Current signaling state: ${pc.signalingState}, received: ${desc.type}`
                );

                // Handle offers and answers separately
                if (desc.type === "offer") {
                  const readyForOffer =
                    !makingOffer &&
                    (pc.signalingState === "stable" ||
                      pc.signalingState === "have-local-offer");
                  ignoreOffer = !readyForOffer;

                  if (ignoreOffer) {
                    console.log("🚫 Ignoring offer - not ready");
                    return;
                  }
                } else if (desc.type === "answer") {
                  if (pc.signalingState !== "have-local-offer") {
                    console.log(
                      `🚫 Ignoring answer - wrong state: ${pc.signalingState}`
                    );
                    return;
                  }
                }

                if (pc.signalingState !== "closed") {
                  console.log("📝 Setting remote description:", desc.type);
                  await pc.setRemoteDescription(desc);

                  await processQueuedCandidates();

                  if (desc.type === "offer") {
                    console.log("📤 Creating answer...");
                    await pc.setLocalDescription();
                    sock.emit("signal", {
                      type: "sdp",
                      description: pc.localDescription,
                    });
                  }
                } else {
                  console.log(
                    "⚠️ Cannot set remote description - connection closed"
                  );
                }
              } else if (data.type === "ice" && data.candidate) {
                if (pc.remoteDescription) {
                  console.log("🧊 Adding ICE candidate");
                  try {
                    await pc.addIceCandidate(data.candidate);
                  } catch (err) {
                    console.error("❌ Error adding ICE candidate:", err);
                  }
                } else {
                  console.log(
                    "⏳ Queueing ICE candidate - no remote description yet"
                  );
                  iceCandidateQueue.push(data.candidate);
                }
              }
            } catch (err) {
              console.error("❌ Error handling signal:", err);
            }
          }
        );

        // Handle chat messages
        sock.on("chat-message", (data: { text: string; sender: string }) => {
          const newMessage: Message = {
            id: Date.now().toString(),
            text: data.text,
            sender: "stranger",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, newMessage]);
        });

        sock.on("partner-disconnected", () => {
          setStatus(
            "Partner disconnected. Click 'Start Video Chat' to find a new partner."
          );
          setIsConnected(false);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
          }
          if (pc) {
            pc.close();
            setPeer(null);
            pc = null;
            iceCandidateQueue = [];
          }
          setInChat(false);
          sock.disconnect();
        });
      });
    } catch (err) {
      console.error("Error starting chat:", err);
      setStatus("Failed to start chat. Please try again.");
      setInChat(false);
    }
  };

  const handleDisconnect = () => {
    setStatus("Disconnecting...");
    setInChat(false);

    if (peer) {
      peer.close();
      setPeer(null);
    }
    if (socket) {
      socket.emit("disconnect-partner");
      socket.disconnect();
      setSocket(null);
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    setStatus("Click 'Start Video Chat' to begin");
  };

  const handleNext = () => {
    if (!socket || !localStream) return;

    console.log("👤 Finding next partner...");
    setStatus("Looking for next partner...");
    setIsConnected(false);

    // Close current peer connection properly
    if (peer) {
      peer.onicecandidate = null;
      peer.ontrack = null;
      peer.onconnectionstatechange = null;
      peer.onnegotiationneeded = null;

      peer.close();
      setPeer(null);
    }

    // Clear remote video
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // Clear messages for new chat
    setMessages([]);

    console.log("🔍 Emitting find-partner for next person...");
    socket.emit("find-partner");
  };

  const sendMessage = (text: string) => {
    if (!socket || !text.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: "you",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    socket.emit("chat-message", { text: text.trim() });
  };

  const value: VideoChatContextType = {
    localVideoRef,
    remoteVideoRef,
    status,
    inChat,
    isConnected,
    localStream,
    messages,
    handleStart,
    handleDisconnect,
    handleNext,
    sendMessage,
  };

  return (
    <VideoChatContext.Provider value={value}>
      {children}
    </VideoChatContext.Provider>
  );
}
