const express = require('express');
const router = express.Router();
const controller = require('../controllers/quotationController');

// Template Routes
router.post('/templates', controller.createTemplate);
router.get('/templates', controller.getTemplates);

// Quotation Routes
router.post('/', controller.createQuotation);
router.get('/', controller.getQuotations);
router.get('/:id', controller.getQuotationById);


// ❌ JANGAN AKTIFKAN INI KALAU BELUM ADA FUNGSI DI CONTROLLER
// router.get('/:id', controller.getQuotationById);
// router.patch('/:id/status', controller.updateStatus);
// router.post('/:id/convert', controller.convertToSalesOrder);

module.exports = router;
