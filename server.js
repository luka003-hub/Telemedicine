const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const path = require('path');
const User = require('./Models/user'); 
const appointmentRoutes = require('./routes/appointment');
const { isAuthenticated } = require('./Middleware/auth'); 
const LocalStrategy = require('passport-local').Strategy;


// Express app
const app = express();
app.use('/appointments', appointmentRoutes);

// Set up session middleware
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

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


// login page
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    console.log('Login attempt with email:', email); // Log email attempt

    try {
        // Find user in the database
        const user = await User.findOne({ email });

        // Check if user is found
        if (!user) {
            console.log('User not found:', email);
            return res.status(401).send('Invalid email or password'); // User not found
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            req.login(user, (err) => {
                if (err) {
                    console.error('Login error:', err);
                    return res.status(500).send('Login error'); // Handle login error
                }
                console.log('User logged in successfully:', user.email); // Log successful login
                return res.redirect('/book-appointment'); // Redirect to booking after login
            });
        } else {
            console.log('Password does not match for user:', email);
            return res.status(401).send('Invalid email or password'); // Password does not match
        }
    } catch (err) {
        console.error('Database error:', err);
        return res.status(500).send('Internal Server Error'); // Handle database error
    }
});

// Signup route

app.get('/signup', (req, res) => {
     res.render('signup');
});

// Render the signup form
app.post('/signup', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('User already exists with this email address');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });

        // Save the new user
        await newUser.save();
        res.status(201).send('User registered successfully');
    } catch (err) {
        console.error('Registration error:', err);
        if (err.code === 11000) {
            return res.status(400).send('User already exists with this email address');
        }
        res.status(500).send('Internal Server Error');
    }
});



app.get('/book-appointment', isAuthenticated, (req, res) => {
    res.render('book-appointment'); // This renders your booking appointment page
});



passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            const user = await User.findOne({ email: username }); // Look for the user by email
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' }); // User not found
            }

            // Compare the provided password with the stored hash
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, { message: 'Incorrect password.' }); // Password mismatch
            }

            return done(null, user); // Authentication successful
        } catch (error) {
            return done(error); // Error occurred
        }
    }
));

// Serialize user into the session
passport.serializeUser((user, done) => {
    done(null, user.id); // Store the user's ID in the session
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id); // Find the user by ID
        done(null, user); // Pass the user object to the session
    } catch (error) {
        done(error); // Error occurred
    }
});


// Set up EJS for rendering
app.set('view engine', 'ejs');

// Start Express server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
