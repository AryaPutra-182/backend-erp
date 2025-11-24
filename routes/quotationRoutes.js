const express = require('express');
const router = express.Router();
const controller = require('../controllers/quotationController');

// Template Routes
router.post('/templates', controller.createTemplate);
router.get('/templates', controller.getTemplates);

// Quotation Routes
router.post('/', controller.createQuotation);
router.get('/', controller.getQuotations);

module.exports = router;