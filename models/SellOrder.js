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
      required: true,
    },
    soldAmount: {
      type: String,
      required: true,
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
      required: true,
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
