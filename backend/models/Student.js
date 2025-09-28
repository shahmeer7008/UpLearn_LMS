const mongoose = require('mongoose');
const { Schema } = mongoose;

const studentSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  enrolledCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  // other student-specific fields
});

module.exports = mongoose.model('Student', studentSchema);