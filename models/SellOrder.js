const mongoose = require('mongoose');
const { Schema } = mongoose;

const SellOrderSchema = new Schema(
  {
    sellId: {
      type: String,
      required: true,
    },
    nftAddress: { type: Schema.Types.ObjectId, ref: 'NFT' },
    tokenId: {
      type: Number,
      required: true,
    },
    amount: {
      type: String,
      default: '1',
    },
    soldAmount: {
      type: String,
      default: '0',
    },
    seller: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: true,
    },
    sellTime: {
      type: String,
    },
    buyers: [],
    buyTimes: [],
  },
  {
    timestamps: true,
  }
);

const SellOrder = mongoose.model('SellOrder', SellOrderSchema);

module.exports = SellOrder;
