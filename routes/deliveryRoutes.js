const express = require('express');
const router = express.Router();
const controller = require('../controllers/deliveryController');

router.get('/:id', controller.getDeliveryDetail);

// Action Buttons
router.post('/:id/check', controller.checkAvailability);
router.post('/:id/validate', controller.validateDelivery);

module.exports = router;