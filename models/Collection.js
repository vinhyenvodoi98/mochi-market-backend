const mongoose = require('mongoose');
const { Schema } = mongoose;

const CollectionSchema = new Schema(
  {
    address: {
      type: String,
      trim: true,
      required: true,
      match: [/^0x[a-fA-F0-9]{40}$/, 'address is invalid'],
    },
    chainId: {
      type: String,
      required: true,
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
    uriFormat: {
      type: String,
    },
    type: {
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

CollectionSchema.index({ chainId: 1, address: 1 }, { unique: true });

const Collection = mongoose.model('Collection', CollectionSchema);

module.exports = Collection;
