const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./Models/user'); 


// Express app
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// View engine to EJS
app.set('view engine', 'ejs');

// Views directory
app.set('views', __dirname + '/views'); 

// MongoDB connection URI 
const mongoURI = 'mongodb://localhost:27017/Beta'; 

// Connect to MongoDB 
mongoose.connect(mongoURI, {
}).then(() => {
    console.log('Connected to MongoDB successfully!');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
});

// Route to render the index page
app.get('/', (req, res) => {
    res.render('index'); // Renders the index.ejs file
});

// POST /login route to handle login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Find the user by email
        const user = await User.findOne({ email });

        // 2. If user is not found, send error
        if (!user) {
            return res.status(400).send('Invalid email or password');
        }

        // 3. Check if the entered password matches the hashed password
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(400).send('Invalid email or password');
        }

        // 4. If password matches, send success response
        res.send('Login successful');

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Start Express server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
