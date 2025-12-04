const express = require('express');
const router = express.Router();
const controller = require('../controllers/purchaseController');

router.post('/', controller.createPurchaseOrder);
router.get('/', controller.getAllPO);
router.post('/:id/receive', controller.receiveProducts); 
router.get('/:id', controller.getPurchaseOrderById);

module.exports = router;