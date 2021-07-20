const mongoose = require('mongoose');
const { Schema } = mongoose;

const SellOrderSchema = new Schema(
  {
    sellId: {
      type: String,
      required: true,
    },
    nftAddress: { type: Schema.Types.ObjectId, ref: 'NFT' },
    address: { type: String },
    onModel: {
      type: String,
      required: true,
      enum: ['ERC721Token', 'ERC1155Token'],
    },
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
    status: {
      type: String,
      enum: ['Create', 'Complete', 'Cancel'],
      default: 'Create',
    },
  },
  {
    timestamps: true,
  }
);

const SellOrder = mongoose.model('SellOrder', SellOrderSchema);

module.exports = SellOrder;
