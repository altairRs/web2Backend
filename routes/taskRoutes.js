const express = require('express');
const router = express.Router();
const Task = require('../models/task');
const { getAllTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController'); // Import all controller functions
//const { taskSchema } = require('../validators/taskValidator'); // You don't need validation for GET/PUT/DELETE

// Fetch all tasks
router.get('/', getAllTasks);

// Create a new task
router.post('/', createTask);

// Update a task by ID
router.put('/:id', updateTask);

// Delete a task by ID
router.delete('/:id', deleteTask);

module.exports = router;