const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { canEdit, canView } = require("../middlewares/noteAccess");
const {
  createNote,
  updateNote,
  deleteNote,
  getMyNotes,
  shareNote,
} = require("../controllers/noteController");

router.post("/", protect, createNote);
router.get("/", protect, getMyNotes);
router.put("/:id", protect, canEdit, updateNote);
router.delete("/:id", protect, canEdit, deleteNote);
router.post("/:id/share", protect, canEdit, shareNote);

module.exports = router;
