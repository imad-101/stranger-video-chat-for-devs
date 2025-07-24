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
            { urls: "stun:stun2.l.google.com:19302" },
            { urls: "stun:stun3.l.google.com:19302" },
            { urls: "stun:stun4.l.google.com:19302" },
          ],
          iceCandidatePoolSize: 10,
          bundlePolicy: "max-bundle",
          rtcpMuxPolicy: "require",
          iceTransportPolicy: "all",
        });
        setPeer(pc);

        // Reset signaling variables
        makingOffer = false;
        ignoreOffer = false;
        iceCandidateQueue = [];
        let isPolite = false; // Will be set based on socket ID comparison

        // Add connection timeout (20 seconds for faster reconnection)
        connectionTimeout = setTimeout(() => {
          if (
            pc &&
            pc.connectionState !== "connected" &&
            pc.iceConnectionState !== "connected"
          ) {
            console.log("⏰ Connection timeout - looking for new partner...");
            setStatus("Connection timeout. Looking for new partner...");

            // Clean up current connection
            if (pc) {
              pc.close();
              setPeer(null);
            }

            // Clear remote video
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = null;
            }

            // Look for new partner
            sock.emit("find-partner");
          }
        }, 20000);

        // Function to process queued ICE candidates with better error handling
        const processQueuedCandidates = async () => {
          if (
            pc &&
            pc.remoteDescription &&
            pc.remoteDescription.type &&
            iceCandidateQueue.length > 0
          ) {
            console.log(
              `🧊 Processing ${iceCandidateQueue.length} queued ICE candidates`
            );

            const candidatesToProcess = [...iceCandidateQueue];
            iceCandidateQueue = []; // Clear queue immediately to prevent duplicates

            for (const candidate of candidatesToProcess) {
              try {
                if (
                  pc.signalingState !== "closed" &&
                  pc.connectionState !== "closed"
                ) {
                  await pc.addIceCandidate(candidate);
                  console.log("✅ Queued ICE candidate added successfully");
                } else {
                  console.log("⚠️ Skipping ICE candidate - connection closed");
                  break;
                }
              } catch (err) {
                if (err instanceof Error) {
                  console.error(
                    "❌ Error adding queued ICE candidate:",
                    err.message
                  );
                  // Don't break the loop, continue with other candidates
                } else {
                  console.error(
                    "❌ Unknown error adding queued ICE candidate:",
                    err
                  );
                }
              }
            }
          }
        };

        // Add local stream tracks
        stream.getTracks().forEach((track) => {
          console.log(`🎵 Adding ${track.kind} track to peer connection`);
          pc!.addTrack(track, stream);
        });
        console.log("✅ All local tracks added to peer connection");

        // Handle ICE candidates with better timing
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            console.log(
              "🧊 Sending ICE candidate:",
              event.candidate.candidate?.substring(0, 50) + "..."
            );
            sock.emit("signal", {
              type: "ice",
              candidate: event.candidate,
            });
          } else {
            console.log("🧊 ICE gathering complete");
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
            if (connectionTimeout) {
              clearTimeout(connectionTimeout);
              connectionTimeout = null;
            }
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
            if (connectionTimeout) {
              clearTimeout(connectionTimeout);
              connectionTimeout = null;
            }
            // Auto-retry with new partner
            setTimeout(() => {
              if (pc) {
                pc.close();
                setPeer(null);
              }
              sock.emit("find-partner");
            }, 2000);
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
            if (connectionTimeout) {
              clearTimeout(connectionTimeout);
              connectionTimeout = null;
            }
            if (!isConnected) {
              setStatus("Connected! You can now see each other.");
              setIsConnected(true);
            }
          } else if (pc!.iceConnectionState === "failed") {
            console.log("💥 ICE connection failed");
            if (connectionTimeout) {
              clearTimeout(connectionTimeout);
              connectionTimeout = null;
            }
            setStatus("Connection failed. Looking for new partner...");
            setIsConnected(false);

            // Auto-retry with new partner after ICE failure
            setTimeout(() => {
              if (pc && pc.connectionState !== "connected") {
                console.log("🔄 Auto-retrying after ICE failure...");
                pc.close();
                setPeer(null);
                if (remoteVideoRef.current) {
                  remoteVideoRef.current.srcObject = null;
                }
                sock.emit("find-partner");
              }
            }, 3000);
          } else if (pc!.iceConnectionState === "disconnected") {
            console.log("❌ ICE connection lost");
            setStatus("Connection lost. Looking for new partner...");
            setIsConnected(false);
          } else if (pc!.iceConnectionState === "checking") {
            console.log("🔍 ICE connection checking...");
            setStatus("Establishing connection...");
          }
        };

        // Handle offer coordination response from server
        sock.on("should-make-offer", (shouldMakeOffer: boolean) => {
          isPolite = !shouldMakeOffer;
          console.log(
            `🤝 Polite peer role assigned: ${isPolite ? "polite" : "impolite"}`
          );

          // If we should make the offer, trigger negotiation
          if (shouldMakeOffer && pc && pc.signalingState === "stable") {
            console.log("🚀 Triggering initial negotiation as impolite peer");
            // Small delay to ensure both peers are ready
            setTimeout(async () => {
              if (
                pc &&
                pc.signalingState === "stable" &&
                !makingOffer &&
                pc.connectionState !== "closed"
              ) {
                try {
                  makingOffer = true;
                  console.log("🤝 Creating initial offer...");

                  const offer = await pc.createOffer({
                    offerToReceiveAudio: true,
                    offerToReceiveVideo: true,
                  });

                  // Double-check state before setting local description
                  if (pc.signalingState === "stable" && makingOffer) {
                    await pc.setLocalDescription(offer);
                    sock.emit("signal", {
                      type: "sdp",
                      description: pc.localDescription,
                    });
                    console.log("📤 Initial offer sent successfully");
                  } else {
                    console.log(
                      "⚠️ State changed during initial offer creation, aborting"
                    );
                    makingOffer = false;
                  }
                } catch (err) {
                  console.error("❌ Error creating initial offer:", err);
                  makingOffer = false;
                }
              } else {
                console.log(
                  "⚠️ Cannot create initial offer - invalid state or already making offer"
                );
              }
            }, 1000);
          }
        });

        // Perfect negotiation pattern with polite peer and better error handling
        pc.onnegotiationneeded = async () => {
          try {
            if (makingOffer) {
              console.log("🚫 Skipping negotiation - already making offer");
              return;
            }

            if (pc!.signalingState !== "stable") {
              console.log(
                "🚫 Skipping negotiation - not in stable state:",
                pc!.signalingState
              );
              return;
            }

            // Additional check to prevent race conditions
            if (
              pc!.connectionState === "closed" ||
              pc!.connectionState === "failed"
            ) {
              console.log("🚫 Skipping negotiation - connection closed/failed");
              return;
            }

            makingOffer = true;
            console.log("🤝 Creating offer...");

            try {
              // Create offer with explicit constraints
              const offer = await pc!.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true,
              });

              // Double-check if connection is still valid and we're still making offer
              if (pc!.signalingState === "stable" && makingOffer) {
                await pc!.setLocalDescription(offer);
                sock.emit("signal", {
                  type: "sdp",
                  description: pc!.localDescription,
                });
                console.log("📤 Offer sent successfully");
              } else {
                console.log(
                  "⚠️ Connection state changed during offer creation, aborting"
                );
                makingOffer = false;
              }
            } catch (err) {
              console.error("❌ Error creating/sending offer:", err);
              makingOffer = false;
              throw err;
            }
          } catch (err) {
            console.error("❌ Error during negotiation:", err);
            makingOffer = false;
          } finally {
            // Ensure makingOffer is reset even if there's an unexpected error
            if (pc!.signalingState === "stable") {
              // Only reset if we're back to stable state
              setTimeout(() => {
                if (pc && pc.signalingState === "stable") {
                  makingOffer = false;
                }
              }, 100);
            }
          }
        };

        // Handle incoming signals with proper polite peer logic
        sock.on(
          "signal",
          async (data: {
            type: string;
            description?: RTCSessionDescriptionInit;
            candidate?: RTCIceCandidate;
            senderId?: string;
          }) => {
            console.log(
              "📡 Received signal:",
              data.type,
              data.description?.type || ""
            );
            if (!pc || pc.signalingState === "closed") {
              console.log("⚠️ Ignoring signal - no peer connection or closed");
              return;
            }

            try {
              if (data.type === "sdp" && data.description) {
                const desc = data.description;
                const isOffer = desc.type === "offer";
                const isAnswer = desc.type === "answer";

                console.log(
                  `📋 Signaling state: ${pc.signalingState}, received: ${desc.type}, isPolite: ${isPolite}, makingOffer: ${makingOffer}`
                );

                // Validate connection state before processing
                if (
                  pc.connectionState === "closed" ||
                  pc.connectionState === "failed"
                ) {
                  console.log(
                    "⚠️ Ignoring signal - peer connection is closed/failed"
                  );
                  return;
                }

                if (isAnswer) {
                  // Special handling for answers - check if we're expecting one
                  if (pc.signalingState !== "have-local-offer") {
                    console.log(
                      `⚠️ Ignoring answer - not in correct state. Current state: ${pc.signalingState}, expected: have-local-offer`
                    );
                    return;
                  }

                  if (!makingOffer) {
                    console.log(
                      "⚠️ Ignoring answer - we weren't making an offer"
                    );
                    return;
                  }
                }

                if (isOffer) {
                  // Polite peer collision detection
                  const offerCollision =
                    desc.type === "offer" &&
                    (makingOffer || pc.signalingState !== "stable");

                  ignoreOffer = !isPolite && offerCollision;

                  if (ignoreOffer) {
                    console.log(
                      "🚫 Ignoring offer due to collision (impolite peer)"
                    );
                    return;
                  }

                  // If we're making an offer and receive one, rollback if we're polite
                  if (offerCollision && isPolite) {
                    console.log("🔄 Rolling back local offer (polite peer)");
                    try {
                      await pc.setLocalDescription({ type: "rollback" });
                      makingOffer = false;
                    } catch (rollbackErr) {
                      console.error("❌ Error during rollback:", rollbackErr);
                      // Continue anyway, might still work
                    }
                  }
                }

                // Set remote description with additional validation
                console.log(`📝 Setting remote description: ${desc.type}`);
                try {
                  await pc.setRemoteDescription(desc);
                  console.log(
                    `✅ Remote description set successfully: ${desc.type}`
                  );
                } catch (setRemoteErr) {
                  console.error(
                    `❌ Error setting remote description (${desc.type}):`,
                    setRemoteErr
                  );

                  // Reset flags on error to prevent stuck states
                  if (isAnswer) {
                    makingOffer = false;
                  }
                  throw setRemoteErr;
                }

                // Process any queued ICE candidates
                await processQueuedCandidates();

                // Create answer if we received an offer
                if (isOffer) {
                  console.log("📤 Creating answer for received offer...");
                  try {
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    sock.emit("signal", {
                      type: "sdp",
                      description: pc.localDescription,
                    });
                    console.log("✅ Answer sent successfully");
                  } catch (err) {
                    console.error("❌ Error creating answer:", err);
                    throw err;
                  }
                }

                // Reset makingOffer flag after successful answer processing
                if (isAnswer) {
                  console.log("🔄 Resetting makingOffer flag after answer");
                  makingOffer = false;
                }
              } else if (data.type === "ice" && data.candidate) {
                // Handle ICE candidates
                if (pc.remoteDescription && pc.remoteDescription.type) {
                  console.log("🧊 Adding ICE candidate immediately");
                  try {
                    await pc.addIceCandidate(data.candidate);
                    console.log("✅ ICE candidate added successfully");
                  } catch (err) {
                    if (!ignoreOffer) {
                      console.error("❌ Error adding ICE candidate:", err);
                    }
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
              // Reset flags on error to prevent stuck states
              if (
                err instanceof Error &&
                (err.name === "InvalidStateError" ||
                  err.name === "OperationError")
              ) {
                console.log("🔄 Resetting signaling state due to error");
                makingOffer = false;
                ignoreOffer = false;
              }
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
    console.log("🔌 Disconnecting from chat...");
    setStatus("Disconnecting...");
    setInChat(false);
    setIsConnected(false);

    // Clean up peer connection
    if (peer) {
      // Remove all event listeners
      peer.onicecandidate = null;
      peer.ontrack = null;
      peer.onconnectionstatechange = null;
      peer.oniceconnectionstatechange = null;
      peer.onnegotiationneeded = null;
      peer.ondatachannel = null;

      peer.close();
      setPeer(null);
      console.log("✅ Peer connection closed");
    }

    // Clean up socket connection
    if (socket) {
      // Remove all event listeners
      socket.off("signal");
      socket.off("should-make-offer");
      socket.off("partner-ready");
      socket.off("chat-message");
      socket.off("partner-disconnected");
      socket.off("paired");
      socket.off("waiting");

      socket.emit("disconnect-partner");
      socket.disconnect();
      setSocket(null);
      console.log("✅ Socket disconnected");
    }

    // Clean up video streams
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
        console.log(`🎥 Stopped ${track.kind} track`);
      });
      setLocalStream(null);
    }

    // Clear messages
    setMessages([]);

    setStatus("Click 'Start Video Chat' to begin");
    console.log("✅ Disconnect complete");
  };

  const handleNext = () => {
    if (!socket || !localStream) return;

    console.log("👤 Finding next partner...");
    setStatus("Looking for next partner...");
    setIsConnected(false);

    // Close current peer connection properly
    if (peer) {
      // Remove all event listeners to prevent memory leaks
      peer.onicecandidate = null;
      peer.ontrack = null;
      peer.onconnectionstatechange = null;
      peer.oniceconnectionstatechange = null;
      peer.onnegotiationneeded = null;
      peer.ondatachannel = null;

      // Close the connection
      peer.close();
      setPeer(null);
    }

    // Clear remote video
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // Clear messages for new chat
    setMessages([]);

    // Remove old signal listeners to prevent conflicts
    socket.off("signal");
    socket.off("should-make-offer");
    socket.off("partner-ready");

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
