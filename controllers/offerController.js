const Offer = require('../models/Offer');

// @desc    Get all offers (filters by active status/resort via query)
// @route   GET /api/offers
const getOffers = async (req, res) => {
    try {
        const query = {};
        if (req.query.resort) query.resort = req.query.resort;
        if (req.query.active !== undefined) query.active = req.query.active === 'true';

        const offers = await Offer.find(query).sort({ createdAt: -1 });
        res.json(offers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new offer
// @route   POST /api/offers
const createOffer = async (req, res) => {
    try {
        const newOffer = new Offer(req.body);
        const savedOffer = await newOffer.save();
        res.status(201).json(savedOffer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update offer
// @route   PUT /api/offers/:id
const updateOffer = async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id);
        if (offer) {
            offer.title = req.body.title || offer.title;
            offer.description = req.body.description || offer.description;
            offer.discount = req.body.discount || offer.discount;
            offer.image = req.body.image || offer.image;
            offer.validUntil = req.body.validUntil || offer.validUntil;
            offer.resort = req.body.resort || offer.resort;
            offer.active = req.body.active !== undefined ? req.body.active : offer.active;

            const updatedOffer = await offer.save();
            res.json(updatedOffer);
        } else {
            res.status(404).json({ message: 'Offer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete offer
// @route   DELETE /api/offers/:id
const deleteOffer = async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id);
        if (offer) {
            await Offer.deleteOne({ _id: offer._id });
            res.json({ message: 'Offer removed' });
        } else {
            res.status(404).json({ message: 'Offer not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getOffers,
    createOffer,
    updateOffer,
    deleteOffer
};
