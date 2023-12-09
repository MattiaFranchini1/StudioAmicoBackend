const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, //auto-generated
  content: [{ type: String, required: true }],   //to keep history of messages (modified)
  timestamp: { type: Date, default: Date.now }, //auto-generated
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  message_to_reply: {type: mongoose.Schema.Types.ObjectId, ref: 'Message'},
  is_deleted: {type: Boolean, default: false}, //auto-generated
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
