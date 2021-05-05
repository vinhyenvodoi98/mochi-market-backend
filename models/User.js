const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
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
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
