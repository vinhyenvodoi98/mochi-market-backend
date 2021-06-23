const mongoose = require('mongoose');
const { Schema } = mongoose;

const VerifyAllNetworkSchema = new Schema(
  {
    address: {
      type: String,
      trim: true,
      required: true,
      match: [/^0x[a-fA-F0-9]{40}$/, 'address is invalid'],
    },
    network: {
      type: Number,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

const VerifyAllNetwork = mongoose.model('VerifyAllNetwork', VerifyAllNetworkSchema);

module.exports = VerifyAllNetwork;
