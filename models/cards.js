const mongoose = require('mongoose');

// Define the Card schema
const cardSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId, // Card ID
  title: {
    type: String,
    required: true,
    trim: true, // Removes leading and trailing spaces
  },
  status: {
    type: String,
    enum: ['Task Ready', 'In Progress', 'Done'], // Status options
    required: true,
  },
  category: {
    type: String,
    enum: ['UI Design', 'Illustration', 'Other'], // Add more categories as needed
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the User model for assignee
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now, // Automatically sets the creation date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the User model for creator
    required: true,
  },
});

// Create the Card model
const Card = mongoose.model('Card', cardSchema);

// Export the Card model
module.exports = Card;
