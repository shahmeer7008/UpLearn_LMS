const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/profile
// @desc    Get current user's profile
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Error in profile route:', err.message);
    res.status(500).json({ 
      msg: 'Server error', 
      error: err.message 
    });
  }
});

// @route   PUT /api/profile
// @desc    Update user profile
// @access  Private
router.put('/', authenticate, async (req, res) => {
  try {
    const { name, email, bio } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (bio) user.bio = bio;

    await user.save();

    // Return user without password
    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
    
  } catch (err) {
    console.error('Error updating profile:', err.message);
    res.status(500).json({ 
      msg: 'Server error', 
      error: err.message 
    });
  }
});

module.exports = router;