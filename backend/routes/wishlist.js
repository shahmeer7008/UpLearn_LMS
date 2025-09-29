const express = require('express');
const router = express.Router();
const { authenticate, getUserId } = require('../middleware/auth');

// Wishlist model - adjust according to your schema
const Wishlist = require('../models/Wishlist');
const Course = require('../models/Course');

// @route   GET /api/wishlist/:userId
// @desc    Get user's wishlist
// @access  Private
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const requestedUserId = req.params.userId;
    const currentUserId = getUserId(req);
    
    console.log('Get wishlist - Requested userId:', requestedUserId);
    console.log('Get wishlist - Current userId:', currentUserId);
    
    // Ensure user can only access their own wishlist
    if (requestedUserId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own wishlist.',
      });
    }

    const wishlistItems = await Wishlist.find({ user_id: currentUserId })
      .sort({ addedDate: -1 }); // Most recent first

    console.log(`Found ${wishlistItems.length} wishlist items for user ${currentUserId}`);

    res.json(wishlistItems);
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching wishlist',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/wishlist
// @desc    Add course to wishlist
// @access  Private
router.post('/', authenticate, async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    const currentUserId = getUserId(req);
    
    console.log('Add to wishlist - Body userId:', userId);
    console.log('Add to wishlist - Current userId:', currentUserId);
    console.log('Add to wishlist - Course ID:', courseId);
    
    // Ensure user can only add to their own wishlist
    if (userId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only modify your own wishlist.',
      });
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: 'Course ID is required',
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if already in wishlist
    const existingItem = await Wishlist.findOne({
      user_id: currentUserId,
      course_id: courseId
    });

    if (existingItem) {
      return res.status(409).json({
        success: false,
        message: 'Course already in wishlist',
      });
    }

    // Add to wishlist
    const wishlistItem = new Wishlist({
      user_id: currentUserId,
      course_id: courseId,
      addedDate: new Date()
    });

    await wishlistItem.save();
    
    console.log('Course added to wishlist successfully');

    res.status(201).json({
      success: true,
      message: 'Course added to wishlist',
      data: wishlistItem
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding to wishlist',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/wishlist/:userId/:courseId
// @desc    Remove course from wishlist
// @access  Private
router.delete('/:userId/:courseId', authenticate, async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    const currentUserId = getUserId(req);
    
    console.log('Remove from wishlist - Params userId:', userId);
    console.log('Remove from wishlist - Current userId:', currentUserId);
    console.log('Remove from wishlist - Course ID:', courseId);
    
    // Ensure user can only remove from their own wishlist
    if (userId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only modify your own wishlist.',
      });
    }

    const deletedItem = await Wishlist.findOneAndDelete({
      user_id: currentUserId,
      course_id: courseId
    });

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: 'Course not found in wishlist',
      });
    }
    
    console.log('Course removed from wishlist successfully');

    res.json({
      success: true,
      message: 'Course removed from wishlist',
      data: deletedItem
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing from wishlist',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/wishlist/:userId/count
// @desc    Get wishlist count for user
// @access  Private
router.get('/:userId/count', authenticate, async (req, res) => {
  try {
    const requestedUserId = req.params.userId;
    const currentUserId = getUserId(req);
    
    // Ensure user can only access their own wishlist count
    if (requestedUserId !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own wishlist.',
      });
    }

    const count = await Wishlist.countDocuments({ user_id: currentUserId });

    res.json({
      success: true,
      count: count
    });
  } catch (error) {
    console.error('Get wishlist count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching wishlist count',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;