const express = require('express');
const router = express.Router();
const { getOffers, createOffer, updateOffer, deleteOffer } = require('../controllers/offerController');

router.route('/')
    .get(getOffers)
    .post(createOffer);

router.route('/:id')
    .put(updateOffer)
    .delete(deleteOffer);

module.exports = router;
