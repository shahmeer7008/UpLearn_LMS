const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const Certificate = require('../models/Certificate');
const auth = require('../middleware/auth');

// Get user's enrollment for a course
router.get('/enrollment/:userId/:courseId', auth.authenticate, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ user_id: req.params.userId, course_id: req.params.courseId });
    res.json(enrollment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get user's payment for a course
router.get('/payment/:userId/:courseId', auth.authenticate, async (req, res) => {
  try {
    const payment = await Payment.findOne({ user_id: req.params.userId, course_id: req.params.courseId });
    res.json(payment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update enrollment progress
router.put('/enrollment/:enrollmentId', auth.authenticate, async (req, res) => {
  try {
    const enrollment = await Enrollment.findByIdAndUpdate(req.params.enrollmentId, req.body, { new: true });
    res.json(enrollment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create a certificate
router.post('/certificates', auth.authenticate, async (req, res) => {
  try {
    const certificate = new Certificate(req.body);
    await certificate.save();
    res.json(certificate);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;