const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Makes this field mandatory
    trim: true, // Removes leading and trailing spaces
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensures email is unique
    trim: true,
    lowercase: true, // Converts email to lowercase
    match: [/.+@.+\..+/, 'Invalid email format'], // Validates email format
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Minimum password length
  },
  createdAt: {
    type: Date,
    default: Date.now, // Automatically sets the date when a user is created
  },
  // Reference to tasks/cards created by the user
  createdCards: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card', // Reference to the Card model
    },
  ],
  // Reference to tasks/cards assigned to the user
  assignedCards: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card', // Reference to the Card model
    },
  ],
});

// Create the User model
const User = mongoose.model('User', userSchema);

// Export the User model
module.exports = User;
