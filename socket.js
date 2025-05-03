const { Server } = require("socket.io");

let io;

const setupSocket = (server) => {
  console.log("Setting up Socket.io..."); // Debug message
  io = new Server(server, {
    cors: {
      origin: "*", // Can be updated to specific frontend URL later
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`🟢 New socket connected: ${socket.id}`);

    socket.on("joinNoteRoom", (noteId) => {
      socket.join(noteId);
      console.log(`Socket ${socket.id} joined room: ${noteId}`);
    });

    socket.on("disconnect", () => {
      console.log(`🔴 Socket disconnected: ${socket.id}`);
    });
  });
};

const emitEvent = (room, event, data) => {
  if (io) {
    io.to(room).emit(event, data);
  } else {
    console.error("Socket.io is not initialized");
  }
};

module.exports = { setupSocket, emitEvent };
