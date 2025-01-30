const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");



const { registerUser, loginUser, getUser, resetPassword } = require('../controllers/userControllers.js');

const router = express.Router();



router.post('/register', registerUser);

// Route to login a user
router.post('/login', loginUser);

router.post('/reset-password', resetPassword);

router.get("/auth/check", authMiddleware, (req, res) => {
    res.json({ authenticated: true, user: req.user });
});

router.post("/auth/logout", (req, res) => {
    res.clearCookie("auth_token");
    res.json({ message: "Logged out successfully", redirect: "/login.html" });
});





// router.get("/", getUsers);
// router.get("/:id", getUserById);
// router.post("/", validateUser, createUser);
// router.put("/:id", validateUser, updateUser);
// router.delete("/:id", deleteUser);

module.exports = router;