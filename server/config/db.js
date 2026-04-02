// server/config/db.js
// Connects to MongoDB Atlas using the URI from environment variables

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options are no longer needed in Mongoose 7+ but
      // keeping them makes the code work with older versions too
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`DB connection error: ${error.message}`);
    process.exit(1); // Kill the process — no point running without a DB
  }
};

module.exports = connectDB;