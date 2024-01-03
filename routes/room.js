const express = require('express');
const bodyParser = require('body-parser');
const isAuthenticated = require('../middleware/AuthMiddleware.js');
const router = express.Router();
const Room = require('../models/Room.js');
const User = require('../models/User.js');

// Middleware to parse JSON in request body
router.use(bodyParser.json());

// Middleware to check if the user is authenticated
router.use(isAuthenticated);

// Get all rooms
router.get('/all', async (req, res) => {
  try {
    // Retrieve all rooms from the database, populating participants and messages
    const rooms = await Room.find().populate('participants').populate('messages');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving all rooms.' });
  }
});

// Get rooms for the authenticated user
router.get('/', async (req, res) => {
  try {
    // Retrieve rooms for the authenticated user, populating participants and messages
    const rooms = await Room.find({ participants: req.user._id }).populate('participants').populate('messages');
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving rooms.' });
  }
});

// Create a new room
router.post('/', async (req, res) => {
  try {
    const { room_name, subject, class_level, class_type, meet_link } = req.body;
    const host_user = req.user._id;

    // Create a new room and save it to the database
    const newRoom = new Room({
      room_name,
      subject,
      class_level,
      class_type,
      host_user,
      meet_link,
      participants: [host_user],
      admins: [host_user],
    });

    await newRoom.save();

    // Update the host user's rooms array to include the created room
    await User.findByIdAndUpdate(host_user, { $addToSet: { rooms: newRoom._id } });

    res.json(newRoom);
  } catch (error) {
    res.status(500).json({ error: 'Error creating the room.' });
  }
});

// Get details of a specific room
router.get('/:roomId', async (req, res) => {
  try {
    // Retrieve a specific room by ID, populating participants, messages, and files
    const room = await Room.findById(req.params.roomId).populate('participants').populate('messages').populate('files');
    if (!room) {
      return res.status(404).json({ error: 'Room not found.' });
    }

    res.json(room);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving the room.' });
  }
});

// Join a room
router.post('/:roomId/join', async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const userId = req.user._id;

    // Find the room by ID
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found.' });
    }

    // Check if the user is already a participant in the room
    if (room.participants.includes(userId)) {
      return res.status(400).json({ error: 'User is already a participant in the room.' });
    }

    // Add the user to the participants of the room
    await Room.findByIdAndUpdate(roomId, { $addToSet: { participants: userId } });
    // Update the user's rooms array to include the joined room
    await User.findByIdAndUpdate(userId, { $addToSet: { rooms: roomId } });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error joining the room.' });
  }
});

// Export the router
module.exports = router;
