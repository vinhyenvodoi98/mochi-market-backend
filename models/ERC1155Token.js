const mongoose = require('mongoose');
const { Schema } = mongoose;

const ERC1155TokenSchema = new Schema(
  {
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
    amount: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const ERC1155Token = mongoose.model('ERC1155Token', ERC1155TokenSchema);

module.exports = ERC1155Token;
