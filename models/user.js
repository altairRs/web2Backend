const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");


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

  // 2FA Fields
  is2FAEnabled: {
    type: Boolean,
    default: false, // Default: 2FA is disabled unless the user enables it
  },
  
  createdAt: {
    type: Date,
    default: Date.now, // Automatically sets the date when a user is created
  },

  profilePicture: { 
    type: String, 
    default: "/uploads/default-profile.png" 
  }
});


// Create the User model
const User = mongoose.model('User', userSchema);

// Export the User model
module.exports = User;
