const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  },
  addedDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Wishlist', WishlistSchema);