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
        const resortNames = {
            'limuru': 'Jumuia Limuru Country Home',
            'kanamai': 'Jumuia Kanamai Beach Resort',
            'kisumu': 'Jumuia Hotel Kisumu'
        };

        const bookingData = { ...req.body };

        // Ensure bookingId exists
        if (!bookingData.bookingId) {
            bookingData.bookingId = `JUM-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
        }

        // Ensure resortName exists
        if (!bookingData.resortName && bookingData.resort) {
            bookingData.resortName = resortNames[bookingData.resort] || 'Jumuia Resort';
        }

        // Map guestName/firstName/lastName/fullName
        if (!bookingData.firstName && bookingData.guestName) {
            const parts = bookingData.guestName.split(' ');
            bookingData.firstName = parts[0] || 'Guest';
            bookingData.lastName = parts.slice(1).join(' ') || 'Guest';
            bookingData.fullName = bookingData.guestName;
        } else if (!bookingData.fullName && bookingData.firstName && bookingData.lastName) {
            bookingData.fullName = `${bookingData.firstName} ${bookingData.lastName}`;
        } else if (!bookingData.fullName) {
            bookingData.firstName = bookingData.firstName || 'Guest';
            bookingData.lastName = bookingData.lastName || 'Guest';
            bookingData.fullName = 'Guest User';
        }

        // Handle flat guests object vs nested
        if (bookingData.adults !== undefined || bookingData.children !== undefined) {
            bookingData.guests = {
                adults: parseInt(bookingData.adults) || 1,
                children: parseInt(bookingData.childrenCount) || parseInt(bookingData.children) || 0
            };
        }

        // Build guestName if not provided
        if (!bookingData.guestName && bookingData.fullName) {
            bookingData.guestName = bookingData.fullName;
        }

        const newBooking = new Booking(bookingData);
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
