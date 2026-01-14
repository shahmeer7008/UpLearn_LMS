const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// @route   GET api/courses
// @desc    Get all approved courses
// @access  Public
router.get('/', async (req, res) => {
    try {
        const courses = await Course.find({ status: 'approved' });
        res.json(courses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/courses/:id
// @desc    Get course by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findOne({ _id: req.params.id, status: 'approved' });
        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }
        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
// @route   POST api/courses/:id/enroll
// @desc    Enroll in a course
// @access  Private
const { authenticate } = require('../middleware/auth');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');

router.post('/:id/enroll', authenticate, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({ user_id: req.user.id, course_id: req.params.id });
        if (existingEnrollment) {
            return res.status(400).json({ msg: 'Already enrolled in this course' });
        }

        // Handle payment if the course is not free
        if (course.pricing > 0) {
            // In a real application, you would integrate with a payment gateway like Stripe
            // For this example, we'll simulate a successful payment
            const newPayment = new Payment({
                user_id: req.user.id,
                course_id: req.params.id,
                amount: course.pricing,
                status: 'completed',
            });
            await newPayment.save();
        }

        const newEnrollment = new Enrollment({
            user_id: req.user.id,
            course_id: req.params.id,
        });

        await newEnrollment.save();
        res.status(201).json(newEnrollment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



module.exports = router;