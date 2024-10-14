const express = require('express');
const router = express.Router();
const Appointment = require('../Models/Appointment');
const { isAuthenticated } = require('../Middleware/auth');

// Route to render the booking form
router.get('/book', isAuthenticated, (req, res) => {
    res.render('book-appointment', { user: req.user });
});

// Route to handle form submission
router.post('/book', isAuthenticated, async (req, res) => {
    const { doctorName, appointmentDate, reason } = req.body;
    
    try {
        const newAppointment = new Appointment({
            userId: req.user._id,
            doctorName,
            appointmentDate,
            reason
        });
        
        await newAppointment.save();
        res.redirect('/my-appointments'); // Redirect user to their appointments
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error: Unable to book appointment.");
    }
});

module.exports = router;