const express = require("express");



const { registerUser, loginUser, getUser } = require('../controllers/userControllers.js');

const router = express.Router();



router.post('/register', registerUser);

// Route to login a user
router.post('/login', loginUser);





// router.get("/", getUsers);
// router.get("/:id", getUserById);
// router.post("/", validateUser, createUser);
// router.put("/:id", validateUser, updateUser);
// router.delete("/:id", deleteUser);

module.exports = router;