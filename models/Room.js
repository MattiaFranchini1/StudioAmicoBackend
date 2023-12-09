const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  room_name: { type: String, required: true },
  subject: [{ type: String, required: true }],
  class_level: { type: Number, required: true },
  class_type: {type: String, required: true},
  host_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, //auto-generated
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
  meet_link: { type: String, required: true}, //auto-generated
  admins: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
