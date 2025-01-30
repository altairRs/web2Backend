// controllers/taskController.js
const Task = require('../models/task');

const getAllTasks = async (req, res) => {
  console.log('Fetching tasks...');
  try {
    const tasks = await Task.find();
    console.log('Tasks found:', tasks); // Add this line
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error); // Log the error
    res.status(500).json({ message: 'Error fetching tasks', error });
  }
  
};

const createTask = async (req, res) => {
  const { title, status, category, dueDate, assignedTo } = req.body;

  try {
    const newTask = new Task({
      title,
      status,
      category,
      dueDate,
      assignedTo,
      createdBy: req.user.id, // Assuming `req.user` contains the logged-in user
    });

    await newTask.save();
    res.status(201).json({ message: 'Task created successfully', task: newTask });
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error });
  }
};

const updateTask = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid task ID format" });
  }

  try {
      const updatedTask = await Task.findByIdAndUpdate(id, updates, { new: true });

      if (!updatedTask) {
          return res.status(404).json({ message: "Task not found" });
      }

      res.status(200).json(updatedTask);
  } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Error updating task", error });
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
    res.status(500).json({ message: 'Error deleting task', error });
  }
};

const saveAllTasks = async (req, res) => {
  const { tasks } = req.body;
  const userId = req.user.id; // Ensure user authentication

  try {
      const updatePromises = tasks.map(task =>
          Task.findByIdAndUpdate(task.id, { status: task.status, savedBy: userId }, { new: true })
      );

      const updatedTasks = await Promise.all(updatePromises);
      res.status(200).json({ message: 'Tasks updated successfully', updatedTasks });
  } catch (error) {
      console.error('Error saving tasks:', error);
      res.status(500).json({ message: 'Error saving tasks', error });
  }
};

exports.updateTask = (req, res) => {
  // Update task logic here
  res.send('Task updated');
};



module.exports = { getAllTasks, createTask, updateTask, deleteTask, saveAllTasks };

