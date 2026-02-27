const express = require('express');
const router = express.Router();
const { getBookings, createBooking, getBookingById, updateBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getBookings)
    .post(createBooking);

router.route('/:id')
    .get(protect, getBookingById)
    .put(protect, updateBooking);

module.exports = router;
