const express = require("express");
const router = express.Router();
const controller = require("../controllers/manufacturingController");

router.post("/mo", controller.createMO);

router.post("/allocate/:id", controller.allocateMaterial);

router.get("/availability/:id", controller.checkAvailability);

router.post("/start/:id", controller.startProduction);

router.post("/consume/:id", controller.consumeMaterial);

router.post("/complete/:id", controller.completeMO);

module.exports = router;
