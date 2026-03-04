const express = require('express');
const router = express.Router();
const {
    getOffers,
    createOffer,
    deleteOffer,
    claimOffer,
    getClaims,
    updateClaimStatus
} = require('../controllers/offerController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .get(getOffers)
    .post(protect, admin, createOffer);

router.post('/claim', claimOffer); // Public

router.get('/claims', protect, admin, getClaims);
router.put('/claims/:id', protect, admin, updateClaimStatus);

router.route('/:id')
    .delete(protect, admin, deleteOffer);

module.exports = router;
