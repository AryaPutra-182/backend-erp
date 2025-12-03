const express = require("express");
const router = express.Router();
const controller = require("../controllers/salesController");

router.get("/", controller.getAllSalesOrders);

router.post("/", controller.createSalesOrder);
router.post("/from-quotation/:id", controller.createFromQuotation);
router.post("/:id/confirm", controller.confirmSales);
router.get("/:id", controller.getSalesOrderById);


module.exports = router;
