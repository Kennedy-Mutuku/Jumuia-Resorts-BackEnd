const express = require('express');
const router = express.Router();
const { getMessages, getMessageById, createMessage, updateMessage, deleteMessage } = require('../controllers/messageController');

router.route('/')
    .get(getMessages)
    .post(createMessage);

router.route('/:id')
    .get(getMessageById)
    .put(updateMessage)
    .delete(deleteMessage);

module.exports = router;
