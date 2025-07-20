const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Store waiting users and active pairs
let waitingQueue = [];
let activePairs = new Map(); // socketId -> partnerId

console.log("🚀 Omegle Video Chat Server Starting...");

io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // User requests to find a partner
  socket.on("find-partner", () => {
    console.log(`🔍 ${socket.id} looking for partner...`);

    if (waitingQueue.length > 0) {
      // Match with waiting user
      const partner = waitingQueue.shift();

      // Create pair
      activePairs.set(socket.id, partner.id);
      activePairs.set(partner.id, socket.id);

      console.log(`🤝 Paired: ${socket.id} ↔ ${partner.id}`);

      // Notify both users they're paired
      socket.emit("paired");
      partner.emit("paired");
    } else {
      // Add to waiting queue
      waitingQueue.push(socket);
      socket.emit("waiting");
      console.log(
        `⏳ ${socket.id} added to waiting queue (${waitingQueue.length} waiting)`
      );
    }
  });

  // Forward WebRTC signaling messages to partner
  socket.on("signal", (data) => {
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

function handleDisconnection(socket) {
  console.log(`❌ User disconnected: ${socket.id}`);

  // Remove from waiting queue
  waitingQueue = waitingQueue.filter((user) => user.id !== socket.id);

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
