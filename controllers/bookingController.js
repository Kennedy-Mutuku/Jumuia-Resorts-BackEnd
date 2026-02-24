const Booking = require('../models/Booking');

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Public (for now, will add auth later)
const getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Public
const createBooking = async (req, res) => {
    try {
        const newBooking = new Booking(req.body);
        const savedBooking = await newBooking.save();
        res.status(201).json(savedBooking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Public
const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findOne({ bookingId: req.params.id });
        if (booking) {
            res.json(booking);
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getBookings,
    createBooking,
    getBookingById
};
