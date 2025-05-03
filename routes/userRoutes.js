const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const User = require("../models/User");
const router = express.Router();

// Example of a protected route
router.get("/profile", protect, (req, res) => {
  res.json({ message: "Protected profile", userId: req.user });
});

router.get("/email/:email", protect, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user by email:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
