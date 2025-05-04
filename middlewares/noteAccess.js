const Note = require("../models/Note");

const canEdit = async (req, res, next) => {
  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ message: "Note not found" });

  const userId = req.user;

  if (
    note.createdBy.toString() === userId ||
    note.collaborators.some(
      (c) => c.user.toString() === userId && c.permission === "write"
    )
  ) {
    req.note = note;
    return next();
  }

  return res.status(403).json({ message: "No write permission" });
};

const canView = async (req, res, next) => {
  console.log("canView req.params:", req.params);
  console.log("canView req.user:", req.user);
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    const userId = req.user;

    if (
      note.createdBy.toString() === userId ||
      note.collaborators.some((c) => c.user.toString() === userId)
    ) {
      req.note = note;
      return next();
    }

    return res.status(403).json({ message: "No access" });
  } catch (err) {
    console.error("canView error:", err);
    return res.status(500).json({ message: "Server error in canView" });
  }
};

module.exports = { canEdit, canView };
