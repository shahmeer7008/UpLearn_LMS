const express = require('express');
const router = express.Router();
const { authorize } = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');

// Admin routes
// GET /api/admin/users - Fetch all users
router.get('/users', authorize('admin'), (req, res) => {
  // Implementation to fetch all users
  res.send('GET /api/admin/users');
});

// PUT /api/admin/users/:id/status - Update user status
router.put('/users/:id/status', authorize('admin'), (req, res) => {
  // Implementation to update user status
  res.send(`PUT /api/admin/users/${req.params.id}/status`);
});

// GET /api/admin/courses/pending - Fetch pending courses
router.get('/courses/pending', authorize('admin'), (req, res) => {
  // Implementation to fetch pending courses
  res.send('GET /api/admin/courses/pending');
});

// PUT /api/admin/courses/:id/status - Update course status
router.put('/courses/:id/status', authorize('admin'), (req, res) => {
  // Implementation to update course status
  res.send(`PUT /api/admin/courses/${req.params.id}/status`);
});

// PUT /api/admin/users/:id/approve - Approve a user
router.put('/users/:id/approve', authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.send(user);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// PUT /api/admin/users/:id/block - Block a user
router.put('/users/:id/block', authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: true },
      { new: true }
    );
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.send(user);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// PUT /api/admin/courses/:id/approve - Approve a course
router.put('/courses/:id/approve', authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!course) {
      return res.status(404).send('Course not found');
    }
    res.send(course);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// PUT /api/admin/courses/:id/reject - Reject a course
router.put('/courses/:id/reject', authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { isApproved: false },
      { new: true }
    );
    if (!course) {
      return res.status(404).send('Course not found');
    }
    res.send(course);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

module.exports = router;