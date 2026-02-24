const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        required: true,
        unique: true
    },
    resort: {
        type: String,
        required: true
    },
    roomType: {
        type: String,
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true
    },
    guests: {
        adults: { type: Number, default: 1 },
        children: { type: Number, default: 0 }
    },
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['mpesa', 'card', 'cash'],
        default: 'mpesa'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'awaiting_payment'],
        default: 'pending'
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    source: {
        type: String,
        default: 'website'
    }
}, {
    timestamps: true
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
