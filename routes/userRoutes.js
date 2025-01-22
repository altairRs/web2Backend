const express = require("express");



const { registerUser, loginUser, getUser ,createTask, getTasks, updateTask, deleteTask , getUserProfile} = require('../controllers/userControllers.js');

const router = express.Router();



router.post('/register', registerUser);

// Route to login a user
router.post('/login', loginUser);


router.post('/tasks', loginUser, createTask);
router.get('/tasks', loginUser, getTasks); 
router.put('/tasks/:taskId', loginUser, updateTask); 
router.delete('/tasks/:taskId', loginUser, deleteTask); 

// Add this route to userRoutes.js
router.get('/profile', getUserProfile); 

const authenticate = require('../middleware/auth');

router.get('/profile', authenticate, getUserProfile);




// router.get("/", getUsers);
// router.get("/:id", getUserById);
// router.post("/", validateUser, createUser);
// router.put("/:id", validateUser, updateUser);
// router.delete("/:id", deleteUser);

module.exports = router;