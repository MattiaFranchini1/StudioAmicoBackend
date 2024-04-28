const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
const Event = require('../models/Event.js'); // Importa lo schema degli eventi
require('dotenv').config();
const isAuthenticated = require('../middleware/AuthMiddleware.js');
const passport = require('passport')

// Rotte per l'autenticazione con Google
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

router.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    console.log("Redirecting...")
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

// Middleware per verificare l'autenticazione dell'utente
router.use(isAuthenticated);

// Rotte per ottenere tutti gli utenti, un utente specifico e aggiornare un utente
router.get('/', async (req, res) => {
  try {
    // Ottieni tutti gli utenti dal database
    const users = await User.find();
    res.json(users);
  } catch (error) {
    // Gestisci l'errore interno del server
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    // Ottieni un utente specifico per ID dal database
    const user = await User.findById(userId);
    if (!user) {
      // Se l'utente non viene trovato, restituisci uno stato 404
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    // Gestisci l'errore interno del server
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put('/:userId', async (req, res) => { // Modifica le opzioni dell'account -- non implementato ora
  const userId = req.params.userId;
  const newData = req.body;
  try {
    // Aggiorna un utente specifico per ID nel database
    const updatedUser = await User.findByIdAndUpdate(userId, newData, { new: true });
    if (!updatedUser) {
      // Se l'utente non viene trovato, restituisci uno stato 404
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(updatedUser);
  } catch (error) {
    // Gestisci l'errore interno del server
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Aggiungi un nuovo evento per un utente specifico
router.post('/:userId/events', async (req, res) => {
  const userId = req.params.userId;
  const eventData = req.body;
  try {
    // Crea un nuovo evento
    const newEvent = new Event(eventData);
    // Salva l'evento nel database
    await newEvent.save();
    // Aggiungi l'ID dell'evento agli eventi dell'utente
    await User.findByIdAndUpdate(userId, { $push: { events: newEvent._id } });
    res.json(newEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Elimina un evento specifico per un utente
router.delete('/:userId/events/:eventId', async (req, res) => {
  const userId = req.params.userId;
  const eventId = req.params.eventId;
  try {
    // Trova l'utente per ID e rimuovi l'evento dall'array degli eventi dell'utente
    await User.findByIdAndUpdate(userId, { $pull: { events: eventId } });
    // Elimina l'evento dal database
    await Event.findByIdAndDelete(eventId);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Ottieni tutti gli eventi di un utente specifico
router.get('/:userId/events', async (req, res) => {
  const userId = req.params.userId;
  try {
    // Trova l'utente per ID e ottieni gli eventi associati all'utente
    const user = await User.findById(userId).populate('events');
    if (!user) {
      // Se l'utente non viene trovato, restituisci uno stato 404
      return res.status(404).json({ error: 'User not found' });
    }
    // Restituisci gli eventi dell'utente
    res.json(user.events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;
