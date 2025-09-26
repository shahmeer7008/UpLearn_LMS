const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  type: { type: String, enum: ['login', 'course_view', 'payment'], required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Analytics', analyticsSchema);