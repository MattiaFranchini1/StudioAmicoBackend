const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profile_image_url: { type: String, required: true },
  registered_at: { type: Date, default: Date.now },
  class: {type: String/*, required: true*/ },
  bio: {type: String},
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
  teaching_review_total_stars: { type: Number, default: 0.0 },
  teaching_review_total_number: {type: Number, default: 0},
  learning_review_total_stars: { type: Number, default: 0.0 },
  learning_review_total_number: {type: Number, default: 0},
  counter_hour_teaching: { type: Number, default: 0 },
  counter_hour_learning: { type: Number, default: 0 },
}, {
  versionKey: false
});

const User = mongoose.model('User', userSchema);

module.exports = User;
