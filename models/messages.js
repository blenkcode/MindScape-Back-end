const mongoose = require("mongoose");

const messagesSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  projectID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Messages = mongoose.model("Messages", messagesSchema);

module.exports = Messages;
