const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth'); // Adjust path if necessary
const bodyParser = require('body-parser');
// Initialize dotenv to access environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(bodyParser.json()); 
// Middleware setup
app.use(express.json());  // To parse JSON data from incoming requests
app.use(cors());  // To allow cross-origin requests (for frontend app)

app.use('/auth', authRoutes); // Use authentication routes for login/signup

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// Server setup
const PORT = process.env.PORT || 5000; // Use port from .env or default to 5000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
