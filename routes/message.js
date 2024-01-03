const express = require('express');
const bodyParser = require('body-parser');
const isAuthenticated = require('../middleware/AuthMiddleware.js');
const User = require('../models/User.js');
const Message = require('../models/Message.js');

const router = express.Router();

// Middleware to parse JSON in request body
router.use(bodyParser.json());

// Middleware to check if the user is authenticated
router.use(isAuthenticated);

// Get all messages for a specific room
router.get('/:roomId', async (req, res) => {
  try {
    // Retrieve all messages for the specified room, populating the sender_user field
    const messages = await Message.find({ room: req.params.roomId }).populate('sender_user');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving messages.' });
  }
});

// Create a new message
router.post('/', async (req, res) => {
  try {
    const { content, room } = req.body;
    const userId = req.user._id;

    // Check if the user is authorized to send messages to the specified room
    const userInRoom = await User.findOne({ _id: userId, rooms: room });
    if (!userInRoom) {
      return res.status(403).json({ error: 'You are not authorized to send messages to this room.' });
    }

    // Create a new message and save it to the database
    const newMessage = new Message({ content, sender_user: userId, room });
    await newMessage.save();

    res.json(newMessage);
  } catch (error) {
    res.status(500).json({ error: 'Error sending the message.' });
  }
});

// Delete a message
router.delete('/:messageId', async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.user._id;

    // Find the message by ID
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found.' });
    }

    // Check if the user is the sender or an admin in the room
    const isSender = message.sender_user.toString() === userId.toString();
    const isAdmin = message.room && message.room.admins.some(admin => admin.toString() === userId.toString());

    if (!isSender && !isAdmin) {
      return res.status(403).json({ error: 'You are not authorized to delete this message.' });
    }

    // Mark the message as deleted in the database
    const deletedMessage = await Message.findByIdAndUpdate(messageId, { is_deleted: true }, { new: true });
    res.json(deletedMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting the message.' });
  }
});

module.exports = router;
