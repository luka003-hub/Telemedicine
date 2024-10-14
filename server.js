const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const User = require('./Models/user'); 
const isAuthenticated = require('./Models/auth');
const appointmentRoutes = require('./routes/appointment');



// Express app
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));


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
    res.render('index'); 
});


// Route to render login page
app.get('/login', (req, res) => {
    res.render('login'); 
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Step 1: Find the user by email
        const user = await User.findOne({ email });

        // Step 2: If user is not found, send error
        if (!user) {
            return res.status(400).send('Invalid email or password');
        }

        // Step 3: Check if the entered password matches the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);

        // Step 4: If the passwords do not match, send error
        if (!isMatch) {
            return res.status(400).send('Invalid email or password');
        }

        // Step 5: If password matches, send success response
        res.send('Login successful');
        
        // If successful, redirect to a dashboard or home page
        res.redirect('/dashboard');


    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});


// Signup route

app.get('/signup', (req, res) => {
    res.render('signup');
});

// Render the signup form
app.get('/signup', (req, res) => {
    res.render('signup'); // Make sure signup.ejs is present in the views folder
});

// Handle signup form submission
app.post('/signup', async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
        return res.status(400).send('Passwords do not match');
    }

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).send('Email already exists');
        }

        // Create new user instance
        user = new User({
            name,
            email,
            password
        });

        // Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Save user to the database
        await user.save();

        // Redirect to login page after successful signup
        res.redirect('/login');

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({ secret: 'yourSecretKey', resave: false, saveUninitialized: true }));

// Set up EJS for rendering
app.set('view engine', 'ejs');

// Use the appointment routes
app.use(appointmentRoutes);

// Start Express server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
