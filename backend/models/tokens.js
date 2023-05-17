const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique:true
  },
  tokens: [{
    token: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: '2h' // Token will expire after 2 hours
    }
  }]
});

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
