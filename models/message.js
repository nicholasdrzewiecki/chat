var mongoose = require('mongoose');

var MessageSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  }
});

var Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
