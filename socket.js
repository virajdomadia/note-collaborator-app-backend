const { Server } = require("socket.io");

let io;

const setupSocket = (server) => {
  console.log("Setting up Socket.io...");
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`New socket connected: ${socket.id}`);

    // Join a note-specific room (for editing)
    socket.on("joinNoteRoom", (noteId) => {
      socket.join(noteId);
      console.log(`Socket ${socket.id} joined room: ${noteId}`);
    });

    // Join a user-specific room (for notifications)
    socket.on("joinUserRoom", (userId) => {
      socket.join(userId);
      console.log(`Socket ${socket.id} joined user room: ${userId}`);
    });

    // Handle note update event
    socket.on("updateNote", (updatedNote) => {
      // Emit the update to the specific room
      socket.to(updatedNote._id).emit("noteUpdated", updatedNote);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
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
