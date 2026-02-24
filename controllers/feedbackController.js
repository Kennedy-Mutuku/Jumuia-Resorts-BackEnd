const Feedback = require('../models/Feedback');

const getFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.find({ status: 'approved' }).sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createFeedback = async (req, res) => {
    try {
        const newFeedback = new Feedback(req.body);
        const savedFeedback = await newFeedback.save();
        res.status(201).json(savedFeedback);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getFeedback,
    createFeedback
};
