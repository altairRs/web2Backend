const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const mongoose = require('mongoose');
const crypto = require("crypto");



const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();

        // Retrieve user from DB and verify the stored hash
        const storedUser = await User.findOne({ email });
        const isPasswordCorrect = await bcrypt.compare(password, storedUser.password);

        if (!isPasswordCorrect) {
            return res.status(500).json({ message: 'Error: Hashed password does not match' });
        }

        res.status(201).json({ message: 'User registered successfully', redirect: '/home.html' });

    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log("Login attempt:", { email, password });

        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found");
            return res.status(400).json({ message: "Invalid email or password" });
        }

        console.log("User found:", user);

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log("Invalid password");
            return res.status(400).json({ message: "Invalid email or password" });
        }

        if (user.is2FAEnabled) {
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            req.session.verificationCode = verificationCode;
            req.session.tempUserId = user._id; // ✅ Store user for 2FA

            console.log(`🚀 2FA Code for ${email}:`, verificationCode);
            console.log("✅ Session after setting tempUserId:", req.session); // Debug log

            return res.status(200).json({ message: "2FA required", redirect: "/verify-2fa.html" });
        }

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000,
        });

        res.status(200).json({ message: "Login successful", redirect: "/home.html" });

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Error logging in", error });
    }
};

const verify2FA = async (req, res) => {
    try {
        console.log("2FA verification started...");
        console.log("✅ Session at verify2FA:", req.session); // Debug log

        if (!req.session.tempUserId) {
            console.log("❌ No tempUserId found in session.");
            return res.status(401).json({ message: "No 2FA session found. Please log in again." });
        }

        const { code } = req.body;
        console.log("Received 2FA code:", code);
        console.log("Expected code:", req.session.verificationCode);

        if (!req.session.verificationCode) {
            return res.status(400).json({ message: "Verification code expired or missing. Please try again." });
        }

        if (code !== req.session.verificationCode) {
            return res.status(400).json({ message: "Invalid 2FA code." });
        }

        req.session.verificationCode = null;

        console.log("✅ 2FA verified. Generating JWT token...");
        const user = await User.findById(req.session.tempUserId);
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.cookie("auth_token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 3600000 });

        console.log("✅ JWT set, redirecting to home page.");
        req.session.tempUserId = null;
        res.status(200).json({ message: "2FA verification successful", redirect: "/home.html" });

    } catch (error) {
        console.error("❌ Server error verifying 2FA:", error);
        res.status(500).json({ message: "Server error" });
    }
};


const updateTwoFA = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.is2FAEnabled = req.body.is2FAEnabled;

        await user.save();
        res.json({ message: "2FA updated successfully", is2FAEnabled: user.is2FAEnabled });
    } catch (error) {
        console.error("Error updating 2FA:", error);
        res.status(500).json({ message: "Server error" });
    }
};




const resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully', redirect: '/login.html' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Error resetting password', error });
    }
};

// Get user profile with 2FA status
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("is2FAEnabled");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ is2FAEnabled: user.is2FAEnabled });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Enable 2FA
const enable2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.is2FAEnabled = true;
        await user.save();

        res.json({ message: "2FA enabled successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// Disable 2FA
const disable2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.is2FAEnabled = false;
        await user.save();

        res.json({ message: "2FA disabled successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};


module.exports = { registerUser, loginUser, resetPassword , getUserProfile , verify2FA , updateTwoFA , enable2FA , disable2FA };