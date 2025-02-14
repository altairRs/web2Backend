const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const User = require('../models/user'); // Import the User model
const bcrypt = require('bcrypt');
const multer = require("multer");
const path = require("path");  // Ensure path module is also imported



const { registerUser, loginUser, getUser, resetPassword, verify2FA, getUserProfile,  updateTwoFA , disable2FA , enable2FA} = require('../controllers/userControllers.js');
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


router.post('/verify-2fa', verify2FA);


router.get('/profile', authMiddleware, getUserProfile);

router.get("/get-profile", authMiddleware, getUserProfile);


router.post('/update-2fa', authMiddleware, updateTwoFA);

router.post("/enable-2fa", authMiddleware, enable2FA); // Enable 2FA
router.post("/disable-2fa", authMiddleware, disable2FA); // Disable 2FA

// ✅ Get 2FA Status (Check if enabled)
router.get("/2fa-status", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ is2FAEnabled: user.is2FAEnabled });
    } catch (error) {
        console.error("Error fetching 2FA status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

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

// Update password
router.put('/update-password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        console.log("Password update request received:", req.user);

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide both current and new passwords' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ message: 'Server error', error });
    }
});


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // Ensure 'uploads/' folder exists
    },
    filename: function (req, file, cb) {
        cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// Profile Picture Upload Route
router.post("/update-profile-picture", upload.single("profilePicture"), async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.profilePicture = `/uploads/${req.file.filename}`;
        await user.save();

        res.json({ message: "Profile picture updated", imageUrl: user.profilePicture });
    } catch (error) {
        console.error("Error updating profile picture:", error);
        res.status(500).json({ message: "Server error" });
    }
});



// router.get("/", getUsers);
// router.get("/:id", getUserById);
// router.post("/", validateUser, createUser);
// router.put("/:id", validateUser, updateUser);
// router.delete("/:id", deleteUser);

module.exports = router;