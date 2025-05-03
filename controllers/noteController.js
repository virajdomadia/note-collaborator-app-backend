const Note = require("../models/Note");

// Create
const createNote = async (req, res) => {
  const { title, content } = req.body;
  try {
    const note = await Note.create({
      title,
      content,
      createdBy: req.user,
    });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: "Error creating note" });
  }
};

// Update
const updateNote = async (req, res) => {
  const { title, content } = req.body;

  try {
    req.note.title = title || req.note.title;
    req.note.content = content || req.note.content;
    req.note.lastUpdated = Date.now();

    await req.note.save();
    res.json(req.note);
  } catch (err) {
    res.status(500).json({ message: "Error updating note" });
  }
};

// Delete (only owner)
const deleteNote = async (req, res) => {
  const note = req.note;

  if (note.createdBy.toString() !== req.user) {
    return res.status(403).json({ message: "Only owner can delete" });
  }

  try {
    await note.deleteOne(); // ✅ Updated from note.remove()
    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting note" });
  }
};

// Get all notes (owned + shared)
const getMyNotes = async (req, res) => {
  try {
    const notes = await Note.find({
      $or: [{ createdBy: req.user }, { "collaborators.user": req.user }],
    }).populate("createdBy", "name email");

    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notes" });
  }
};

// Share note
const shareNote = async (req, res) => {
  const { userId, permission } = req.body;
  const note = req.note;

  // Prevent duplicate
  if (note.collaborators.some((c) => c.user.toString() === userId)) {
    return res.status(400).json({ message: "User already a collaborator" });
  }

  note.collaborators.push({ user: userId, permission });
  await note.save();

  res.json({ message: "Collaborator added", note });
};

module.exports = {
  createNote,
  updateNote,
  deleteNote,
  getMyNotes,
  shareNote,
};
