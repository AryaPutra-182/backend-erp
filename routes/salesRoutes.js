const express = require("express");
const router = express.Router();
const controller = require("../controllers/salesController");

router.get("/", controller.getAllSalesOrders);

router.post("/", controller.createSalesOrder);
router.post("/from-quotation/:id", controller.createFromQuotation);
router.post("/confirm/:id", controller.confirmSales);

module.exports = router;
