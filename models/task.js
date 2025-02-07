const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now // Automatically set createdAt to the current date
    }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;