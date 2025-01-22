const express = require('express');
const connectDB = require('./db'); // Database connection file
const User = require('./models/user.js'); // User schema/model
const Card = require('./models/cards.js'); // Card schema/model
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Import and use routes
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const cardRoutes = require('./routes/cardRoutes');
app.use('/tasks', cardRoutes);

// Fallback route to serve the home page
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Connect to the database
connectDB();

// Routes

// Home route
app.get('/', (req, res) => {
    res.send('Welcome to the User Management API');
});

// Create a new user
app.post('/api/users', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create and save the user
        const user = new User({ name, email, password });
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single user by ID
app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a user by ID
app.put('/api/users/:id', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, password },
            { new: true, runValidators: true }
        );
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a user by ID
app.delete('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new card
app.post('/cards', async (req, res) => {
    try {
        const { title, status, category, dueDate, assignedTo, createdBy } = req.body;

        // Validate creator and assignee existence
        const creator = await User.findById(createdBy);
        const assignee = await User.findById(assignedTo);
        if (!creator || !assignee) {
            return res.status(404).json({ error: 'Creator or Assignee not found' });
        }

        // Create a new card
        const newCard = new Card({
            _id: new mongoose.Types.ObjectId(),
            title,
            status,
            category,
            dueDate,
            assignedTo: mongoose.Types.ObjectId(assignedTo),
            createdBy: mongoose.Types.ObjectId(createdBy),
        });

        await newCard.save();
        res.status(201).json(newCard);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all cards assigned to or created by a user
app.get('/users/:userId/cards', async (req, res) => {
    try {
        const { userId } = req.params;

        const cards = await Card.find({
            $or: [
                { assignedTo: mongoose.Types.ObjectId(userId) },
                { createdBy: mongoose.Types.ObjectId(userId) },
            ],
        })
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email');

        res.status(200).json(cards);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single card by ID
app.get('/api/cards/:id', async (req, res) => {
    try {
        const card = await Card.findById(req.params.id);
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }
        res.json(card);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a card by ID
app.put('/api/cards/:id', async (req, res) => {
    try {
        const card = await Card.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }
        res.json(card);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a card by ID
app.delete('/api/cards/:id', async (req, res) => {
    try {
        const card = await Card.findByIdAndDelete(req.params.id);
        if (!card) {
            return res.status(404).json({ message: 'Card not found' });
        }
        res.json({ message: 'Card deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
