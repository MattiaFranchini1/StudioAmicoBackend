// routes/user.js
const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
require('dotenv').config();
//const authMiddleware = require('../middleware/authMiddleware');


router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/*
router.put('/:userId', authMiddleware, async (req, res) => {
  const userId = req.params.userId;
  const newData = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(userId, newData, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
*/

router.post('/register', async (req, res) => {
  try {
    const { username, email, profile_image_url } = req.body;

    // Verifica se l'utente esiste già
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'L\'utente con questa email già esiste' });
    }

    // Crea un nuovo utente
    const newUser = new User({
      username,
      email,
      profile_image_url,
    });

    // Salva l'utente nel database
    await newUser.save();


    res.status(201).json({ message: 'Utente registrato con successo', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore durante la registrazione dell\'utente' });
  }
});

module.exports = router;
