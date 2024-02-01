const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const initializeSocket = require('./sockets/socketManager');
const userRoutes = require('./routes/user');
const passport = require('passport');
require('dotenv').config();
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('./auth/passport')(passport)

const app = express();
const server = http.createServer(app);
const io = initializeSocket(server);

const port = 3000;

// Connect to MongoDB using the URI from the environment variables
mongoose.connect(process.env.ATLAS_URI, /*{ useNewUrlParser: true, useUnifiedTopology: true }*/);

// CORS configuration
const corsOptions = {
  origin: '*',
  credentials: true,
};
app.use(cors(corsOptions));


// Express middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.ATLAS_URI })
  })
)

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())

// API routes
app.use('/api/users', userRoutes);
server.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
