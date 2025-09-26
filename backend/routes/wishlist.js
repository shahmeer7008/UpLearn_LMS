const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const { authenticate } = require('../middleware/auth');

// Get user's wishlist
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ user_id: req.params.userId });
    res.json(wishlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add to wishlist
router.post('/', authenticate, async (req, res) => {
  const { userId, courseId } = req.body;
  try {
    const newWishlistItem = new Wishlist({
      user_id: userId,
      course_id: courseId,
    });
    const wishlistItem = await newWishlistItem.save();
    res.json(wishlistItem);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Remove from wishlist
router.delete('/:userId/:courseId', authenticate, async (req, res) => {
  try {
    await Wishlist.findOneAndDelete({ user_id: req.params.userId, course_id: req.params.courseId });
    res.json({ msg: 'Course removed from wishlist' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;