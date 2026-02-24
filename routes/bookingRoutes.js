const express = require('express');
const router = express.Router();
const { getBookings, createBooking, getBookingById } = require('../controllers/bookingController');

router.route('/')
    .get(getBookings)
    .post(createBooking);

router.route('/:id')
    .get(getBookingById);

module.exports = router;
