const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true }, //auto-generated
  email: { type: String, required: true, unique: true}, //auto-generated
  password: { type: String, required: true }, //auto-generated
  profile_image_url: { type: String, required: true}, //auto-generated
  registered_at: { type: Date, default: Date.now }, //auto-generated
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
  teaching_review: {type: Float32Array},
  learning_review: {type: Float32Array},
  counter_hour_teaching:{type: Number}, //?
  counter_hour_learning:{type: Number}, //?
});

const User = mongoose.model('User', userSchema);

module.exports = User;