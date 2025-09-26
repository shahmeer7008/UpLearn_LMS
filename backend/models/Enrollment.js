const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Courses', required: true },
    progress: { type: Number, default: 0 },
    completion_status: { type: Boolean, default: false }
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);