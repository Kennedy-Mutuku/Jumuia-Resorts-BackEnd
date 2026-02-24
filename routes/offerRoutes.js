const express = require('express');
const router = express.Router();
const { getOffers, createOffer } = require('../controllers/offerController');

router.route('/')
    .get(getOffers)
    .post(createOffer);

module.exports = router;
