const mongoose = require('mongoose');
const { Schema } = mongoose;

const instructorSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  bio: { type: String },
  // other instructor-specific fields
  name: { type: String },
});

module.exports = mongoose.model('Instructor', instructorSchema);