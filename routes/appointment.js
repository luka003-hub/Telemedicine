const express = require('express');
const router = express.Router();

const { bookAppointment } = require('../controllers/appointmentController');
const { isAuthenticated } = require('../Middleware/auth');

console.log('bookAppointment:', bookAppointment);

router.post('/book-appointment', isAuthenticated, bookAppointment);

module.exports = router;