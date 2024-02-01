const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Room = require('../models/Room');
const File = require('../models/File');
const { v4: uuidv4 } = require('uuid');

const isAuthenticated = require('../middleware/AuthMiddleware');

router.use(isAuthenticated);

// Configure storage for multer to save files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const roomId = req.params.roomId;
    const roomDirectory = path.resolve(`./uploads/${roomId}`);
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(roomDirectory)) {
      fs.mkdirSync(roomDirectory);
    }

    cb(null, roomDirectory);
  },
  filename: function (req, file, cb) {
    // Generate a unique filename using uuid and the original file extension
    const uniqueFileName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueFileName);
  }
});

// Configure multer with the storage options
const upload = multer({ storage: storage });

// Handle file upload
router.post('/:roomId/upload', upload.single('file'), async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const userId = req.user._id;
    const { originalname, filename } = req.file;
    const fileUrl = `/uploads/${roomId}/${filename}`;

    //console.log('Room ID:', roomId);
    //console.log('User ID:', userId);
    //console.log('File Info:', originalname, filename);
    //console.log('File URL:', fileUrl);

    // Create a new file record in the database
    const newFile = new File({
      uploader_user: userId,
      description: req.body.description,
      file_name: originalname,
      file_url: fileUrl,
      room: roomId,
    });

    await newFile.save();

    // Add the file to the list of files in the room
    await Room.findByIdAndUpdate(roomId, { $addToSet: { files: newFile._id } });

    res.json(newFile);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Error uploading the file.' });
  }
});

// Serve files by their file ID
router.get('/:fileId', (req, res) => {
  const filePath = path.resolve(req.params.fileId);
  res.sendFile(filePath);
});

// Get all files associated with a room
router.get('/:roomId/files', async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const room = await Room.findById(roomId).populate('files');
    if (!room) {
      return res.status(404).json({ error: 'Room not found.' });
    }

    res.json(room.files);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving room files.' });
  }
});

module.exports = router;
