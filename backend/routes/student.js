const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// @route   POST api/courses/:id/enroll
// @desc    Enroll in a course
// @access  Private
router.post('/courses/:id/enroll', authenticate, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course || course.status !== 'approved') {
            return res.status(404).json({ msg: 'Course not found or not available for enrollment' });
        }

        const enrollment = new Enrollment({
            user_id: req.user.id,
            course_id: req.params.id
        });

        await enrollment.save();
        res.json(enrollment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/student/my-courses
// @desc    Get all courses for a student
// @access  Private
router.get('/my-courses', authenticate, async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ user_id: req.user.id }).populate('course_id');
        res.json(enrollments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;