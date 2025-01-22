const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('../middleware/auth'); // Assuming you have a middleware for verifying JWT token

// Get the profile of the logged-in user
router.get('/profile', verifyToken, async (req, res) => {
  try {
    // Get the logged-in user's ID from the JWT token
    const userId = req.user.id;

    // Fetch user details from the database
    const user = await User.findById(userId).populate('createdCards assignedCards'); // Populate tasks/cards associated with the user

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send user data asconst express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// Get the profile of the logged-in user
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate('createdCards assignedCards');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            name: user.name,
            email: user.email,
            createdCards: user.createdCards,
            assignedCards: user.assignedCards
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user profile', error: error.message });
    }
});

module.exports = router;
 response
    res.status(200).json({
      name: user.name,
      email: user.email,
      createdCards: user.createdCards,
      assignedCards: user.assignedCards,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching user profile', error });
  }
});

module.exports = router;
