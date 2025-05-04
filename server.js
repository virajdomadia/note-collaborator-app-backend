const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const noteRoutes = require("./routes/noteRoutes");

const { setupSocket } = require("./socket"); // Make sure you are destructuring correctly

const app = express();
dotenv.config();

const server = http.createServer(app);

setupSocket(server);

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notes", noteRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
