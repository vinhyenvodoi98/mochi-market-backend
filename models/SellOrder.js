const mongoose = require('mongoose');
const { Schema } = mongoose;

const SellOrderSchema = new Schema(
  {
    sellId: {
      type: Number,
      required: true,
    },
    chainId: {
      type: String,
    },
    collectionAddress: { type: String, match: [/^0x[a-fA-F0-9]{40}$/, 'address is invalid'] },
    tokenId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
    },
    soldAmount: {
      type: Number,
    },
    seller: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    sellTime: {
      type: Number,
    },
    buyers: [],
    buyTimes: [],
    isActive: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

SellOrderSchema.index({ chainId: 1, sellId: 1 }, { unique: true });
const SellOrder = mongoose.model('SellOrder', SellOrderSchema);

module.exports = SellOrder;
