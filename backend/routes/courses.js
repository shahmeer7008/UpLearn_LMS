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

module.exports = router;