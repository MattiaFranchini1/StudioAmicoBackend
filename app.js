const express = require('express')
const cors=require('cors')
const mongoose = require('mongoose');

const userRoutes = require('./routes/user');
require('dotenv').config();
const session = require('express-session');
const passport = require('passport');
const app = express()

const port = 3000

mongoose.connect(process.env.ATLAS_URI, /*{ useNewUrlParser: true, useUnifiedTopology: true }*/);

app.use(cors({
    origin:'*'
}));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET, // Sostituisci con una stringa segreta robusta
  resave: false,
  saveUninitialized: true,
  // store: ... // Opzionale: specifica uno store per le sessioni (ad esempio, se usi MongoDB)
}));

// Inizializza Passport e imposta le sessioni
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/user', userRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})