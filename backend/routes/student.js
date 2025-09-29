const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const Certificate = require('../models/Certificate');
const Student = require('../models/Student');
const { authenticate, authorize } = require('../middleware/auth');

// Protect all routes for students
router.use(authenticate);

// @route   GET /api/student/:id/courses
// @desc    Get all courses a student is enrolled in
// @access  Private (Student only)
router.get('/:id/courses', authorize('student'), async (req, res) => {
    try {
        if (req.user.user.id !== req.params.id) {
            return res.status(403).json({ msg: 'User not authorized' });
        }
        const student = await Student.findOne({ user_id: req.params.id }).populate('enrolledCourses');
        if (!student) {
            return res.status(404).json({ msg: 'Student not found' });
        }
        res.json(student.enrolledCourses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get user's enrollment for a course
router.get('/:id/enrollment/:courseId', authorize('student'), async (req, res) => {
  try {
    if (req.user.user.id !== req.params.id) {
        return res.status(403).json({ msg: 'User not authorized' });
    }
    const enrollment = await Enrollment.findOne({ user_id: req.params.id, course_id: req.params.courseId });
    res.json(enrollment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get user's payment for a course
router.get('/:id/payment/:courseId', authorize('student'), async (req, res) => {
  try {
    if (req.user.user.id !== req.params.id) {
        return res.status(403).json({ msg: 'User not authorized' });
    }
    const payment = await Payment.findOne({ user_id: req.params.id, course_id: req.params.courseId });
    res.json(payment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update enrollment progress
router.put('/:id/enrollment/:enrollmentId', authorize('student'), async (req, res) => {
  try {
    const enrollment = await Enrollment.findByIdAndUpdate(req.params.enrollmentId, req.body, { new: true });
    res.json(enrollment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create a certificate
router.post('/:id/certificates', authorize('student'), async (req, res) => {
  try {
    const certificate = new Certificate(req.body);
    await certificate.save();
    res.json(certificate);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/student/:id/enrollments
// @desc    Get all enrollments for a specific student
// @access  Private (Student only)
router.get('/:id/enrollments', authorize('student'), async (req, res) => {
    try {
        if (req.user.user.id !== req.params.id) {
            return res.status(403).json({ msg: 'User not authorized' });
        }
        const enrollments = await Enrollment.find({ user_id: req.params.id }).populate('course_id', ['title', 'category']);
        res.json(enrollments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/student/:id/certificates
// @desc    Get all certificates for a specific student
// @access  Private (Student only)
router.get('/:id/certificates', authorize('student'), async (req, res) => {
    try {
        if (req.user.user.id !== req.params.id) {
            return res.status(403).json({ msg: 'User not authorized' });
        }
        const certificates = await Certificate.find({ user_id: req.params.id }).populate('course_id', ['title']);
        res.json(certificates);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;