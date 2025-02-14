const express = require('express');
const connectDB = require('./db'); // Database connection file
const User = require('./models/user.js'); // User schema/model
const taskRoutes = require('./routes/taskRoutes'); // Import task routes
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/errorMiddleware");
const userRoutes = require('./routes/userRoutes');
require('dotenv').config();
const MongoStore = require("connect-mongo");


const app = express();

// Middleware
app.use(bodyParser.json()); // Parses incoming JSON requests

// Error Handling Middleware
app.use(errorHandler);

// Middleware

app.use(session({
  secret: process.env.SESSION_SECRET || "supersecretkey",
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI, // Your MongoDB connection string
      collectionName: "sessions",
  }),
  cookie: { secure: false } // Set to true in production with HTTPS
}));

app.use(express.json()); // Parses incoming JSON requests
app.use(cookieParser()); // Enable cookie parsing
app.use(express.urlencoded({ extended: true }));


// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Import and use routes
app.use('/api/users', userRoutes);
app.use("/api", userRoutes);  // This line seems redundant with the previous one
app.use('/api/tasks', taskRoutes); // Use task routes for the '/api/tasks' endpoint
app.use("/api", userRoutes);
app.use("/user", userRoutes);



// Fallback route to serve the login.html, not home.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post("/api/enable-2fa", (req, res) => {
  const { securityQuestion, securityAnswer } = req.body;
  
  if (!securityQuestion || !securityAnswer) {
      return res.status(400).json({ message: "Security question and answer are required." });
  }
  res.json({ message: "Two-Factor Authentication enabled successfully!" });
});

// Disable 2FA API Route
app.post("/api/disable-2fa", (req, res) => {
  res.json({ message: "Two-Factor Authentication disabled." });
});


// Connect to the database
connectDB();

// Routes
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

app.get("/api/user/profile", async (req, res) => {
  try {
      const user = await User.findById(req.user.id).select("is2FAEnabled");
      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }
      res.json({ is2FAEnabled: user.is2FAEnabled });
  } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Server error" });
  }
});


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));






// Home route
app.get('/', (req, res) => {
  res.send('Welcome to the User Management API');
});

app.use(errorHandler); // Correct Placement - AFTER all routes

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});