// models/task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Task title is required"], // More specific error message
        trim: true, // Remove whitespace from beginning and end
        maxlength: [100, "Task title cannot exceed 100 characters"] // Add length limits
    },
    category: {
        type: String,
        required: [true, "Category is required"],
        enum: {
            values: ['Copywriting', 'Illustration', 'UI Design'], // Limit to allowed categories
            message: '{VALUE} is not a supported category' // Custom enum error message
        }
    },
    status: {
        type: String,
        required: [true, "Status is required"],
        enum: {
            values: ['pending', 'in-progress', 'completed'],
            message: '{VALUE} is not a supported status'
        },
        default: 'pending'
    },
    dueDate: { // Add dueDate
        type: Date,
        required: false // Make it optional for now; you can make it required later
    },
    assignedTo: { // Add assignedTo
        type: String,
        required: false, // Make it optional for now
        trim: true
    },
    createdBy: {  // Add createdBy with reference to User
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // IMPORTANT: This assumes you have a User model.
      required: false // Set to false for easier testing without full auth
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;