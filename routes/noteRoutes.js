const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { canEdit, canView } = require("../middlewares/noteAccess");
const {
  createNote,
  updateNote,
  deleteNote,
  getMyNotes,
  getNoteById,
  shareNote,
  updateCollaboratorPermission,
  removeCollaborator,
} = require("../controllers/noteController");

// Note CRUD
router.post("/", protect, createNote);
router.get("/", protect, getMyNotes);
router.get("/:id", protect, canView, getNoteById);
router.put("/:id", protect, canEdit, updateNote);
router.delete("/:id", protect, canEdit, deleteNote);

// Collaborator management
router.post("/:id/share", protect, canEdit, shareNote);
router.put(
  "/:id/collaborators/:collaboratorId",
  protect,
  canEdit,
  updateCollaboratorPermission
);
router.delete(
  "/:id/collaborators/:collaboratorId",
  protect,
  canEdit,
  removeCollaborator
);

module.exports = router;
