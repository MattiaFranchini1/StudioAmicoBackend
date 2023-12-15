const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true }, //auto-generated
  email: { type: String, required: true, unique: true}, //auto-generated
  //password: { type: String, required: true }, //auto-generated -- we do google auth (we don't know user password and we don't mind)
  profile_image_url: { type: String, required: true}, //auto-generated
  registered_at: { type: Date, default: Date.now }, //auto-generated
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
  teaching_review: {type: Number, default: 0.0}, // -- Number is correct --Default value : 0 --
  learning_review: {type: Number, default: 0.0}, // -- Number is correct -- Default value : 0 --
  counter_hour_teaching:{type: Number, default: 0}, //? -- Default value : 0 -- minutes counter --
  counter_hour_learning:{type: Number, default: 0}, //? -- Default value : 0 -- minutes counter --
});

const User = mongoose.model('User', userSchema);

module.exports = User;