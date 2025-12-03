const router = require("express").Router();
const invoiceController = require("../controllers/invoiceController");

// HARUS SAMA DENGAN FRONTEND ↓↓↓
router.post("/from-delivery/:id", invoiceController.createFromDelivery);

router.put("/:id/validate", invoiceController.validateInvoice);
router.get("/", invoiceController.getAllInvoices);
router.get("/:id", invoiceController.getInvoiceById);
router.put('/:id/pay', invoiceController.updatePaymentStatus);

module.exports = router;
