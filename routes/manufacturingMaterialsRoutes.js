const express = require("express");
const router = express.Router();

const {
  createManufacturingOrder,
  getAllManufacturingOrders,
  getManufacturingOrderByReference
} = require("../controllers/manufacturingMaterialsController");

router.post("/", createManufacturingOrder);
router.get("/", getAllManufacturingOrders);
router.get("/:ref", getManufacturingOrderByReference);

module.exports = router;
