const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
require('dotenv').config();
const isAuthenticated = require('../middleware/AuthMiddleware.js');
const passport = require('passport')

router.get('/auth/google', passport.authenticate('google', { scope: ['profile','email'] }))


router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    console.log("Redirecting...")
    //console.log(req.user)
    res.redirect(process.env.ORIGIN_FRONTEND)
  }
)

router.get('/logout', (req, res) => {
  req.logout(() => {
    res.json({ success: true, message: 'Logout successful' });
  });
});


router.get('/profile', (req, res) => {
  res.json({
    user: req.user
  });
});


// Middleware for checking user authentication
router.use(isAuthenticated);

// Routes for fetching all users, a specific user, and updating a user
router.get('/', async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find();
    res.json(users);
  } catch (error) {
    // Handle internal server error
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    // Fetch a specific user by ID from the database
    const user = await User.findById(userId);
    if (!user) {
      // If user not found, return a 404 status
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    // Handle internal server error
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/:userId', async (req, res) => { //change account options -- not implemented now
  const userId = req.params.userId;
  const newData = req.body;
  try {
    // Update a specific user by ID in the database
    const updatedUser = await User.findByIdAndUpdate(userId, newData, { new: true });
    if (!updatedUser) {
      // If user not found, return a 404 status
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(updatedUser);
  } catch (error) {
    // Handle internal server error
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
