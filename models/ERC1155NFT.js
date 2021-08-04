const mongoose = require('mongoose');
const { Schema } = mongoose;

const ERC1155NFTSchema = new Schema(
  {
    chainId: {
      type: String,
    },
    collectionAddress: {
      type: String,
      match: [/^0x[a-fA-F0-9]{40}$/, 'address is invalid'],
    },
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
  },
  {
    timestamps: true,
  }
);

ERC1155NFTSchema.index({ name: 'text', description: 'text', attributes: 'text' });

const ERC1155NFT = mongoose.model('ERC1155NFT', ERC1155NFTSchema);

module.exports = ERC1155NFT;
