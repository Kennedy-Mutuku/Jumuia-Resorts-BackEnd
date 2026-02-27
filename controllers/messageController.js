const Message = require('../models/Message');

// @desc    Get all messages
// @route   GET /api/messages
// @access  Public
const getMessages = async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get single message
// @route   GET /api/messages/:id
// @access  Public
const getMessageById = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);
        if (message) {
            res.json(message);
        } else {
            res.status(404).json({ message: 'Message not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create a message
// @route   POST /api/messages
// @access  Public
const createMessage = async (req, res) => {
    try {
        const message = new Message({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phone: req.body.phone,
            resort: req.body.resort,
            subject: req.body.subject,
            message: req.body.message,
            ip: req.body.ip,
            userAgent: req.body.userAgent,
            pageUrl: req.body.pageUrl,
            status: 'new',
            read: false,
            responded: false,
            submittedAt: req.body.submittedAt ? new Date(req.body.submittedAt) : new Date()
        });

        const createdMessage = await message.save();
        res.status(201).json(createdMessage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update a message (e.g., mark as read/responded)
// @route   PUT /api/messages/:id
// @access  Private
const updateMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);

        if (message) {
            message.status = req.body.status || message.status;
            message.read = req.body.read !== undefined ? req.body.read : message.read;
            message.responded = req.body.responded !== undefined ? req.body.responded : message.responded;

            const updatedMessage = await message.save();
            res.json(updatedMessage);
        } else {
            res.status(404).json({ message: 'Message not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
const deleteMessage = async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);

        if (message) {
            await Message.deleteOne({ _id: message._id });
            res.json({ message: 'Message removed' });
        } else {
            res.status(404).json({ message: 'Message not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getMessages,
    getMessageById,
    createMessage,
    updateMessage,
    deleteMessage
};
