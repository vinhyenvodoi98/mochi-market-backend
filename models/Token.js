const mongoose = require('mongoose');
const { Schema } = mongoose;

const TokenSchema = new Schema({
  index: {},
  tokenURI: {
    type: String,
  },
  name: {
    type: String,
  },
  image: {
    type: String,
  },
  description: {
    type: String,
  },
  addressToken: {
    type: String,
    match: [/^0x[a-fA-F0-9]{40}$/, 'address is invalid'],
  },
});

const Token = mongoose.model('Token', TokenSchema);

module.exports = Token;
