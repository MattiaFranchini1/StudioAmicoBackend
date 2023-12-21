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

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
//const jwt = require('jsonwebtoken');

// Configura la strategia di autenticazione Google con Passport
passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_AUTH_URI,
},
async (accessToken, refreshToken, profile, done) => {
  try {
    // Trova o crea un utente nel tuo database
    const user = await User.findOne({ googleId: profile.id });

    if (user) {
      // Se l'utente esiste già, restituisci l'utente
      return done(null, user);
    } else {
      // Se l'utente non esiste, crea un nuovo utente nel database
      const newUser = new User({
        googleId: profile.id,
        username: profile.displayName,
        email: profile.emails[0].value,
        profile_image_url: profile.photos[0].value
        // Altri campi utente che desideri salvare
      });

      await newUser.save();
      return done(null, newUser);
    }
  } catch (error) {
    return done(error, null);
  }
}));

// Serializza l'utente per salvarlo nella sessione
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserializza l'utente dalla sessione
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Inizializza Passport e imposta le sessioni
router.use(passport.initialize());
router.use(passport.session());

// Rotte per l'autenticazione con Google
router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/api/user/dashboard/verify');
  }
);

// Verify the auth
router.get('/dashboard/verify', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ message: 'Accesso consentito', user: req.user });
  } else {
    res.status(401).json({ error: 'Accesso non autorizzato' });
  }
});


module.exports = router;
