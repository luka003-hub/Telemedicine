const Appointment = require('./Models/Appointment');

// Controller to book an appointment
exports.bookAppointment = async (req, res) => {
    try {
        const { date, time, description } = req.body;
        const userId = req.user._id; // Assuming req.user contains the logged-in user's info

        // Create a new appointment linked to the logged-in user
        const newAppointment = new Appointment({ userId, date, time, description });
        await newAppointment.save();

        res.status(201).send({ message: 'Appointment booked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error booking appointment' });
    }
};

// Controller to get the user's appointments
exports.getUserAppointments = async (req, res) => {
    try {
        const userId = req.user._id; // Assuming req.user contains the logged-in user's info

        // Fetch all appointments associated with the user
        const appointments = await Appointment.find({ userId });

        res.status(200).send(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Error retrieving appointments' });
    }
};
