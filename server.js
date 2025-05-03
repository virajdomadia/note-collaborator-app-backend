const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const noteRoutes = require("./routes/noteRoutes");

// Import the socket setup function
const setupSocket = require("./socket");

const app = express();
dotenv.config();

// Create HTTP server
const server = http.createServer(app);

// Set up Socket.io
setupSocket(server); // No need to export io or server from here anymore

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Routes
app.use("/api/auth", authRoutes); // Auth routes (signup/login)
app.use("/api/users", userRoutes); // User routes (protected profile)
app.use("/api/notes", noteRoutes); // Note routes (CRUD operations)

// Start the server with Socket.io
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
