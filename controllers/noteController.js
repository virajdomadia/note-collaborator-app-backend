const Note = require("../models/Note");
const { emitEvent } = require("../socket"); // Import the helper
const Notification = require("../models/Notification");
// const { canView } = require("../middlewares/noteAccess");

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

const updateNote = async (req, res) => {
  const { title, content } = req.body;

  try {
    req.note.title = title || req.note.title;
    req.note.content = content || req.note.content;
    req.note.lastUpdated = Date.now();
    await req.note.save();

    emitEvent(req.note._id.toString(), "noteUpdated", {
      noteId: req.note._id,
      updatedBy: req.user, // user ID or lookup user info
      message: "Note has been updated",
    });

    await Promise.all(
      req.note.collaborators.map((collab) =>
        Notification.create({
          note: req.note._id,
          user: collab.user,
          message: "Note has been updated",
        })
      )
    );

    res.json(req.note);
  } catch (err) {
    res.status(500).json({ message: "Error updating note" });
  }
};

const deleteNote = async (req, res) => {
  const note = req.note;

  if (note.createdBy.toString() !== req.user) {
    return res.status(403).json({ message: "Only owner can delete" });
  }

  try {
    await note.deleteOne();
    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting note" });
  }
};

const getMyNotes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sort || "-updatedAt";
    const tab = req.query.tab || "myNotes"; // 🆕 Get the active tab

    let query = {};

    if (tab === "myNotes") {
      // Only notes I created
      query = { createdBy: req.user };
    } else if (tab === "sharedWithMe") {
      // Notes shared with me, but not created by me
      query = {
        "collaborators.user": req.user,
        createdBy: { $ne: req.user }, // Ensuring the creator is not the logged-in user
      };
    } else {
      // Fallback: all notes I have access to
      query = {
        $or: [{ createdBy: req.user }, { "collaborators.user": req.user }],
      };
    }

    const totalNotes = await Note.countDocuments(query);

    const notes = await Note.find(query)
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("createdBy", "name email")
      .populate("collaborators.user", "name email");

    res.json({
      notes,
      page,
      totalPages: Math.ceil(totalNotes / limit),
      totalNotes,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching notes" });
  }
};

const getNoteById = async (req, res) => {
  const { id } = req.params;

  try {
    const note = await Note.findById(id)
      .populate("createdBy", "name email")
      .populate("collaborators.user", "name email");
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Optional: Check if the user has access permissions to view the note
    // if (!canView(req.user, note)) {
    //   return res
    //     .status(403)
    //     .json({ message: "You do not have permission to view this note" });
    // }

    res.status(200).json(note);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const shareNote = async (req, res) => {
  const { userId, permission } = req.body;
  const note = req.note;

  // Avoid duplicate collaborators
  if (note.collaborators.some((c) => c.user.toString() === userId)) {
    return res.status(400).json({ message: "User already a collaborator" });
  }

  // Add the collaborator
  note.collaborators.push({ user: userId, permission });
  await note.save();

  // Emit socket event to the user (real-time notification)
  emitEvent(userId.toString(), "note:shared", {
    noteId: note._id,
    title: note.title,
    sharedBy: req.user, // Optional: use user info instead of just ID
  });

  // Save notification in DB
  await Notification.create({
    note: note._id,
    user: userId,
    message: `A note titled "${note.title}" was shared with you`,
  });

  res.json({ message: "Collaborator added", note });
};

const updateCollaboratorPermission = async (req, res) => {
  const { collaboratorId } = req.params;
  const { permission } = req.body;
  const note = req.note;

  if (note.createdBy.toString() !== req.user) {
    return res
      .status(403)
      .json({ message: "Only owner can update permissions" });
  }

  const collaborator = note.collaborators.find(
    (c) => c.user.toString() === collaboratorId
  );

  if (!collaborator) {
    return res.status(404).json({ message: "Collaborator not found" });
  }

  collaborator.permission = permission;
  await note.save();

  res.json({ message: "Collaborator permission updated", note });
};

const removeCollaborator = async (req, res) => {
  const { collaboratorId } = req.params;
  const note = req.note;

  if (note.createdBy.toString() !== req.user) {
    return res
      .status(403)
      .json({ message: "Only owner can remove collaborators" });
  }

  const originalCount = note.collaborators.length;
  note.collaborators = note.collaborators.filter(
    (c) => c.user.toString() !== collaboratorId
  );

  if (note.collaborators.length === originalCount) {
    return res.status(404).json({ message: "Collaborator not found" });
  }

  await note.save();
  res.json({ message: "Collaborator removed", note });
};

module.exports = {
  createNote,
  updateNote,
  deleteNote,
  getMyNotes,
  getNoteById,
  shareNote,
  updateCollaboratorPermission,
  removeCollaborator,
};
