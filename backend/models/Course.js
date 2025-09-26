const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    instructor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pricing: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
});

module.exports = mongoose.model('Course', courseSchema);