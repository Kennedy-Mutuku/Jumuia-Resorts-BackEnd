const Booking = require('../models/Booking');

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Public (for now, will add auth later)
const getBookings = async (req, res) => {
    try {
        let filter = {};

        // If user is a manager, they only see their assigned properties
        if (req.user.role === 'manager') {
            filter.resort = { $in: req.user.properties };
        }
        // General Manager sees all bookings (no filter)

        const bookings = await Booking.find(filter).sort({ createdAt: -1 });
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

// @desc    Update a booking
// @route   PUT /api/bookings/:id
// @access  Private (Admin/Manager)
const updateBooking = async (req, res) => {
    try {
        // We support ID as either Mongo _id or custom bookingId
        const query = req.params.id.startsWith('BOOK-') || req.params.id.startsWith('JUM-')
            ? { bookingId: req.params.id }
            : { _id: req.params.id };

        const booking = await Booking.findOne(query);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Ensure manager has rights to edit this resort
        if (req.user.role === 'manager' && !req.user.properties.includes(booking.resort)) {
            return res.status(403).json({ message: 'Not authorized to update this property' });
        }

        const updatedBooking = await Booking.findOneAndUpdate(
            query,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedBooking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getBookings,
    createBooking,
    getBookingById,
    updateBooking
};
