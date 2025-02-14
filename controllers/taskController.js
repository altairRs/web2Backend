// controllers/taskController.js
const Task = require('../models/task');

const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error); // Log the full error
    res.status(500).json({ message: 'Error fetching tasks', error: error.message }); // Send error message
  }
};

const createTask = async (req, res) => {
    const { title, status, category, dueDate, assignedTo } = req.body;

    try {
        const newTask = new Task({
            title,
            status,
            category,
            dueDate, // Now handled correctly
            assignedTo, // Now handled correctly
            createdBy: req.user ? req.user.id : null, // Graceful handling if req.user is not available
        });

        await newTask.save();
        res.status(201).json({ message: 'Task created successfully', task: newTask });
    } catch (error) {
        console.error("Error creating task:", error); //  Log the ENTIRE error object

        // Check for validation errors
        if (error.name === 'ValidationError') {
          const messages = Object.values(error.errors).map(val => val.message);
          return res.status(400).json({ message: 'Validation Error', errors: messages });
        }
        res.status(500).json({ message: 'Error creating task', error: error.message }); // Send error message
    }
};


const updateTask = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid task ID format" });
  }

  try {
      const updatedTask = await Task.findByIdAndUpdate(id, updates, { new: true, runValidators: true }); // Add runValidators

      if (!updatedTask) {
          return res.status(404).json({ message: "Task not found" });
      }

      res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: 'Validation Error', errors: messages });
    }
    res.status(500).json({ message: "Error updating task", error: error.message }); // Send error.message
  }
};



const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error("Error deleting task:", error); // Log the full error
    res.status(500).json({ message: 'Error deleting task', error: error.message }); // Send error message
  }
};

module.exports = { getAllTasks, createTask, updateTask, deleteTask };