const mongoose = require('mongoose');

// MongoDB connection URI (for local or cloud database)
const mongoURI = 'mongodb://localhost:27017/Beta'; // Local database URI

// Connect to MongoDB using Mongoose
mongoose.connect(mongoURI, {
   
}).then(() => {
    console.log('Connected to MongoDB successfully!');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
});

// Start Express server (if using Express)
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

