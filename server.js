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


// Route to render login page
app.get('/login', (req, res) => {
    res.render('login'); // Renders the login.ejs page
});

// Login POST route to handle login authentication
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send('Invalid email or password');
        }

        // Check if the entered password matches
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).send('Invalid email or password');
        }

        // Redirect to landing page on successful login
        res.redirect('/landing');
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).send('Server Error');
    }
});

// Routes
app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    // Simple validation
    if (!name || !email || !password || !confirmPassword) {
        return res.status(400).send('Please fill in all fields');
    }
    if (password !== confirmPassword) {
        return res.status(400).send('Passwords do not match');
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('User with that email already exists');
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save user to the database
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });

        await newUser.save();
        res.send('User registered successfully!');

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Route to render landing page after successful login
app.get('/landing', (req, res) => {
    res.render('landing'); // Renders the landing.ejs page
});

// Start Express server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
