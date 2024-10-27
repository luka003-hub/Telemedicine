const Appointment = require('./Models/Appointment');
const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../Middleware/auth');

router.post('/book', isAuthenticated, bookAppointment);
router.get('/my-appointments', isAuthenticated, getUserAppointments);
router.get('/:appointmentId', isAuthenticated, getAppointmentById);
router.delete('/:appointmentId/cancel', isAuthenticated, cancelAppointment);

module.exports = router;
