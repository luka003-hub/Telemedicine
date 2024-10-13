const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./Models/user'); 
const Appointment = require('./Models/Appointment');



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
    res.render('index'); 
});


// Route to render login page
app.get('/login', (req, res) => {
    res.render('login'); 
});

// Login route
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
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).send('Invalid email or password');
        }

        // 4. If password matches, send success response or redirect
        res.send('Login successful');

        // Optionally, you could redirect the user to a different page
        // res.redirect('/dashboard'); // example redirect to a dashboard page
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});


// Signup route

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    const { email, password, confirmPassword } = req.body;

    try {
        // Check if the passwords match
        if (password !== confirmPassword) {
            return res.status(400).send('Passwords do not match');
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('Email already exists');
        }

        // Hash the password before saving to the database
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            email,
            password: hashedPassword,
        });

        // Save the user to the database
        await newUser.save();
        
        res.status(201).send('User registered successfully');

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Route to render the booking page
app.get('/book-appointment', (req, res) => {
    res.render('book-appointment');
});

// POST route to handle appointment booking
app.post('/book-appointment', async (req, res) => {
    const { userId, doctor, date, time } = req.body;

    try {
        // Create a new appointment
        const newAppointment = new Appointment({
            user: userId, 
            doctor,
            date,
            time
        });

        // Save the appointment to the database
        await newAppointment.save();

        // Send a success response or redirect to a success page
        res.send('Appointment booked successfully!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});


app.get('/book-appointment', (req, res) => {
    const userId = req.user ? req.user._id : null; // Assuming `req.user` contains the logged-in user's data
    if (!userId) {
        return res.redirect('/login'); // Redirect to login if not authenticated
    }
    res.render('book-appointment', { userId });
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
