const express = require('express');
const router = express.Router();
const Appointment = require('./Models/appointment');
const { isAuthenticated } = require('./Middleware/auth');
const { bookAppointment, getUserAppointments } = require('./controllers/appointmentController');


// Route to handle booking an appointment (POST request)
router.post('/book-appointment', bookAppointment);

// Route to get appointments for a specific user (GET request)
router.get('/my-appointments', getUserAppointments);

module.exports = router;
