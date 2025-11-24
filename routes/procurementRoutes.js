const express = require('express');
const router = express.Router();
const controller = require('../controllers/procurementController');
const upload = require('../middleware/upload');

// Upload Multiple Files untuk Vendor (NPWP & SIUP)
const vendorUploads = upload.fields([
    { name: 'uploadNPWP', maxCount: 1 },
    { name: 'uploadSIUP', maxCount: 1 }
]);

router.post('/vendors', vendorUploads, controller.createVendor);
router.get('/vendors', async (req, res) => res.json(await require('../models').Vendor.findAll()));

router.post('/rfq', controller.createRFQ);
router.post('/po', controller.createPO);

module.exports = router;