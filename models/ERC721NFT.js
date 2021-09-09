const mongoose = require('mongoose');
const { Schema } = mongoose;

const ERC721NFTSchema = new Schema(
  {
    chainId: {
      type: String,
      require: true,
    },
    collectionAddress: {
      type: String,
      match: [/^0x[a-fA-F0-9]{40}$/, 'address is invalid'],
    },
    tokenId: {
      type: String,
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
    attributes: [],
    description: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

ERC721NFTSchema.index({ chainId: 1, collectionAddress: 1, tokenId: 1 }, { unique: true });
ERC721NFTSchema.index({ name: 'text', description: 'text', attributes: 'text', tokenId: 'text' });

const ERC721NFT = mongoose.model('ERC721NFT', ERC721NFTSchema);

module.exports = ERC721NFT;
