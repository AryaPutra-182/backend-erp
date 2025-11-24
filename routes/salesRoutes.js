const express = require('express');
const router = express.Router();
const controller = require('../controllers/salesController');

router.post('/', controller.createSalesOrder);
router.post('/:id/confirm', controller.confirmSales); // Trigger potong stok

module.exports = router;