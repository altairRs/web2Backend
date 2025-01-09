const mongoose = require('mongoose');


const MONGO_URI = 'mongodb+srv://zeniszns:Mambetism@cluster0.8wgxh.mongodb.net/';


const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit process with failure
  }
};


module.exports = connectDB;
