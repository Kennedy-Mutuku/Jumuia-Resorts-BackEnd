const express = require('express');
const router = express.Router();
const { getFeedback, createFeedback } = require('../controllers/feedbackController');

router.route('/')
    .get(getFeedback)
    .post(createFeedback);

module.exports = router;
