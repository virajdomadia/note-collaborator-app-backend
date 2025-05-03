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
};

module.exports = { canEdit, canView };
