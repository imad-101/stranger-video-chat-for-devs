import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Custom interfaces for WebRTC types since we're in Node.js environment
interface RTCSessionDescriptionInit {
  type: "offer" | "answer" | "pranswer" | "rollback";
  sdp?: string;
}

interface RTCIceCandidate {
  candidate?: string;
  sdpMLineIndex?: number | null;
  sdpMid?: string | null;
  usernameFragment?: string | null;
}

interface SignalData {
  type: "sdp" | "ice";
  description?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidate;
}

interface UserProfile {
  name: string;
  age: string;
  interests: string[];
  bio: string;
  lookingFor: string;
  completedAt?: string;
  profileComplete?: boolean;
}

interface User {
  socket: Socket;
  profile?: UserProfile;
  joinedAt: Date;
}

// Store waiting users and active pairs
let waitingQueue: User[] = [];
let activePairs = new Map<string, string>(); // socketId -> partnerId
let userProfiles = new Map<string, UserProfile>(); // socketId -> profile

console.log("🚀 Omegle Video Chat Server Starting...");

io.on("connection", (socket: Socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Handle profile submission
  socket.on("submit-profile", (profile: UserProfile) => {
    userProfiles.set(socket.id, profile);
    console.log(
      `📝 Profile received for ${socket.id}: ${profile.name} (${profile.interests.length} interests)`
    );
  });

  // User requests to find a partner
  socket.on("find-partner", () => {
    console.log(
      `🔍 ${socket.id} looking for partner... (Queue length: ${waitingQueue.length})`
    );

    if (waitingQueue.length > 0) {
      // Find compatible partner based on interests
      const userProfile = userProfiles.get(socket.id);
      let partner = waitingQueue.shift()!;

      console.log(
        `👥 Attempting to pair ${socket.id} with ${partner.socket.id}`
      );

      // If user has profile, try to find compatible match
      if (userProfile && waitingQueue.length > 0) {
        const compatiblePartner = findCompatiblePartner(
          userProfile,
          waitingQueue
        );
        if (compatiblePartner) {
          // Remove compatible partner from queue
          waitingQueue = waitingQueue.filter(
            (user) => user.socket.id !== compatiblePartner.socket.id
          );
          partner = compatiblePartner;
          console.log(`🎯 Found compatible match with shared interests!`);
        }
      }

      // Create pair
      activePairs.set(socket.id, partner.socket.id);
      activePairs.set(partner.socket.id, socket.id);

      console.log(`🤝 Paired: ${socket.id} ↔ ${partner.socket.id}`);

      // Notify both users they're paired
      socket.emit("paired");
      partner.socket.emit("paired");

      console.log(`📡 Paired notifications sent to both users`);
    } else {
      // Add to waiting queue
      const user: User = {
        socket: socket,
        profile: userProfiles.get(socket.id),
        joinedAt: new Date(),
      };
      waitingQueue.push(user);
      socket.emit("waiting");
      console.log(
        `⏳ ${socket.id} added to waiting queue (${waitingQueue.length} waiting)`
      );
    }
  });

  // Forward WebRTC signaling messages to partner
  socket.on("signal", (data: SignalData) => {
    const partnerId = activePairs.get(socket.id);
    if (partnerId) {
      socket.to(partnerId).emit("signal", data);
      console.log(
        `📡 Signal forwarded from ${socket.id} to ${partnerId}: ${data.type}`
      );
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    handleDisconnection(socket);
  });

  // Manual disconnect from partner
  socket.on("disconnect-partner", () => {
    handleDisconnection(socket);
  });
});

function handleDisconnection(socket: Socket): void {
  console.log(`❌ User disconnected: ${socket.id}`);

  // Remove from waiting queue
  waitingQueue = waitingQueue.filter((user) => user.socket.id !== socket.id);

  // Handle active pair disconnection
  const partnerId = activePairs.get(socket.id);
  if (partnerId) {
    console.log(`💔 Breaking pair: ${socket.id} ↔ ${partnerId}`);

    // Notify partner of disconnection
    socket.to(partnerId).emit("partner-disconnected");

    // Clean up pair data
    activePairs.delete(socket.id);
    activePairs.delete(partnerId);
  }

  // Clean up user profile
  userProfiles.delete(socket.id);
}

// Function to find compatible partners based on shared interests
function findCompatiblePartner(
  userProfile: UserProfile,
  queue: User[]
): User | null {
  const userInterests = userProfile.interests;
  let bestMatch: User | null = null;
  let maxSharedInterests = 0;

  for (const user of queue) {
    if (user.profile) {
      const sharedInterests = userInterests.filter((interest) =>
        user.profile!.interests.includes(interest)
      ).length;

      if (sharedInterests > maxSharedInterests) {
        maxSharedInterests = sharedInterests;
        bestMatch = user;
      }
    }
  }

  // Return best match if they have at least 1 shared interest
  return maxSharedInterests > 0 ? bestMatch : null;
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🌟 Server running on port ${PORT}`);
  console.log(`📊 Status: Ready for connections`);
});

// Periodic stats logging
setInterval(() => {
  console.log(
    `📈 Stats - Waiting: ${waitingQueue.length}, Active pairs: ${
      activePairs.size / 2
    }`
  );
}, 30000);
