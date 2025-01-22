const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Card = require('../models/cards');
const mongoose = require('mongoose');

// Register User
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

        res.status(201).json({ message: 'User registered successfully', redirect: '/home.html' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
};

// Login User
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ message: 'Login successful', token, redirect: '/home.html' });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};

// Create a Task
const createTask = async (req, res) => {
    const { title, category, status } = req.body;

    if (!title || !category) {
        return res.status(400).json({ message: 'Title and category are required to create a task' });
    }

    try {
        const newTask = new Card({
            title,
            category,
            status: status || 'Task Ready', // Default status
            assignedTo: null, // Optional: Can be assigned later
            createdBy: req.user.id // Assuming user info is attached via authentication middleware
        });

        await newTask.save();
        res.status(201).json({ message: 'Task created successfully', task: newTask });
    } catch (error) {
        res.status(500).json({ message: 'Error creating task', error });
    }
};

// Get Tasks for a User
const getTasks = async (req, res) => {
    try {
        const tasks = await Card.find({ createdBy: req.user.id }); // Fetch user-specific tasks
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tasks', error });
    }
};

// Update a Task
const updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, category, status } = req.body;

    if (!title && !category && !status) {
        return res.status(400).json({ message: 'No fields to update' });
    }

    try {
        const updatedTask = await Card.findByIdAndUpdate(
            id,
            { title, category, status },
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json({ message: 'Task updated successfully', task: updatedTask });
    } catch (error) {
        res.status(500).json({ message: 'Error updating task', error });
    }
};

// Delete a Task
const deleteTask = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedTask = await Card.findByIdAndDelete(id);

        if (!deletedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting task', error });
    }
};

// Add this function to userControllers.js
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Example structure for returning projects and skills
        const profileData = {
            name: user.name,
            email: user.email,
            about: user.about, // Add this field in the user schema
            skills: user.skills, // Array of skills in the user schema
            projects: user.projects // Array of projects in the user schema
        };
        
        res.status(200).json(profileData);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user profile', error });
    }
};


module.exports = { registerUser, loginUser, createTask, getTasks, updateTask, deleteTask , getUserProfile};

