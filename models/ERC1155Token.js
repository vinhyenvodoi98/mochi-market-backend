const mongoose = require('mongoose');
const { Schema } = mongoose;

const ERC1155TokenSchema = new Schema(
  {
    tokenId: {
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
    thumb: {
      type: String,
    },
    description: {
      type: String,
    },
    attributes: [],
    amount: {
      type: Number,
    },
    nft: { type: Schema.Types.ObjectId, refPath: 'NFT' },
  },
  {
    timestamps: true,
  }
);

const ERC1155Token = mongoose.model('ERC1155Token', ERC1155TokenSchema);

module.exports = ERC1155Token;
