const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const path = require('path');
const User = require('./Models/user'); 
const appointmentRoutes = require('./routes/appointment');
const router = express.Router();
const { isAuthenticated } = require('./Middleware/auth'); 
const LocalStrategy = require('passport-local').Strategy;

const app = express();
app.use('/Appointments', appointmentRoutes);

// Session middleware
app.use(session({
    secret: '1c097f72cb818d3284e3e322f755ba35d1bc136d140dbdbf0c470462108523b17ccc84f62c6991f7b450e160c8c4b1c5c2e5433352f48883ad00cedce2e884eb',
    resave: false,
    saveUninitialized: true
}));

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Passport Initialization
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(new LocalStrategy(
    { usernameField: 'email' }, // Specify that 'email' should be used as the username
    async (email, password, done) => {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return done(null, false, { message: 'Incorrect email.' });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

// MongoDB connection
const mongoURI = 'mongodb://localhost:27017/Beta'; 
mongoose.connect(mongoURI)
    .then(() => console.log('Connected to MongoDB successfully!'))
    .catch(err => console.error('Error connecting to MongoDB:', err.message));

// Routes
app.get('/', (req, res) => {
    res.render('index'); 
});

app.get('/login', (req, res) => {
    res.render('login'); 
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: 'signup',
}));

app.get('/signup', (req, res) => {
     res.render('signup');
});

app.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('User already exists with this email address');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();
        res.status(201).send('User registered successfully');
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Route to render booking appointment page
app.get('/book-appointment', isAuthenticated, (req, res) => {
    // Pass the logged-in user's ID to the EJS template
    res.render('book-appointment', { userId: req.user._id });
});

router.post('/book', async (req, res) => {
    const { userId, doctor } = req.body;

    try {
        const newAppointment = new Appointment({
            userId,
            doctor,
            date: new Date(),
        });

        await newAppointment.save();
        res.status(201).send('Appointment booked successfully!');
    } catch (err) {
        console.error('Error booking appointment:', err);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/my-appointments', isAuthenticated, async (req, res) => {
    try {
        const appointments = await Appointment.find({ userId: req.user._id }).populate('doctor');
        res.render('my-appointments', { appointments });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
