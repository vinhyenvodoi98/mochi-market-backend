const mongoose = require('mongoose');
const { Schema } = mongoose;

const TagSchema = new Schema({
  tag: {
    type: String,
    trim: true,
    required: true,
    match: [/^0x[a-fA-F0-9]{40}$/, 'address is invalid'],
  },
});

const Tag = mongoose.model('Tag', TagSchema);

module.exports = Tag;
