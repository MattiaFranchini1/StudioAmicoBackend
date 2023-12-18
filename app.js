const express = require('express')
const cors=require('cors')
const mongoose = require('mongoose');
const userRoutes = require('./routes/user');
require('dotenv').config();
const app = express()

const port = 3000

mongoose.connect(process.env.ATLAS_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors({
    origin:'*'
}));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.use('/api/user', userRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})