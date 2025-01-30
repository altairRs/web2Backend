const express = require('express');
const router = express.Router();
const Task = require('../models/task'); // Ensure Task model is imported
const { getAllTasks } = require('../controllers/taskController');
const { taskSchema } = require('../validators/taskValidator');

// Fetch all tasks
router.get('/', getAllTasks);

// Create a new task
router.post('/', async (req, res) => {
    try {
        console.log('Request body:', req.body); // Log the request body

        const { error } = taskSchema.validate(req.body);
        if (error) {
            console.error('Validation error:', error.details[0].message);
            return res.status(400).json({ message: error.details[0].message });
        }

        const { title, category, status, createdAt } = req.body;

        // Create and save the task
        const task = new Task({ title, category, status, createdAt });
        await task.save();

        res.status(201).json(task);
    } catch (error) {
        console.error('Error saving task:', error);
        res.status(500).json({ message: error.message });
    }
});


// Fetch all tasks
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find(); // Fetch all tasks
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



module.exports = router;