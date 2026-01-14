const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');

// Protect all admin routes with authentication
router.use(authenticate);

// GET /api/admin/stats - Fetch platform statistics
router.get('/stats', authorize('admin'), async (req, res) => {
  try {
    console.log('Fetching platform statistics');
    const totalUsers = await User.countDocuments();
    console.log('Total users:', totalUsers);
    const totalCourses = await Course.countDocuments();
    console.log('Total courses:', totalCourses);
    const totalEnrollments = await Enrollment.countDocuments();
    console.log('Total enrollments:', totalEnrollments);
    const totalRevenue = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    console.log('Total revenue:', totalRevenue);
    const pendingCourses = await Course.countDocuments({ status: 'pending' });
    console.log('Pending courses:', pendingCourses);
    // User model uses 'approved' not 'active'
    const activeUsers = await User.countDocuments({ status: 'approved' });
    console.log('Active users:', activeUsers);
    
    // Get user counts by role
    const studentCount = await User.countDocuments({ role: 'student' });
    const instructorCount = await User.countDocuments({ role: 'instructor' });
    const adminCount = await User.countDocuments({ role: 'admin' });
    
    // Calculate percentages
    const studentPercentage = totalUsers > 0 ? Math.round((studentCount / totalUsers) * 100) : 0;
    const instructorPercentage = totalUsers > 0 ? Math.round((instructorCount / totalUsers) * 100) : 0;
    const adminPercentage = totalUsers > 0 ? Math.round((adminCount / totalUsers) * 100) : 0;
    
    const topCategories = await Course.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { category: '$_id', count: 1, _id: 0 } },
    ]);
    console.log('Top categories:', topCategories);
    
    // Check completion status - Enrollment model uses completion_status (boolean) not completionStatus
    const completedEnrollments = await Enrollment.countDocuments({ completion_status: true });
    console.log('Completed enrollments:', completedEnrollments);
    const completionRate = totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0;
    console.log('Completion rate:', completionRate);
    
    // Calculate growth (simplified - in production, compare with previous period)
    // For now, return 0 or a default value
    const userGrowth = 0;
    const courseGrowth = 0;
    const revenueGrowth = 0;
    const enrollmentGrowth = 0;
    
    // Get recent activity (recent enrollments and payments)
    const recentEnrollments = await Enrollment.find()
      .populate('user_id', 'name email')
      .populate('course_id', 'title')
      .sort({ _id: -1 })
      .limit(10)
      .lean();
    
    const recentPayments = await Payment.find()
      .populate('user_id', 'name email')
      .populate('course_id', 'title')
      .sort({ _id: -1 })
      .limit(10)
      .lean();
    
    const formatTimeAgo = (date) => {
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };
    
    const recentActivity = [
      ...recentEnrollments.map(e => {
        const date = e._id.getTimestamp ? e._id.getTimestamp() : new Date();
        return {
          type: 'enrollment',
          message: `${e.user_id?.name || 'Unknown user'} enrolled in ${e.course_id?.title || 'Unknown course'}`,
          time: formatTimeAgo(date),
          date: date.toISOString()
        };
      }),
      ...recentPayments.map(p => {
        const date = p._id.getTimestamp ? p._id.getTimestamp() : new Date();
        return {
          type: 'payment',
          message: `${p.user_id?.name || 'Unknown user'} paid $${p.amount.toFixed(2)} for ${p.course_id?.title || 'Unknown course'}`,
          time: formatTimeAgo(date),
          date: date.toISOString()
        };
      })
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
    
    console.log('Platform statistics fetched successfully');
    res.json({
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      pendingCourses,
      activeUsers,
      topCategories,
      completionRate: Math.round(completionRate),
      recentActivity,
      userGrowth,
      courseGrowth,
      revenueGrowth,
      enrollmentGrowth,
      studentCount,
      instructorCount,
      adminCount,
      studentPercentage,
      instructorPercentage,
      adminPercentage,
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// Admin routes
// GET /api/admin/users - Fetch all users
router.get('/users', authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    // Map 'approved' status to 'active' for frontend compatibility
    // Add createdDate from _id timestamp and ensure all required fields exist
    const mappedUsers = users.map(user => {
      const userObj = user.toObject();
      // Extract creation date from MongoDB _id (contains timestamp)
      const createdDate = user._id.getTimestamp ? user._id.getTimestamp().toISOString() : new Date().toISOString();
      return {
        ...userObj,
        status: userObj.status === 'approved' ? 'active' : userObj.status,
        createdDate: createdDate,
        lastModifiedDate: createdDate, // Use createdDate as fallback
        profileImage: userObj.profileImage || undefined,
        name: userObj.name || '',
        email: userObj.email || '',
        role: userObj.role || 'student'
      };
    });
    res.json(mappedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/admin/payments - Fetch all payments
router.get('/payments', authorize('admin'), async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('user_id', 'name email')
      .populate('course_id', 'title pricing')
      .sort({ _id: -1 }); // Sort by _id descending (most recent first)
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).send('Server error');
  }
});

// PUT /api/admin/users/:id/status - Update user status
router.put('/users/:id/status', authorize('admin'), async (req, res) => {
  try {
    let { status } = req.body;
    // Map 'active' to 'approved' for compatibility with frontend
    if (status === 'active') {
      status = 'approved';
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    // Map 'approved' status to 'active' for frontend compatibility
    const userObj = user.toObject();
    userObj.status = userObj.status === 'approved' ? 'active' : userObj.status;
    res.json(userObj);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// PUT /api/admin/users/:id/role - Update user role (promote/demote)
router.put('/users/:id/role', authorize('admin'), async (req, res) => {
  try {
    const { action } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    let newRole;
    if (action === 'promote') {
      // Promote: student -> instructor -> admin
      if (user.role === 'student') {
        newRole = 'instructor';
      } else if (user.role === 'instructor') {
        newRole = 'admin';
      } else {
        return res.status(400).json({ msg: 'User already has highest role' });
      }
    } else if (action === 'demote') {
      // Demote: admin -> instructor -> student
      if (user.role === 'admin') {
        newRole = 'instructor';
      } else if (user.role === 'instructor') {
        newRole = 'student';
      } else {
        return res.status(400).json({ msg: 'User already has lowest role' });
      }
    } else {
      return res.status(400).json({ msg: 'Invalid action. Use "promote" or "demote"' });
    }

    user.role = newRole;
    await user.save();
    // Map 'approved' status to 'active' for frontend compatibility
    const userObj = user.toObject();
    userObj.status = userObj.status === 'approved' ? 'active' : userObj.status;
    res.json(userObj);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE /api/admin/users/:id - Delete a user
router.delete('/users/:id', authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ msg: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/admin/courses - Fetch all courses
router.get('/courses', authorize('admin'), async (req, res) => {
  try {
    const courses = await Course.find().populate('instructor_id', 'name email');
    
    // Get enrollment counts for all courses
    const courseIds = courses.map(c => c._id);
    const enrollmentCounts = await Enrollment.aggregate([
      { $match: { course_id: { $in: courseIds } } },
      { $group: { _id: '$course_id', count: { $sum: 1 } } }
    ]);
    
    // Create a map of course_id to enrollment count
    const enrollmentMap = new Map();
    enrollmentCounts.forEach(item => {
      enrollmentMap.set(item._id.toString(), item.count);
    });
    
    // Map courses to frontend format
    const mappedCourses = courses.map(course => {
      const courseObj = course.toObject();
      const createdDate = course._id.getTimestamp ? course._id.getTimestamp().toISOString() : new Date().toISOString();
      
      return {
        ...courseObj,
        instructorId: courseObj.instructor_id, // Map instructor_id to instructorId
        enrollmentCount: enrollmentMap.get(course._id.toString()) || 0,
        duration: courseObj.duration || 0, // Default to 0 if not present
        rating: courseObj.rating || 0, // Default to 0 if not present
        createdDate: createdDate,
        lastModifiedDate: createdDate,
        modules: courseObj.modules || [],
        tags: courseObj.tags || [],
        level: courseObj.level || 'Beginner',
        published: courseObj.status === 'approved',
        coverImage: courseObj.coverImage || undefined
      };
    });
    
    res.json(mappedCourses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ msg: 'Server error' });
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