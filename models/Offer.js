const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    discount: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    validUntil: {
        type: String,
        required: true
    },
    resort: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;
