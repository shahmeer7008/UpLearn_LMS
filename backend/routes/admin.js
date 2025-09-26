const express = require('express');
const router = express.Router();
const { authorize } = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');

// GET /api/admin/stats - Fetch platform statistics
router.get('/stats', authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    const totalRevenue = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const pendingCourses = await Course.countDocuments({ status: 'pending' });
    const activeUsers = await User.countDocuments({ status: 'active' });

    const topCategories = await Course.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { category: '$_id', count: 1, _id: 0 } },
    ]);

    const completedEnrollments = await Enrollment.countDocuments({ completionStatus: 'completed' });
    const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;

    res.json({
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue.total : 0,
      pendingCourses,
      activeUsers,
      topCategories,
      completionRate: Math.round(completionRate),
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).send('Server error');
  }
});

// Admin routes
// GET /api/admin/users - Fetch all users
router.get('/users', authorize('admin'), async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// PUT /api/admin/users/:id/status - Update user status
router.put('/users/:id/status', authorize('admin'), (req, res) => {
  // Implementation to update user status
  res.send(`PUT /api/admin/users/${req.params.id}/status`);
});

// GET /api/admin/courses/pending - Fetch pending courses
router.get('/courses', authorize('admin'), async (req, res) => {
  try {
    const courses = await Course.find().populate('instructor_id', 'name');
    res.json(courses);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// PUT /api/admin/courses/:id/status - Update course status
router.put('/courses/:id/status', authorize('admin'), async (req, res) => {
  try {
    const { status, note } = req.body;
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { status, reviewNote: note, lastModifiedDate: new Date() },
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

// DELETE /api/admin/courses/:id - Delete a course
router.delete('/courses/:id', authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).send('Course not found');
    }
    await course.remove();
    res.send({ msg: 'Course removed' });
  } catch (error) {
    res.status(500).send('Server error');
  }
});

module.exports = router;