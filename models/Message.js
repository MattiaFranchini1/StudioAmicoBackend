const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: [{ type: String, required: true }],   //to keep history of messages (modified)
  timestamp: { type: Date, default: Date.now },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  message_to_reply: {type: mongoose.Schema.Types.ObjectId, ref: 'Message'}, 
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
