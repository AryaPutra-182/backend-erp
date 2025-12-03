const router = require("express").Router();
const ctrl = require("../controllers/deliveryController");

router.post("/create-from-sales/:soId", ctrl.createFromSalesOrder);
router.get("/", ctrl.getAllDeliveryOrders);
router.get("/:id", ctrl.getDeliveryOrderById);
router.put("/:id/status", ctrl.updateStatus);
router.put("/item/:itemId", ctrl.updateItemQty);
router.post("/:id/validate", ctrl.validateDelivery);



module.exports = router;
