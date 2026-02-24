const Offer = require('../models/Offer');

const getOffers = async (req, res) => {
    try {
        const offers = await Offer.find({ active: true });
        res.json(offers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createOffer = async (req, res) => {
    try {
        const newOffer = new Offer(req.body);
        const savedOffer = await newOffer.save();
        res.status(201).json(savedOffer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getOffers,
    createOffer
};
