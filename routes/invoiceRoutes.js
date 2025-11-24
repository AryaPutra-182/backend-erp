const express = require('express');
const router = express.Router();
const controller = require('../controllers/invoiceController');

router.post('/', controller.createInvoiceFromSO);
router.get('/:id', controller.getInvoiceDetail);
router.post('/:id/pay', controller.registerPayment);

module.exports = router;