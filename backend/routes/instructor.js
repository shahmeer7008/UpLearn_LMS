const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// Protect all routes for instructors
router.use(authenticate, authorize('instructor'));

// @route   POST /api/instructor/courses
// @desc    Create a new course
// @access  Private (Instructor only)
router.post('/courses', async (req, res) => {
    try {
        const { title, description, category, price } = req.body;
        const instructor_id = req.user.id;

        const newCourse = new Course({
            title,
            description,
            category,
            price,
            instructor_id,
        });

        const course = await newCourse.save();
        res.status(201).json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/instructor/courses
// @desc    Get all courses created by the authenticated instructor
// @access  Private (Instructor only)
router.get('/courses', async (req, res) => {
    try {
        const courses = await Course.find({ instructor_id: req.user.id });
        res.json(courses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PUT /api/instructor/courses/:id
// @desc    Update a course
// @access  Private (Instructor only)
router.put('/courses/:id', async (req, res) => {
    try {
        const { title, description, category, price } = req.body;
        let course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }

        // Ensure the instructor owns the course
        if (course.instructor_id.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        course = await Course.findByIdAndUpdate(
            req.params.id,
            { $set: { title, description, category, price } },
            { new: true }
        );

        res.json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE /api/instructor/courses/:id
// @desc    Delete a course
// @access  Private (Instructor only)
router.delete('/courses/:id', async (req, res) => {
    try {
        let course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }

        // Ensure the instructor owns the course
        if (course.instructor_id.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await Course.findByIdAndRemove(req.params.id);

        res.json({ msg: 'Course removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/instructor/courses/:id/students
// @desc    Get a list of students enrolled in a specific course
// @access  Private (Instructor only)
router.get('/courses/:id/students', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ msg: 'Course not found' });
        }

        // Ensure the instructor owns the course
        if (course.instructor_id.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        const enrollments = await Enrollment.find({ course_id: req.params.id }).populate('student_id', ['name', 'email']);
        res.json(enrollments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;