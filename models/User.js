const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    address: {
      type: String,
      trim: true,
      required: true,
      match: [/^0x[a-fA-F0-9]{40}$/, 'address is invalid'],
    },
    count: {
      type: Number,
      default: 0,
    },
    erc721tokens: [{ type: Schema.Types.ObjectId, ref: 'ERC721Token' }],
    erc1155tokens: [{ type: Schema.Types.ObjectId, ref: 'ERC1155Token' }],
    isVerify: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', UserSchema);

module.exports = User;
