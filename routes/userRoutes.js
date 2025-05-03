const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const router = express.Router();

// Example of a protected route
router.get("/profile", protect, (req, res) => {
  res.json({ message: "Protected profile", userId: req.user });
});

module.exports = router;
