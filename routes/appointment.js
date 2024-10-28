const express = require('express');
const router = express.Router();

const { bookAppointment } = require('./controllers/appointmentController');
const { ensureAuthenticated } = require('./middleware/auth');

router.post('/book-appointment', ensureAuthenticated, bookAppointment);

module.exports = router;