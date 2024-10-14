// routes/appointment.js
const express = require('express');
const router = express.Router();

// Sample route for booking an appointment
router.get('/book-appointment', (req, res) => {
    res.render('book-appointment'); // Ensure you have this view file created
});

router.post('/book-appointment', (req, res) => {
    const { userId, doctor, date, time } = req.body;
    // Logic to save the appointment to the database can be added here
    res.send(`Appointment booked with Dr. ${doctor} on ${date} at ${time}`);
});

module.exports = router;

