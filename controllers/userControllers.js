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

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('Login successful, token :', token);

        res.status(201).json({ message: 'Login successful', token , redirect: '/home.html'});
        } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Error logging in', error });
        }
};


module.exports = { registerUser, loginUser };