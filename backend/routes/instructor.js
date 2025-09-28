const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const Instructor = require('../models/Instructor');

// @route   GET /api/instructor/:id/analytics
// @desc    Get analytics for a specific instructor
// @access  Private (Instructor only)
router.get('/:id/analytics', authenticate, authorize('instructor'), async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ msg: 'User not authorized' });
    }

    const instructor = await Instructor.findOne({ user_id: req.params.id }).populate('courses');
    if (!instructor) {
      return res.status(404).json({ msg: 'Instructor not found' });
    }

    const courseIds = instructor.courses.map(course => course._id);
    const enrollments = await Enrollment.find({ course_id: { $in: courseIds } });
    const payments = await Payment.find({ course_id: { $in: courseIds } });

    const analytics = instructor.courses.map(course => {
      const courseEnrollments = enrollments.filter(e => e.course_id.toString() === course._id.toString());
      const coursePayments = payments.filter(p => p.course_id.toString() === course._id.toString());
      const completedCount = courseEnrollments.filter(e => e.completionStatus === 'completed').length;
      const completionRate = courseEnrollments.length > 0 ? (completedCount / courseEnrollments.length) * 100 : 0;
      const avgProgress = courseEnrollments.length > 0
        ? courseEnrollments.reduce((sum, e) => sum + e.progress, 0) / courseEnrollments.length
        : 0;
      const activeStudents = courseEnrollments.filter(e => e.completionStatus === 'in-progress').length;

      return {
        course,
        enrollments: courseEnrollments,
        revenue: coursePayments.reduce((sum, p) => sum + p.amount, 0),
        completionRate: Math.round(completionRate),
        avgProgress: Math.round(avgProgress),
        activeStudents,
      };
    });

    res.json(analytics);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Protect all routes for instructors
router.use(authenticate, authorize('instructor'));

// @route   POST /api/instructor/courses
// @desc    Create a new course
// @access  Private (Instructor only)
router.post('/:id/courses', async (req, res) => {
    try {
        if (req.user.id !== req.params.id) {
            return res.status(403).json({ msg: 'User not authorized' });
        }

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

        // Add course to instructor's list of courses
        await Instructor.findOneAndUpdate(
            { user_id: req.user.id },
            { $push: { courses: course._id } }
        );

        res.status(201).json(course);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/instructor/courses
// @desc    Get all courses created by the authenticated instructor
// @access  Private (Instructor only)
router.get('/:id/courses', async (req, res) => {
    try {
        if (req.user.id !== req.params.id) {
            return res.status(403).json({ msg: 'User not authorized' });
        }
        const instructor = await Instructor.findOne({ user_id: req.params.id }).populate('courses');
        if (!instructor) {
            return res.status(404).json({ msg: 'Instructor not found' });
        }
        res.json(instructor.courses);
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