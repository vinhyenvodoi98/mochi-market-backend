const mongoose = require('mongoose');
const { Schema } = mongoose;

const NFTSchema = new Schema(
  {
    address: {
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
    avatar: {
      type: String,
      trim: true,
    },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
    tokens: [{ type: Schema.Types.ObjectId, refPath: 'onModel' }],
    onModel: {
      type: String,
      required: true,
      enum: ['ERC721Token', 'ERC1155Token'],
    },
    isVerify: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const NFT = mongoose.model('NFT', NFTSchema);

module.exports = NFT;
