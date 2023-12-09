const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  uploader_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, //auto-generated
  description: { type: String },
  file_name: { type: String, required: true },
  file_url: { type: String, required: true }, //"auto-generated"
  timestamp: { type: Date, default: Date.now }, //auto-generated
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true }, //"auto-generated"
});

const File = mongoose.model('File', fileSchema);

module.exports = File;
