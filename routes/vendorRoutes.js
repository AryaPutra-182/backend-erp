const express = require('express');
const router = express.Router();
const controller = require('../controllers/vendorController');

router.post('/', controller.createVendor);
router.get('/', controller.getAllVendors);

module.exports = router;