const mongoose = require('mongoose');
const { Schema } = mongoose;
const { Token } = require('./Token');

const NFTSchema = new Schema({
  address: {
    type: String,
    trim: true,
    required: true,
    match: [/^0x[a-fA-F0-9]{40}$/, 'address is invalid'],
  },
  addressToken: {
    type: String,
    trim: true,
    required: true,
    match: [/^0x[a-fA-F0-9]{40}$/, 'address is invalid'],
  },
  name: {
    type: String,
    trim: true,
    required: true,
  },
  symbol: {
    type: String,
    trim: true,
    required: true,
  },
  avatarToken: {
    type: String,
    trim: true,
  },
  tags: {
    type: Array,
  },
  tokens: {
    type: Array,
  },
});

const NFT = mongoose.model('NFT', NFTSchema);

module.exports = NFT;
