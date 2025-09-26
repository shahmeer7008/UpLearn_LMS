const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  type: { type: String, enum: ['video', 'pdf', 'quiz'], required: true },
  content_url: { type: String, required: true },
});

module.exports = mongoose.model('Module', moduleSchema);