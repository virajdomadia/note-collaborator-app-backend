const { Server } = require("socket.io");

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*", // Change this if your frontend URL is different
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`🟢 New socket connected: ${socket.id}`);

    // Join a specific note room
    socket.on("joinNoteRoom", (noteId) => {
      socket.join(noteId);
      console.log(`Socket ${socket.id} joined room: ${noteId}`);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`🔴 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

module.exports = setupSocket;
