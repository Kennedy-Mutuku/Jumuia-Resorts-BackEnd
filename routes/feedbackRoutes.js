const express = require('express');
const router = express.Router();
const { getFeedback, createFeedback, updateFeedback, deleteFeedback } = require('../controllers/feedbackController');

router.route('/')
    .get(getFeedback)
    .post(createFeedback);

router.route('/:id')
    .put(updateFeedback)
    .delete(deleteFeedback);

module.exports = router;
