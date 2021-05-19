const mongoose = require('mongoose');
const { Schema } = mongoose;

const ERC721TokenSchema = new Schema(
  {
    index: {
      type: Number,
      required: true,
    },
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
  },
  {
    timestamps: true,
  }
);

const ERC721Token = mongoose.model('ERC721Token', ERC721TokenSchema);

module.exports = ERC721Token;
