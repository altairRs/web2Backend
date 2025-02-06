const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const User = require('../models/user'); // Import the User model


const { registerUser, loginUser, getUser, resetPassword, verify2FA, getUserProfile,  updateTwoFA} = require('../controllers/userControllers.js');
const { default: mongoose } = require("mongoose");

const router = express.Router();



router.post('/register', registerUser);

// Route to login a user
router.post('/login', loginUser);

router.post('/reset-password', resetPassword);

router.get("/auth/check", authMiddleware, (req, res) => {
    res.json({ authenticated: true, user: req.user });
});

router.post("/auth/logout", (req, res) => {
    res.clearCookie("auth_token");
    res.json({ message: "Logged out successfully", redirect: "/login.html" });
});


router.post("/verify-2fa", verify2FA)

router.get('/profile', authMiddleware, getUserProfile);

router.post('/update-2fa', authMiddleware, updateTwoFA);

router.get('/user', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); // Exclude password field
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;



// router.get("/", getUsers);
// router.get("/:id", getUserById);
// router.post("/", validateUser, createUser);
// router.put("/:id", validateUser, updateUser);
// router.delete("/:id", deleteUser);

module.exports = router;