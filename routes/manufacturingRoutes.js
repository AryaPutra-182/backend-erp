const express = require("express");
const router = express.Router();

// 👇 UBAH INI: Sesuaikan dengan nama file controller yang ADA di folder Anda
// Jika file Anda bernama 'manufacturingController.js', tulis seperti ini:
const orderController = require("../controllers/manufacturingController"); 

// --- CEK APAKAH FUNGSI ADA (DEBUGGING) ---
console.log("Cek Fungsi createManufacturingOrder:", orderController.createManufacturingOrder); 
// Jika outputnya 'undefined', berarti nama fungsi di controller salah.

// Routes
router.post("/mo", orderController.createManufacturingOrder);
router.get("/mo", orderController.getManufacturingOrders);
router.get('/mo/:id', orderController.getManufacturingOrderById);
router.post("/allocate/:id", orderController.allocateStock);

module.exports = router;