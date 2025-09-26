const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  certificate_url: { type: String, required: true },
});

module.exports = mongoose.model('Certificate', certificateSchema);