const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const User = require('../models/User');
const mongoose = require('mongoose');

// Enhanced logging middleware
router.use((req, res, next) => {
  console.log('=== INSTRUCTOR ROUTE DEBUG ===');
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  console.log('Headers:', {
    'x-auth-token': req.headers['x-auth-token'] ? 'Present' : 'Missing',
    'authorization': req.headers.authorization ? 'Present' : 'Missing',
    'content-type': req.headers['content-type']
  });
  console.log('Params:', req.params);
  console.log('Query:', req.query);
  console.log('User from middleware:', req.user ? {
    id: req.user.id,
    role: req.user.role
  } : 'No user attached');
  console.log('================================');
  next();
});

// Test route (no authentication required for basic test)
router.get('/test', (req, res) => {
  console.log('Test route hit successfully');
  res.json({ 
    msg: 'Instructor routes are working!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    availableRoutes: [
      'GET /api/instructor/test',
      'GET /api/instructor/:id/courses',
      'GET /api/instructor/:id/enrollments', 
      'GET /api/instructor/:id/payments',
      'GET /api/instructor/:id/analytics',
      'GET /api/instructor/:id/dashboard'
    ]
  });
});

// Authentication test route
router.get('/auth-test', authenticate, (req, res) => {
  res.json({
    msg: 'Authentication is working',
    user: {
      id: req.user.id,
      role: req.user.role
    },
    timestamp: new Date().toISOString()
  });
});

// Middleware to validate instructor ID and permissions
const validateInstructorAccess = (req, res, next) => {
  console.log('=== VALIDATING INSTRUCTOR ACCESS ===');
  console.log('Requested instructor ID:', req.params.id);
  console.log('Current user ID:', req.user?.id);
  console.log('Current user role:', req.user?.role);
  
  if (!req.user) {
    console.log('❌ No user found in request');
    return res.status(401).json({ msg: 'No user found in request' });
  }

  const requestedInstructorId = req.params.id;
  const currentUserId = req.user.id;
  const currentUserRole = req.user.role;

  // Validate MongoDB ObjectId format
  if (!mongoose.Types.ObjectId.isValid(requestedInstructorId)) {
    console.log('❌ Invalid instructor ID format');
    return res.status(400).json({ msg: 'Invalid instructor ID format' });
  }

  // Allow if user is accessing their own data or is admin
  if (currentUserId === requestedInstructorId || currentUserRole === 'admin') {
    console.log('✅ Access granted');
    next();
  } else {
    console.log('❌ Access denied');
    return res.status(403).json({ 
      msg: 'Access denied. You can only access your own instructor data.',
      requestedId: requestedInstructorId,
      currentUserId: currentUserId,
      userRole: currentUserRole
    });
  }
};

// @route   GET /api/instructor/:id/courses
// @desc    Get all courses for an instructor
// @access  Private (Instructor only)
router.get('/:id/courses', authenticate, authorize('instructor'), validateInstructorAccess, async (req, res) => {
  try {
    const instructorId = req.params.id;
    console.log('🔍 Getting courses for instructor:', instructorId);
    
    // Log database query
    console.log('Querying courses with instructor_id:', instructorId);
    
    const courses = await Course.find({ 
      instructor_id: instructorId 
    }).sort({ createdAt: -1 });
    
    console.log('✅ Found courses:', courses.length);
    console.log('Course details:', courses.map(c => ({ id: c._id, title: c.title, status: c.status })));
    
    res.json(courses);
  } catch (err) {
    console.error('❌ Error in /courses route:', err);
    res.status(500).json({ 
      msg: 'Server error', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// @route   GET /api/instructor/:id/enrollments
// @desc    Get all enrollments for instructor's courses
// @access  Private (Instructor only)
router.get('/:id/enrollments', authenticate, authorize('instructor'), validateInstructorAccess, async (req, res) => {
  try {
    const instructorId = req.params.id;
    console.log('🔍 Getting enrollments for instructor:', instructorId);

    // First get all courses by this instructor
    const courses = await Course.find({ instructor_id: instructorId });
    console.log('📚 Found courses for enrollments:', courses.length);
    
    if (courses.length === 0) {
      console.log('ℹ️ No courses found, returning empty enrollments array');
      return res.json([]);
    }

    const courseIds = courses.map(course => course._id);
    console.log('🆔 Course IDs for enrollment lookup:', courseIds);

    // Find enrollments for these courses
    const enrollments = await Enrollment.find({ 
      course_id: { $in: courseIds } 
    })
    .populate('user_id', 'name email')
    .populate('course_id', 'title')
    .sort({ enrollmentDate: -1 });

    console.log('✅ Found enrollments:', enrollments.length);
    res.json(enrollments);
  } catch (err) {
    console.error('❌ Error in /enrollments route:', err);
    res.status(500).json({ 
      msg: 'Server error', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// @route   GET /api/instructor/:id/payments
// @desc    Get all payments for instructor's courses
// @access  Private (Instructor only)
router.get('/:id/payments', authenticate, authorize('instructor'), validateInstructorAccess, async (req, res) => {
  try {
    const instructorId = req.params.id;
    console.log('🔍 Getting payments for instructor:', instructorId);

    // First get all courses by this instructor
    const courses = await Course.find({ instructor_id: instructorId });
    console.log('📚 Found courses for payments:', courses.length);
    
    if (courses.length === 0) {
      console.log('ℹ️ No courses found, returning empty payments array');
      return res.json([]);
    }

    const courseIds = courses.map(course => course._id);
    console.log('🆔 Course IDs for payments lookup:', courseIds);

    // Find payments for these courses
    const payments = await Payment.find({ 
      course_id: { $in: courseIds } 
    })
    .populate('user_id', 'name email')
    .populate('course_id', 'title price')
    .sort({ paymentDate: -1 });

    console.log('✅ Found payments:', payments.length);
    res.json(payments);
  } catch (err) {
    console.error('❌ Error in /payments route:', err);
    res.status(500).json({ 
      msg: 'Server error', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Error handling middleware for this router
router.use((err, req, res, next) => {
  console.error('❌ Instructor Router Error:', err);
  res.status(500).json({
    msg: 'Internal server error in instructor routes',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

module.exports = router;