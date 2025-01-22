const express = require('express');
const mongoose = require('mongoose');
const Card = require('../models/cards.js');
const router = express.Router();

// Get all tasks
router.get('/', async (req, res) => {
    try {
        const tasks = await Card.find();
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ error: `Failed to fetch tasks: ${err.message}` });
    }
});

// Add a new task
router.post('/', async (req, res) => {
    try {
        const { title, category, status, createdBy, assignedTo } = req.body;

        if (!title || !category || !status || !createdBy) {
            return res.status(400).json({ error: 'Title, category, status, and createdBy are required.' });
        }

        const newTask = new Card({
            _id: new mongoose.Types.ObjectId(),
            title,
            category,
            status,
            createdBy,
            assignedTo: assignedTo || null,
            dueDate: new Date()
        });

        await newTask.save();
        res.status(201).json(newTask);
    } catch (err) {
        res.status(500).json({ error: `Failed to create task: ${err.message}` });
    }
});

// Update task status
router.patch('/:id', async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ error: 'Status is required to update the task.' });
        }

        const updatedTask = await Card.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ error: 'Task not found.' });
        }

        res.status(200).json(updatedTask);
    } catch (err) {
        res.status(500).json({ error: `Failed to update task: ${err.message}` });
    }
});

module.exports = router;