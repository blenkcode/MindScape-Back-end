var express = require("express");
var router = express.Router();
const Chat = require("../models/messages");

// Route pour obtenir tous les messages
router.get("/api/messages", async (req, res, next) => {
  try {
    const messages = await Chat.find({});
    res.json(messages);
  } catch (err) {
    next(err);
  }
});

router.get("/api/messages/:projectID", async (req, res, next) => {
  try {
    const { projectID } = req.params;
    const messages = await Chat.find({ projectID });
    res.json(messages);
  } catch (err) {
    next(err);
  }
});
router.get("/api/private-messages/:user1/:user2", async (req, res, next) => {
  const { user1, user2 } = req.params;
  try {
    const messages = await Chat.find({
      $or: [
        { senderId: user1, recipientId: user2 },
        { senderId: user2, recipientId: user1 },
      ],
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    next(err);
  }
});

router.post("/api/private-message", async (req, res, next) => {
  const { message, senderId, recipientId } = req.body;
  try {
    const newMessage = new Chat({
      message,
      username: req.user.name,
      senderId,
      recipientId,
    });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    next(err);
  }
});
module.exports = router;
