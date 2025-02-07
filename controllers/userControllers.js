const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const mongoose = require('mongoose');

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

        // Redirect to home.html after successful registration
        res.status(201).json({ message: 'User registered successfully', redirect: '/home.html' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log('Login attempt:', { email, password });

        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        console.log('User found:', user);

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log('Invalid password');
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // If the user has 2FA enabled, redirect to the 2FA verification page
        if (user.is2FAEnabled) {
            // Store user ID in session (or use a temporary token)
            req.session.tempUserId = user._id; 

            return res.status(200).json({ message: '2FA required', redirect: '/verify-2fa.html' });
        }

        // If no 2FA, log in directly
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('Login successful, token:', token);

        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000 // 1h expire
        });

        res.status(200).json({ message: 'Login successful', redirect: '/home.html' });

    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Error logging in', error });
    }
};

const verify2FA = async (req, res) => {
    try {
        const { securityQuestion, securityAnswer } = req.body;

        if (!securityQuestion || !securityAnswer) {
            return res.status(400).json({ message: "Security question and answer are required." });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Save 2FA settings
        user.is2FAEnabled = true;
        user.securityQuestion = securityQuestion;
        user.securityAnswer = securityAnswer;
        await user.save();

        res.json({ message: "2FA enabled successfully!" });
    } catch (error) {
        console.error("Error enabling 2FA:", error);
        res.status(500).json({ message: "Server error" });
    }
};
const updateTwoFA = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.is2FAEnabled = req.body.is2FAEnabled;

        if (!user.is2FAEnabled) {
            user.securityAnswer = undefined; // Clear security answer if disabling 2FA
        }

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

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password -securityAnswer"); // Don't send password or security answer
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { registerUser, loginUser, resetPassword , getUserProfile , verify2FA , updateTwoFA};