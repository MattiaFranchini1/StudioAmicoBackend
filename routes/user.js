const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
require('dotenv').config();
const isAuthenticated = require('../middleware/AuthMiddleware.js');

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Passport configuration for Google OAuth 2.0
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_AUTH_URI,
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if the user exists in the database
    const user = await User.findOne({ email: profile.emails[0].value });

    if (user) {
      // If user exists, authenticate and proceed
      return done(null, user);
    } else {
      // If user doesn't exist, create a new user and save it to the database
      const newUser = new User({
        googleId: profile.id,
        username: profile.displayName,
        email: profile.emails[0].value,
        profile_image_url: profile.photos[0].value
      });

      await newUser.save();
      return done(null, newUser);
    }
  } catch (error) {
    // Handle errors during authentication
    return done(error, null);
  }
}));

// Serialize user information for session storage
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user information from session storage
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Initialize and use Passport middleware
router.use(passport.initialize());
router.use(passport.session());

// Google OAuth 2.0 authentication routes
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Redirect to the dashboard verification endpoint upon successful authentication
    res.redirect('/api/users/dashboard/verify');
  }
);

// Dashboard verification route
router.get('/dashboard/verify', (req, res) => {
  // Check if the user is authenticated
  if (req.isAuthenticated()) {
    res.json({ message: 'Access granted', user: req.user });
  } else {
    // If not authenticated, return unauthorized status
    res.status(401).json({ error: 'Unauthorized access' });
  }
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

router.put('/:userId', async (req, res) => {
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
