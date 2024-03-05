// import all the things we need  
const GoogleStrategy = require('passport-google-oauth20').Strategy
const mongoose = require('mongoose')
const User = require('../models/User')
const axios = require('axios');

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.CALLBACK_AUTH_URI,
      },
      async (accessToken, refreshToken, profile, done) => {
        //get the user data from google 

        const mail = profile.emails[0].value;
        let classe='';

        try {
          const response = await axios.get(`${process.env.CLASS_API_ENDPOINT}${mail}`, {
            headers: {
              Authorization: `Bearer ${process.env.CLASS_TOKEN}`,
            },
          });

          console.log('Risposta dalla richiesta:', response.data);
          classe = response.data.Classe;
        } catch (error) {
          console.error('Errore durante la richiesta:', error);
        }

        const newUser = {
          //_id: profile.id,
          username: profile.displayName,
          email: profile.emails[0].value,
          profile_image_url: profile.photos[0].value,
          class: classe,
        }

        try {
          //find the user in our database 
          let user = await User.findOne({ email: profile.emails[0].value })

          if (user) {
            console.log("UTENTE GIA' PRESENTE")
            //If user present in our database.
            done(null, user)
          } else {
            // if user is not preset in our database save user data to database.
            user = await User.create(newUser)
            done(null, user)
          }
        } catch (err) {
          console.error(err)
        }
      }
    )
  )

  // used to serialize the user for the session
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  // used to deserialize the user
  passport.deserializeUser(async (id, done) => {
    //console.log('Deserializzazione con ID:', id);

    try {
      const user = await User.findOne({ _id: id }).exec();

      if (user) {
        done(null, user);
      } else {
        done(new Error(`User with id ${id} not found`));
      }
    } catch (err) {
      console.error(err);
      done(err);
    }
  });
}