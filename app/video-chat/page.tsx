"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import io, { Socket } from "socket.io-client";

const SIGNALING_SERVER_URL = "http://localhost:3001";

export default function VideoChatPage() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState("Click 'Start Video Chat' to begin");
  const [inChat, setInChat] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [peer, setPeer] = useState<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

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
        // Remove automatic play() to prevent interruption errors
        // The video will auto-play due to autoPlay attribute
      }
      setStatus("Camera ready. Connecting to server...");
    } catch (err) {
      console.error("❌ Camera/microphone access error:", err);
      setStatus(
        "Could not access camera/microphone. Please check permissions."
      );
      setInChat(false);
      return; // Exit early if camera fails
    }

    // NOW create socket connection after camera is working
    try {
      console.log("🔌 Creating socket connection...");
      const sock = io(SIGNALING_SERVER_URL, {
        transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
        timeout: 10000, // 10 second timeout
        forceNew: true, // Force a new connection
      });
      setSocket(sock);

      let pc: RTCPeerConnection | null = null;
      let makingOffer = false;
      let ignoreOffer = false;

      // Socket event handlers
      sock.on("connect", () => {
        console.log("🔗 Connected to signaling server with ID:", sock.id);

        // Submit profile first, then find partner
        const savedProfile = localStorage.getItem("userProfile");
        console.log("📝 Checking saved profile:", savedProfile ? "Found" : "Not found");
        if (savedProfile) {
          try {
            const profile = JSON.parse(savedProfile);
            console.log("📤 Submitting profile for:", profile.name);
            sock.emit("submit-profile", profile);
            console.log("✅ Profile submitted successfully");

            // Find partner after profile submission
            setTimeout(() => {
              console.log("🔍 Emitting find-partner event...");
              sock.emit("find-partner");
              console.log("✅ Find-partner event emitted");
            }, 500);
          } catch (error) {
            console.error("❌ Failed to parse saved profile:", error);
            // Still try to find partner even without profile
            console.log("🔍 Looking for partner (no profile due to error)...");
            sock.emit("find-partner");
            console.log("✅ Find-partner event emitted (no profile)");
          }
        } else {
          // No profile, just find partner
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

        pc = new RTCPeerConnection({
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ],
        });
        setPeer(pc);

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
          console.log("📺 Received remote stream with", event.streams.length, "streams");
          const remoteStream = event.streams[0];
          console.log("📺 Remote stream tracks:", remoteStream.getTracks().map(t => t.kind));
          
          if (remoteVideoRef.current && remoteStream) {
            console.log("🎬 Setting remote video source");
            remoteVideoRef.current.srcObject = remoteStream;
            // Remove automatic play() call to prevent interruption errors
            // The video will auto-play due to autoPlay attribute
            console.log("✅ Remote video element updated");
          }
          setStatus("Connected! You can now see each other.");
          setIsConnected(true);
        };

        // Handle connection state changes
        pc.onconnectionstatechange = () => {
          console.log("Connection state:", pc!.connectionState);
          if (pc!.connectionState === "connected") {
            setStatus("Video call connected!");
            setIsConnected(true);
          } else if (pc!.connectionState === "disconnected") {
            setStatus("Connection lost. Looking for new partner...");
            setIsConnected(false);
          } else if (pc!.connectionState === "connecting") {
            setStatus("Connecting to your partner...");
            setIsConnected(false);
          }
        };

        // Perfect negotiation pattern
        pc.onnegotiationneeded = async () => {
          try {
            if (makingOffer) return; // Avoid re-entrancy
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
        sock.on("signal", async (data: { type: string; description?: RTCSessionDescriptionInit; candidate?: RTCIceCandidate }) => {
          console.log("📡 Received signal:", data.type);
          if (!pc) return;

          try {
            if (data.type === "sdp" && data.description) {
              const desc = data.description;
              
              // Check if we can handle this SDP
              console.log(`📋 Current signaling state: ${pc.signalingState}, received: ${desc.type}`);
              
              const readyForOffer =
                !makingOffer &&
                (pc.signalingState === "stable" ||
                  pc.signalingState === "have-local-offer");
              ignoreOffer = !readyForOffer && desc.type === "offer";

              if (ignoreOffer) {
                console.log("🚫 Ignoring offer - not ready");
                return;
              }

              // Only set remote description if we're in the right state
              if (pc.signalingState !== "closed") {
                console.log("📝 Setting remote description:", desc.type);
                await pc.setRemoteDescription(desc);

                if (desc.type === "offer") {
                  console.log("📤 Creating answer...");
                  await pc.setLocalDescription();
                  sock.emit("signal", {
                    type: "sdp",
                    description: pc.localDescription,
                  });
                }
              } else {
                console.log("⚠️ Cannot set remote description - connection closed");
              }
            } else if (data.type === "ice" && data.candidate) {
              console.log("🧊 Adding ICE candidate");
              await pc.addIceCandidate(data.candidate);
            }
          } catch (err) {
            console.error("❌ Error handling signal:", err);
          }
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

    // Close current peer connection
    if (peer) {
      peer.close();
      setPeer(null);
    }

    // Clear remote video
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // Find new partner
    console.log("🔍 Emitting find-partner for next person...");
    socket.emit("find-partner");
  };

  return (
    <div className="min-h-screen overflow-hidden flex flex-col items-center justify-center relative">
      {/* Background matching the site's theme */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 -z-10 h-full w-full bg-black"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="flex items-center justify-center mb-4">
            <Link
              href="/"
              className="absolute left-0 px-4 py-2 bg-[#1f1f23] border border-[#6366F1]/30 text-[#6366F1] rounded-lg hover:border-[#6366F1] hover:bg-[#6366F1]/10 transition-all duration-300"
            >
              ← Home
            </Link>
            <h1 className="text-4xl lg:text-6xl font-black">
              <span className="bg-gradient-to-r from-[#F1F5F9] to-[#6366F1] bg-clip-text text-transparent">
                Video Chat
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#FACC15] to-[#F1F5F9] bg-clip-text text-transparent">
                Room
              </span>
            </h1>
          </div>
        </div>

        {/* Status Card */}
        <div className="flex justify-center mb-8 animate-fade-in-up">
          <div
            className={`inline-flex items-center gap-3 px-4 py-2 rounded-full text-sm font-medium ${
              inChat
                ? isConnected
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-[#FACC15]/20 text-[#FACC15] border border-[#FACC15]/30"
                : "bg-[#6366F1]/20 text-[#6366F1] border border-[#6366F1]/30"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                inChat
                  ? isConnected
                    ? "bg-green-400 animate-pulse"
                    : "bg-[#FACC15] animate-pulse"
                  : "bg-[#6366F1]"
              }`}
            ></div>
            {status}
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Local Video */}
        <div className="bg-[#1f1f23]/80 backdrop-blur-sm border border-[#6366F1]/30 rounded-2xl p-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#F1F5F9] flex items-center gap-2">
              <span className="w-3 h-3 bg-[#6366F1] rounded-full"></span>
              You
            </h3>
            {localStream && (
              <span className="text-xs text-[#94A3B8] bg-[#6366F1]/20 px-2 py-1 rounded-full">
                Live
              </span>
            )}
          </div>
          <div className="aspect-video bg-black rounded-xl overflow-hidden border-2 border-[#6366F1]/30 relative group">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!localStream && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#6366F1]/20 rounded-full flex items-center justify-center mb-3 mx-auto">
                    <span className="text-2xl">📹</span>
                  </div>
                  <p className="text-[#94A3B8] text-sm">Camera not active</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Remote Video */}
        <div className="bg-[#1f1f23]/80 backdrop-blur-sm border border-[#FACC15]/30 rounded-2xl p-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#F1F5F9] flex items-center gap-2">
              <span className="w-3 h-3 bg-[#FACC15] rounded-full"></span>
              Stranger
            </h3>
            {remoteVideoRef.current?.srcObject && (
              <span className="text-xs text-[#94A3B8] bg-[#FACC15]/20 px-2 py-1 rounded-full">
                Connected
              </span>
            )}
          </div>
          <div className="aspect-video bg-black rounded-xl overflow-hidden border-2 border-[#FACC15]/30 relative">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {!remoteVideoRef.current?.srcObject && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#FACC15]/20 rounded-full flex items-center justify-center mb-3 mx-auto animate-pulse-soft">
                    <span className="text-2xl">👋</span>
                  </div>
                  <p className="text-[#94A3B8] text-sm">
                    Waiting for connection...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up">
        {!inChat ? (
          <button
            onClick={handleStart}
            className="group relative px-8 py-4 bg-gradient-to-r from-[#6366F1] to-[#FACC15] text-white font-bold text-xl rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-[#6366F1]/25"
          >
            <span className="relative z-10 flex items-center gap-3">
              Start Video Chat
              <span className="text-2xl group-hover:animate-bounce">🚀</span>
            </span>
          </button>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-[#1f1f23] border border-[#FACC15]/30 text-[#FACC15] font-semibold rounded-xl hover:border-[#FACC15] hover:bg-[#FACC15]/10 hover:scale-105 transition-all duration-300"
            >
              Next Person 👤
            </button>
            <button
              onClick={handleDisconnect}
              className="px-6 py-3 bg-gradient-to-r from-[#F87171] to-[#DC2626] text-white font-semibold rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-red-500/25"
            >
              End Chat 👋
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
